import Status from "./Status";
import { BattleInfo, MemberObject } from "./BattleObjects";
import { Script, Scripts } from "./Script";
import moveInfo from './MoveInfo';

const convertPSStat: { [stat: string]: string } = {
    "accuracy": "ACCURACY",
    "evasiveness": "EVASION",
    "atk": "ATTACK",
    "def": "DEFENSE",
    "spa": "SPCL.ATK",
    "spd": "SPCL.DEF",
    "spe": "SPEED"
};

type Effectiveness = "supereffective" | "resisted" | "immune";

function getIsPlayer(name: string): boolean {
    return name[1] === "1";
}

function getSimulatorName(name: string): string {
    return name.substring(name.indexOf(" ") + 1);
}

function getName(name: string): string {
    return name.substring(name.indexOf(" ") + 2);
}

function getTextName(name: string): string {
    return (name[1] === "2" ? "Enemy " : "") + getName(name);
}

function getStatus(status: string): Partial<Status> {
    const result: Partial<Status> = { hp: 0, condition: "" };
    if (status.includes(" ")) {
        const [ health, cond ] = status.split(" ");
        if (health == null) {
            throw new Error(`BattleScript.getStatus: unexpected status, ${status}`);
        }
        status = health;
        result.condition = cond;
    }
    if (status.includes("/")) {
        const [ hp, maxHp ] = status.split("/");
        if (hp == null || maxHp == null) {
            throw new Error(`BattleScript.getStatus: unexpected hp, ${status}`);
        }
        result.hp = Number.parseInt(hp);
        result.maxHp = Number.parseInt(maxHp);
    }
    return result;
}

function getFrom(from: string | null) {
    if (from?.startsWith("[from] ")) {
        return from.replace("[from] ", "");
    }
    return "";
}

function getOf(ofText: string) {
    if (ofText.startsWith("[of] ")) {
        return getTextName(ofText.replace("[of] ", ""));
    }
    return "";
}

function paralysisAnim(isPlayer: boolean): Script {
    const [x, y] = isPlayer
        ?  [40, 76 + 20]
        : [128, 40 + 16];
    return [
        { do: "WAIT", frames: 24 },
        { do: "PARTICLE", type: "Paralysis", args: [x - 32, y - 20, 1] },
        { do: "PARTICLE", type: "Paralysis", args: [x + 20, y - 20, -1] },
        { do: "WAIT", frames: 120 }
    ];
}

function confuseAnim(isPlayer: boolean): Script {
	const [x, y] = isPlayer
		? [40, 42]
		: [128, 8];
    return [
        { do: "WAIT", frames: 24 },
        { do: "SFX", name: "confused" },
        { do: "PARTICLE", type: "Bird", args: [x, y, 0]},
        { do: "PARTICLE", type: "Bird", args: [x, y, 1]},
        { do: "PARTICLE", type: "Bird", args: [x, y, 2]},
        { do: "WAIT", frames: 90 + 24}
    ];
}

function freezeAnim(isPlayer: boolean): Script {
    const [x, y] = isPlayer
        ? [ 12, 104 ]
        : [ 160 - 32 - 24, 32 + 36 ];
    return [
        {do: "WAIT", frames:30},
        {do: "PARTICLE", type:"IceWall", args: [x, y, 60] },
        {do: "SFX", name: "frz"},
        {do: "WAIT", frames:30},
        {do: "SFX", name: "frz"},
        {do: "WAIT", frames:30}
    ];
}

function poisonAnim(isPlayer: boolean): Script {
	const [x, y] = isPlayer
		? [40, 42]
		: [128, 8];
	return [
        {do:"PARTICLE",type:"Static", args: [x - 8, y, "SKULL", 12]}, 
        { do: "WAIT", frames: 12 },
        {do:"PARTICLE",type:"Static", args: [x + 8, y, "SKULL", 12]},
        { do: "WAIT", frames: 12 }
	];
}

interface State {
    // name given to the fighter
    name?: string;
    // name of the trainer
    trainerName?: string;
    index?: number;
    substituted?: boolean;
    // if true, skip turn
    passing?: boolean;
    fainted?: boolean;
}

class BattleScript {
    
    private battleInfo: BattleInfo;

    private stream: string[][] = [];

    private moveResults: { effectiveness?: Effectiveness, crit: boolean, substitute: boolean } = 
        { effectiveness: undefined, crit: false, substitute: false };

    private playerState: State = {};
    private opponentState: State = {};
    private weather: string | null = null;
    private waitPlayerSwitchUntilOpponentFaints: boolean = false;

    private introduction: 
        ((playerSwitch: Script) => (opponentSwitch: Script) => Script) |
        ((opponentSwitch: Script) => Script) |
        Script;

    constructor(battleInfo: BattleInfo, private debug: boolean = false) {
        if (debug) {
            console.log("BattleScript.constructor: initializing");
        }
        this.battleInfo = battleInfo;
        this.introduction = (playerSwitch: Script) => (opponentSwitch: Script) => 
        [
            // "SHOW_TEXTBOX",
            [
                "SLIDE_IN_TRAINERS",
                "SHOW_PLAYER_TEAM_STATUS",
                "SHOW_OPPONENT_TEAM_STATUS",
                { do: "TEXT", text: [this.battleInfo.info.opponent.name, "wants to battle!"] },
                "CLEAR_TEXT",
                "HIDE_PLAYER_TEAM_STATUS",
                "HIDE_OPPONENT_TEAM_STATUS",
                "SLIDE_OUT_OPPONENT_TRAINER",
            ],
            opponentSwitch,
            { do: "WAIT", frames: 10 },
            "SLIDE_OUT_PLAYER_TRAINER",
            playerSwitch,
            // OPTIONS
        ];
    }

    private getState(isPlayer: boolean) {
        return isPlayer ? this.playerState : this.opponentState;
    }

    load(chunk: string) {
        if (this.debug) {
            console.log("BattleScript.load:");
            console.log(chunk);
        }
        chunk.split("\n").forEach(x => this.stream.push(x.split("|")));
    }

    buildAll(): Script | null {
        const script: Script[] = [];
        while (this.stream.length > 0) {
            const command = Scripts.flatten(this.build());
            if (this.debug) {
                console.log("BattleScript.buildAll:")
                console.log(JSON.stringify(command));
            }
            script.push(command);
        }
        return script;
    }

    build(): Script {
        if (this.stream.length === 0) return null;
        while (this.stream.length > 0) {
            const action = this.stream.shift()!;
            switch (action[1]) {
                case "move":
                    return this.handleMove(action);
                case "-anim":
                    return this.handleMove(action);
                case "faint":
                    return this.handleFaint(action);
                case "switch":
                    let event = this.handleSwitch(action);
                    if (typeof this.introduction === "function") {
                        this.introduction = this.introduction(event);
                        if (typeof this.introduction !== "function") {
                            event = this.introduction;
                            this.introduction = null;
                        } else {
                            break;
                        }
                    }
                    return event;
                case "drag":
                    return this.handleSwitch(action, true);
                case "cant":
                    return this.handleCant(action);
                case "win":
                    return this.handleWin(action);
                case "-supereffective":
                    this.moveResults.effectiveness = "supereffective";
                    break;
                case "-resisted":
                    this.moveResults.effectiveness = "resisted";
                    break;
                case "-immune":
                    // this.moveResults.effectiveness = "immune";
                    return [
                        { do: "SFX", name: "hitresisted" },
                        { do: "WAIT", frames: 30 },
                        { do: "TEXT", text: ["The move had no", "effect."] }
                    ];
                case "-crit":
                    this.moveResults.crit = true;
                    break;
                case "-prepare":
                    if (["Fly", "Skull Bash", "Solar Beam"].includes(action[3])) {
                        if (action[3] === "Solar Beam" && this.weather === "SunnyDay") {
                            break;
                        }
                        if (getIsPlayer(action[2]!)) {
                            this.playerState.passing = true;
                        } else {
                            this.opponentState.passing = true;
                        }
                    }
                    break;
                case "-activate": return this.handleActivate(action);
                case "-damage": return this.handleDamage(action);
                case "-start": return this.handleStart(action);
                case "-sidestart": return this.handleSidestart(action);
                case "-sideend": return this.handleSideend(action);
                case "-end": return this.handleEnd(action);
                case "-status": return this.handleStatus(action);
                case "-curestatus": return this.handleCureStatus(action);
                case "-heal": return this.handleHeal(action);
                case '-boost': return this.handleBoost(action, true);
                case "-unboost": return this.handleBoost(action, false);
                case "-setboost": return this.handleSetBoost(action);
                case "-singleturn": return this.handleSingleTurn(action);
                case "-singlemove": return this.handleSingleMove(action);
                case "-weather": return this.handleWeather(action);
                case "-mustrecharge": 
                    if (getIsPlayer(action[2]!)) {
                        this.playerState.passing = true;
                    } else {
                        this.opponentState.passing = true;
                    }
                    break;
                case "turn": // TODO: use this to go to options?
                    if (this.playerState.passing) {
                        this.playerState.passing = false;
                        return "PASS";
                    }
                    return "OPTIONS";
                case "player":
                    if (getIsPlayer(action[2]!)) {
                        this.playerState.trainerName = action[3];
                    } else {
                        this.opponentState.trainerName = action[3];
                    }
                    break;
                // ignore these messages
                case "":
                case "-miss":
                case "-fail":
                case "t:":
                case "gametype":
                case "teamsize":
                case "gen":
                case "tier":
                case "rule":
                case "start":
                case "upkeep":
                    break;
                default:
                    console.warn("Unhandled: ", action);
            }
        }
        return null;
    }
    
    private handleMove(action: string[]): Script {
        this.moveResults = { effectiveness: undefined, crit: false, substitute: false };
        if (action[3] == null) {
            throw new Error(`BattleScript.handleMove: unexpected move, ${JSON.stringify(action)}`);
        }
        let move = action[3].toUpperCase();
        if (move.length > 12) move = move.replace(" ", "");
        if (action[2] == null) {
            throw new Error(`BattleScript.handleMove: unexpected name, ${JSON.stringify(action)}`);
        }
        const name = getTextName(action[2]);
        const isPlayer = action[2][1] === "1";
        const miss = action[5] === "[miss]";
        const still = action[5] === "[still]";
        const actualMove = move + (still ? "_STILL" : "");
        const fail = (this.stream[0] == null) ? false 
            : ((this.stream[0][1] === "-fail") ||
            // for SLEEP TALK, if nothing happens and the opponent starts their
            // move, consider that a failure. 
            (this.stream[0][1] === "move" && this.stream[0][2] !== action[2]));

        const text = (moveInfo as any)[actualMove]?.text || `used ${move}`;
        return [
            { do: "TEXT", text: [name, `${text}!`], auto: true },
            miss ? [
                {do:"WAIT",frames:60},
                isPlayer ? "SHOW_PLAYER" : "SHOW_OPPONENT",
                {do:"TEXT",text:[`${name}'s`, 'attack missed!']}
            ] : fail ? [
                {do:"WAIT",frames:60},
                {do:"TEXT",text:["But it failed!"]}
            ] : this.performMove(actualMove, isPlayer)
        ];
    }

    private performMove(move: string, isPlayer: boolean): Script {
        const substituted = this.getState(isPlayer).substituted;
        return [
            isPlayer 
                ? "HIDE_PLAYER_STATS"
                : "HIDE_OPPONENT_STATS",
            {do:"WAIT",frames:16},
            substituted ? {do:"EFFECT",name:"SUBSTITUTE_LEAVE",isPlayer} : null,
            // pre anim
            { do: "EFFECT", name:move+"_PRE", isPlayer },
            {do:"MOVE_SFX",move,isPlayer},
            {do:"EFFECT",name:move,isPlayer},
            {do:"WAIT",frames:16},
            substituted ? {do:"EFFECT",name:"SUBSTITUTE_ENTER",isPlayer} : null,
            isPlayer 
                ? "SHOW_PLAYER_STATS"
                : "SHOW_OPPONENT_STATS",
            // post anim
            { do: "EFFECT", name:move+"_POST", isPlayer },
            isPlayer && move === "BATON PASS" ? 
                "FORCE_PLAYER_SWITCH" : null
        ];
    }

    private effectiveness(): Script {
        const effectMessage: { [Key in Effectiveness]: string[] } = {
            "supereffective": ["It's super-", "effective!"],
            "resisted": ["It's not very", "effective..."],
            "immune": ["The move had no", "effect."]
        };
        return [
            this.moveResults.crit ? { do: "TEXT", text: ["A critical hit!"] } : null,
            this.moveResults.effectiveness && 
                { do: "TEXT", text: effectMessage[this.moveResults.effectiveness] }
        ];
    }

    private handleBoost(action: string[], direction: boolean): Script {
        if (action[2] == null || action[3] == null || action[4] == null) {
            throw new Error(`BattleScript.handleBoost: unexpected, ${JSON.stringify(action)}`);
        }
        const amount = Number.parseInt(action[4]);
        const target = getTextName(action[2]);
        const statTxt = convertPSStat[action[3]];

        if (Math.abs(amount) < 0.1) {
            const message = [
                 `${target}'s`, 
                 `${statTxt} won't`, direction ? "rise anymore!" : "drop anymore!" 
            ];
            return [
                { do: "WAIT", frames: 60 },
                { do: "TEXT", text: message }
            ];
        }
        const message = amount > 1
            ? [`${target}'s`, `${statTxt}`, `${direction ? 'went way up' : 'sharply fell' }!`]
            : [`${target}'s`, `${statTxt} ${direction ? 'went up' : 'fell' }!`];
        return { do: "TEXT", text: message };
    }

    private handleSetBoost(action: string[]): Script {
        if (action[2] == null || action[5] == null) {
            throw new Error(`BattleScript.handleSetBoost: unexpected, ${JSON.stringify(action)}`);
        }
        const name = getTextName(action[2]);
        switch (getFrom(action[5])) {
            case "move: Belly Drum":
                return { do: "TEXT", text: [name, "cut its HP and", "maximized ATTACK!"] };
            default:
                console.error("Unhandled:", action);
        }
        return [];
    }

    private handleFaint(action: string[]): Script {
        if (action[2] == null) {
            throw new Error(`BattleScript.handleFaint: unexpected, ${JSON.stringify(action)}`);
        }
        const name = getName(action[2]);
        const isPlayer = getIsPlayer(action[2]);
        
        if (isPlayer) {
            // Both fainted, but we fainted first.
            const next = this.stream[0];
            this.waitPlayerSwitchUntilOpponentFaints = isPlayer && next != null && 
                // opponent faints due to destiny bond
                ((next[1] === "-activate" && next[3] === "move: Destiny Bond") ||
                // opponent faints at all
                 (next[1] === "faint"))
                && !this.opponentState.fainted;

            this.playerState.fainted = true;
            if (this.playerState.index == null) {
                throw new Error("BattleScript.handleFaint: playerState.index is undefined");
            }
            return [
                { do: "HEALTH", isPlayer: true, hp: 0, skipAnimation: true },
                { do: "WAIT", frames: 20 },
                { do: "CRY", isPlayer: true, index: this.playerState.index },
                { do: "SHADER", isPlayer: true, name: "faint", steps: 15, delay: 1 },
                "HIDE_PLAYER_STATS",
                "HIDE_PLAYER",
                { do: "TEXT", text: [name, "fainted!"] },
                this.waitPlayerSwitchUntilOpponentFaints ? null : "FORCE_PLAYER_SWITCH"
            ];
        }
        const playerSwitch = this.waitPlayerSwitchUntilOpponentFaints ? "FORCE_PLAYER_SWITCH" : null;
        this.waitPlayerSwitchUntilOpponentFaints = false;
        return [
            { do: "HEALTH", isPlayer: false, hp: 0, skipAnimation: true },
            { do: "WAIT", frames: 20 },
            { do: "SFX", name: "faint" },
            { do: "SHADER", isPlayer: false, name: "faint", steps: 15, delay: 1 },
            "HIDE_OPPONENT_STATS",
            "HIDE_OPPONENT",
            { do: "TEXT", text: [name, "fainted!"] },
            playerSwitch
        ];
    }

    private handleWin(action: string[]): Script {
        if (action[2] === this.playerState.trainerName) {
            return [
                { do: "TEXT", text: [ this.opponentState.trainerName!, "was defeated!" ] },
                "PLAY_VICTORY_MUSIC",
                "SLIDE_IN_OPPONENT_TRAINER",
                { do: "TEXT", text: [ "I won't lose next", "time, all right?" ] }
            ];
        } else {
            return [
                "TOGGLE_GRAY_SCALE",
                { do: "TEXT", text: [ 
                    `${this.playerState.trainerName} is out of`, 
                    "useable members!"
                ] },
                { do: "TEXT", text: [ `${this.playerState.trainerName} whited`, "out!"], auto: true }
            ];
        }
    }

    /* 
        Find the member associated with the given simulator name.
    */
    private findMember(team: MemberObject[], simulatorName: string): number {
        return team.findIndex((member, index) => 
            simulatorName === index.toString() + member.name
        );
    }

    sendOutPlayer(name: string, index: number, status: Partial<Status>, 
        altText: boolean): Script
    {
        this.playerState.fainted = false;
        this.playerState.index = index;
        this.playerState.name = name;
        return [
            {do:"SET_STATUS", isPlayer: true, status},
            {do:"SET_PLAYER", index},
            "HIDE_PLAYER_STATS",
            {do:"TEXT", text: altText ? ['Go for it,', `${name}!`] : [`Go! ${name}!`], auto:true},
            {do:"WAIT", frames:24},
            {do:"SFX", name:"ballpoof"},
            {do:"PARTICLE", type:"Open", args:[36, 80]},
            "SHOW_PLAYER",
            {do:"SHADER", isPlayer:true, name: "plyAppear", steps: 4, delay: 5},
            {do:"WAIT", frames:8},
            {do:"CRY", isPlayer:true, index },
            {do:"WAIT", frames:16},
            "SHOW_PLAYER_STATS"
        ];
    }

    sendOutOpponent(name: string, index: number, status: Partial<Status>): Script 
    {
        this.opponentState.name = name;
        this.opponentState.index = index;
        return [
            {do:"SET_STATUS", isPlayer: false, status},
            {do:"WAIT",frames:10},
            {do:"SET_OPPONENT",index},
            "HIDE_OPPONENT_STATS",
            {do:"TEXT",text: [
                `${this.battleInfo.info.opponent.name}`, 
                "sent out", 
                `${name}!`
            ], auto: true},
            {do:"WAIT",frames:24},
            {do:"SFX",name:"ballpoof"},
            {do:"PARTICLE",type:"Open", args: [136 - 8, 64 - 16]},
            {do:"WAIT",frames:6},
            "SHOW_OPPONENT",
            {do:"SHADER", isPlayer:false, name: "oppAppear", steps: 3, delay: 5},
            // TODO: switch music
            {do:"WAIT",frames:8},
            {do:"CRY", isPlayer: false, index},
            {do:"ANIMATE", index },
            "SHOW_OPPONENT_STATS"
        ];
    }

    private handleSwitch(action: string[], altText: boolean = false): Script {
        if (action[2] == null || action[3] == null || action[4] == null) {
            throw new Error(`BattleScript.handleSwitch: unexpected, ${JSON.stringify(action)}`);
        }
        const simulatorName = getSimulatorName(action[2]);
        const name = getName(action[2]);
        const status = getStatus(action[4]);
        if (action[2][1] === "1") {
            const index = this.findMember(this.battleInfo.info.player.team, simulatorName);
            return this.sendOutPlayer(name, index, status, this.playerState.fainted || altText);
        } 
        const index = this.findMember(this.battleInfo.info.opponent.team, simulatorName);
        return this.sendOutOpponent(name, index, status);
/*
            const resume = Do()
          .HideOpponentTeamStatus()
          .Wait(10)
          .SendOutOpponent(nextMember, this.oppMemberSprite)
          .Then(() => {
            if (game.replacePlayerMember) {
              game.runEvent(Do().SwitchPlayer().Then(endOfMove));
            }
          })
          .HandlePoison(this.playerMember, endOfMove)
          .Then(endOfMove);

        const switchOut = this.plyInfo.team.length > 1
          ? Do().Text([`${this.oppInfo.name}`, "is about to use", `${nextMember.name}.`])
                .Text([`Will ${this.plyInfo.name}`, "change members?"])
                .Then(() => game.showYesNo(resume))
          : resume;

        this.runEvent(Do().Then(faint)
          // TODO: gain EXP (toggle?)
          .ShowOpponentTeamStatus()
          .Then(() => this.opponentMember = nextMember)
          .Then(switchOut));*/
    }

    private handleCant(action: string[]): Script {
        if (action[2] == null) {
            throw new Error(`BattleScript.handleCant: unexpected, ${JSON.stringify(action)}`);
        }
        const name = getTextName(action[2]);
        const isPlayer = getIsPlayer(action[2]);
        switch (action[3]) {
            case "recharge":
                return [
                    {do:"TEXT",text:[`${name}`, "must recharge!"]}
                ]
            case "par":
                return [
                    {do:"TEXT",text:[`${name}'s`, "fully paralyzed!"]}
                ];
            case "slp":
                return [
                    {do:"TEXT",text:[name, "is fast asleep!"]},
                    {do:"EFFECT",name:"SLEEP",isPlayer}
                ];
            case "frz":
                return [
                    {do:"TEXT",text:[name, "is frozen solid!"]}
                ];
            default:
                console.error("Unhandled:", action);
        }
        return [];
    }

    private handleActivate(action: string[]): Script {
        if (action[2] == null) {
            throw new Error(`BattleScript.handleActivate: unexpected, ${JSON.stringify(action)}`);
        }
        const name = getTextName(action[2]);
        const isPlayer = getIsPlayer(action[2]);
        const otherName = isPlayer ? "Enemy " + this.opponentState.name : this.playerState.name;
        switch(action[3]) {
            case "move: Destiny Bond":
                return {
                    do: "TEXT", text: [name, "took down with it,", `${otherName}!`]
                }
            case "Protect":
                return {
                    do: "TEXT", text: [`${name}'s`, "PROTECTING itself!"]
                }
            case "move: Beat Up":
                if (action[4] == null) {
                    throw new Error(`BattleScript.handleActivate: Beat Up has no attacker, ${JSON.stringify(action)}`);
                }
                const attacker = getTextName(action[4]);
                return [
                    {do:"TEXT",text:[`${attacker}'s`, "attack!"]},
                    this.performMove("TACKLE", isPlayer)
                ];
            case "move: Substitute":
                return {do:"TEXT",text:["The SUBSTITUTE", "took damage for",`${name}!`]};
            case "confusion":
                return [
                    {do:"TEXT",text:[name, 'is confused!']},
                    confuseAnim(getIsPlayer(action[2]))
                ];
            default:
                console.error("Unhandled:", action);
        }
        return [];
    }

    private handleDamage(action: string[]): Script {
        if (action[2] == null || action[3] == null) {
            throw new Error(`BattleScript.handleDamage: unexpected, ${JSON.stringify(action)}`);
        }
        const name = getTextName(action[2]);
        const isPlayer = getIsPlayer(action[2]);
        const status = getStatus(action[3]);
        if (action[4] == null) {
            if (status.hp == null) {
                throw new Error("BattleScript.handleDamage: status.hp is undefined");
            }
            if (this.moveResults.substitute) {
                return { do: "HEALTH", isPlayer, hp: status.hp };
            }
            return [
                { do: "SFX", name: "hit" + (this.moveResults.effectiveness || "") },
                isPlayer ? "SCREEN_SHAKE" : { do: "EFFECT", name: "FLICKER", isPlayer: false },
                { do: "HEALTH", isPlayer, hp: status.hp },
                this.effectiveness()
            ];
        }
        const from = getFrom(action[4]);
        let event: Script = null;
        switch (from) {
            case "confusion":
                const [x, y] = isPlayer ? [36, 72] : [160-32, 32];
                event = [
                    {do:"TEXT",text:["It hurt itself in", "its confusion!"]},
                    {do:"WAIT",frames:32},
                    {do:"SFX",name:"confused_hit"},
                    {do:"PARTICLE",type:"Static",args:[x,y, "BOOM_MED", 12]},
                    {do:"WAIT",frames:36}
                ];
                break;
            case "brn":
                event = [
                    {do:"TEXT",text:[`${name}'s`, "hurt by its burn!"], auto: true},
                    {do: "SFX", name: "brn"},
                    { do: "EFFECT", name: "BURNED", isPlayer }
                ];
                break;
            case "psn":
                event = [
                    {do:"TEXT",text:[name, "is hurt by poison!"] },
                    {do: "SFX", name: "psn"},
                    poisonAnim(isPlayer),
                    {do:"WAIT",frames:36}
                ];
                break;
            case "Curse":
                // TODO: curse ghost effect
                event = [
                    { do: "TEXT", text: [`${name}'s`, "hurt by the CURSE!"] }
                ];
                break;
            case "Leech Seed":
                // TODO: leech seed effect
                event = [
                    { do: "TEXT", text: ["LEECH SEED saps", `${name}!`] }
                ];
                break;
            case "Spikes":
                event = [
                    { do: "TEXT", text: [`${name}'s`, `hurt by SPIKES!`] }
                ];
                break;
            default:
                console.error("Unhandled:", action);
        }
        return [
            event,
            {do:"HEALTH", isPlayer, hp: status.hp!}
        ];
    }

    private handleStart(action: string[]): Script {
        if (action[2] == null) {
            throw new Error(`BattleScript.handleStart: unexpected, ${JSON.stringify(action)}`);
        }
        const condition = action[3];
        const name = getTextName(action[2]);
        const isPlayer = getIsPlayer(action[2]);
        switch (condition) {
            case "Future Sight":
                return { do: "TEXT", text: [name, "foresaw an attack!"] };
            case "Curse": {
                if (action[4] == null) {
                    throw new Error(`BattleScript.handleStart: curse is missing [of], ${JSON.stringify(action)}`);
                }
                return [
                    { do: "TEXT", text: [name, "cut its own HP and", "put a CURSE on", `${getOf(action[4])}!`] }
                ];
            } case "Encore":
                return { do: "TEXT", text: [ name, "got an ENCORE!" ] };
            case "Disable":
                const move = action[4];
                return { do: "TEXT", text: [ `${name}'s`, `${move} was`, "DISABLED!" ] };
            case "Substitute":
                this.moveResults.substitute = true;
                this.getState(isPlayer).substituted = true;
                return { do: "TEXT", text: [name, "made a SUBSTITUTE!"] };
            case "confusion":
                return [
                    confuseAnim(isPlayer),
                    { do: "TEXT", text: [name,"became confused!"] }
                ];
            case "move: Focus Energy":
                return {do:"TEXT", text: [`${name}'s`,"getting pumped!"]};
            case "move: Leech Seed":
                return {do:"TEXT", text: [name, "was seeded!"]};
            default:
                console.error("Unhandled:", action);
        }
        return [];
    }

    private handleSidestart(action: string[]): Script {
        if (action[2] == null) {
            throw new Error(`BattleScript.handleSidestart: unexpected, ${JSON.stringify(action)}`);
        }
        const isPlayer = getIsPlayer(action[2]);
        const reason = action[3];
        switch (reason) {
            case "Reflect":
                if (isPlayer) {
                    return { do: "TEXT", text: ["Your team is", "stronger against", "physical moves!"] };
                }
                return { do: "TEXT", text: [`${this.opponentState.trainerName}'s`, "team is stronger", "against physical", "moves!"] };
            case "move: Light Screen":
                if (isPlayer) {
                    return { do: "TEXT", text: ["Your team is", "stronger against", "special moves!"] };
                }
                return { do: "TEXT", text: [`${this.opponentState.trainerName}'s`, "team is stronger", "against special", "moves!"] };
            case "Spikes":
                return { do: "TEXT", text: ["SPIKES scattered", "all around", `${
                    isPlayer ? this.playerState.name : ("Enemy " + this.opponentState.name)
                }!`]}
            default:
                console.error("Unhandled:", action);
        }
        return [];
    }

    private handleSideend(action: string[]): Script {
        if (action[2] == null) {
            throw new Error(`BattleScript.handleSideend: unexpected, ${JSON.stringify(action)}`);
        }
        const isPlayer = getIsPlayer(action[2]);
        const reason = action[3];
        switch (reason) {
            case "Reflect":
                if (isPlayer) {
                    return { do: "TEXT", text: [`${this.playerState.name}'s`, "REFLECT faded!"] };
                }
                return { do: "TEXT", text: [`Enemy ${this.opponentState.name}'s`, "REFLECT faded!"] };
            case "move: Light Screen":
                if (isPlayer) {
                    return { do: "TEXT", text: [`${this.playerState.name}'s`, "LIGHT SCREEN faded!"] };
                }
                return { do: "TEXT", text: [`Enemy ${this.opponentState.name}'s`, "LIGHT SCREEN faded!"] };
            case "Spikes":
                if (isPlayer) {
                    // other player removed OUR spikes
                    return { do: "TEXT", text: [ `${this.playerState.name}`, "blew away SPIKES!"] };
                }
                return { do: "TEXT", text: [ `Enemy ${this.opponentState.name}`, "blew away SPIKES!"] };
            default:
                console.error("Unhandled:", action);
        }
        return [];
    }

    private handleEnd(action: string[]): Script {
        if (action[2] == null) {
            throw new Error(`BattleScript.handleEnd: unexpected, ${JSON.stringify(action)}`);
        }
        const name = getTextName(action[2]);
        const isPlayer = getIsPlayer(action[2]);
        switch(action[3]) {
            case "move: Future Sight":
                return [
                    { do: "TEXT", text: [name, "was hit by FUTURE", "SIGHT!"], }
                    // TODO: visual effect here
                ];
            case "Encore":
                return { do: "TEXT", text: [`${name}'s`, "ENCORE ended!"] };
            case "move: Disable":
                return {
                    do: "TEXT",
                    text: [ `${name}'s`, "disabled no more!" ]
                };
            case "Substitute":
                this.getState(isPlayer).substituted = false;
                return [
                    {do:"TEXT",text:[`${name}'s`, "SUBSTITUTE faded!"]}, 
                    {do:"EFFECT",name:"SUBSTITUTE_LEAVE",isPlayer},
                    this.effectiveness()
                ];
            case "confusion":
                return [
                    {do:"TEXT",text:[name, "is confused!"]},
                    confuseAnim(isPlayer),
                    {do:"TEXT",text:[name, "snapped out of it!"]}
                ];
            default:
                console.error("Unhandled:", action);
        }
        return [];
    }

    private handleSingleTurn(action: string[]): Script {
        if (action[2] == null) {
            throw new Error(`BattleScript.handleSingleTurn: unexpected, ${JSON.stringify(action)}`);
        }
        const name = getTextName(action[2]);
        switch(action[3]) {
            case "Protect":
                return {do:"TEXT",text:[name,"PROTECTED itself!"]};
            default:
                console.error("Unhandled:", action);
        }
        return [];
    }

    private handleSingleMove(action: string[]): Script {
        if (action[2] == null) {
            throw new Error(`BattleScript.handleSingleMove: unexpected, ${JSON.stringify(action)}`);
        }
        const name = getTextName(action[2]);
        switch(action[3]) {
            case "Destiny Bond":
                return {do:"TEXT",text:[`${name}'s`,"trying to take its", "opponent with it!"]};
            default:
                console.error("Unhandled:", action);
        }
        return [];
    }

    private handleWeather(action: string[]): Script {
        if (action[2] == null) {
            throw new Error(`BattleScript.handleWeather: unexpected, ${JSON.stringify(action)}`);
        }
        if (action[3] === "[upkeep]") {
            switch(action[2]) {
                case "SunnyDay":
                    return {do:"TEXT",text:["The sunlight is", "strong."]};
                default:
                    console.error("Unhandled:", action);
            }
        } else {
            switch(action[2]) {
                case "SunnyDay":
                    this.weather = action[2];
                    return {do:"TEXT",text:["The sunlight got", "bright!"]};
                case "none":
                    switch (this.weather) {
                        case "SunnyDay":
                            return {do: "TEXT", text: ["The sunlight", "faded."]};
                    }
                default:
                    console.error("Unhandled:", action);
            }
        }
        return [];
    }

    private handleStatus(action: string[]): Script {
        if (action[2] == null) {
            throw new Error(`BattleScript.handleStatus: unexpected, ${JSON.stringify(action)}`);
        }
        const condition = action[3];
        const isPlayer = getIsPlayer(action[2]);
        const name = getTextName(action[2]);
        const reason = action[4] && getFrom(action[4]);
        const script: Script[] = [];
        // TODO: examine why we set partial status this way
        const setStatus: Script = { do: "SET_STATUS", isPlayer, status: { condition }};
        
        switch (condition) {
            case "frz":
                script.push([
                    freezeAnim(isPlayer),
                    setStatus,
                    { do: "TEXT", text: [`${name}`, "was frozen solid!"] }
                ]);
                break;
            case "par":
                script.push(paralysisAnim(isPlayer));
                script.push(setStatus);
                script.push({ do: "TEXT", text: [`${name}'s`, "paralyzed! Maybe", "it can't attack!"] });
                break;
            case "brn":
                script.push({do: "SFX", name: "brn"});
                script.push({ do: "EFFECT", name: "BURNED", isPlayer });
                script.push(setStatus);
                script.push({ do: "TEXT", text: [name, "was burned!"] });
                break;
            case "psn":
                // TODO: psn anim??
                script.push(setStatus);
                script.push({ do: "TEXT", text: [name, "was poisoned!"] });
                break;
            case "slp":
                script.push(setStatus);
                if (reason === "move: Rest") {
                    script.push({ do: "TEXT", text: [name, "went to sleep!"] });
                } else {
                    script.push({ do: "TEXT", text: [name, "fell asleep!"] });
                }
                script.push({ do: "EFFECT", name: "SLEEP", isPlayer })
                break;
            case "tox":
                setStatus.status.condition = "psn";
                script.push(setStatus);
                script.push({ do: "TEXT", text: [`${name}'s`, "badly poisoned!"] });
                break;
            default:
                console.error("Unhandled condition:", condition);
        }
        return script;
    }

    private handleCureStatus(action: string[]): Script {
        if (action[2] == null) {
            throw new Error(`BattleScript.handleCureStatus: unexpected, ${JSON.stringify(action)}`);
        }
        const name = getTextName(action[2]);
        const isPlayer = getIsPlayer(action[2]);
        switch (action[3]) {
            case "slp":
                return [
                    {do:"TEXT",text:[name, "woke up!"]},
                    {do:"SET_STATUS", isPlayer, status: {condition: ""}}
                ];
            default:
                console.error("Unhandled:", action);
        }
        return [];
    }

    private handleHeal(action: string[]): Script {
        if (action[2] == null || action[3] == null) {
            throw new Error(`BattleScript.handleHeal: unexpected, ${JSON.stringify(action)}`);
        }
        const name = getTextName(action[2]);
        const isPlayer = getIsPlayer(action[2]);
        const status = getStatus(action[3]);
        if (status.hp == null) {
            throw new Error("BattleScript.handleHeal: status.hp is undefined");
        }
        if (action[4] === "[silent]") {
            return [
                {do:"HEALTH",hp:status.hp,isPlayer}
            ];
        }
        const from = getFrom(action[4]);
        switch (from) {
            case "drain":
                if (action[5] == null ) {
                    throw new Error(`BattleScript.handleHeal: drain is missing [of], ${JSON.stringify(action)}`);
                }
                return [
                    {do:"HEALTH",hp:status.hp,isPlayer},
                    {do:"TEXT",text:["Sucked health from", `${getOf(action[5])}!`]}
                ];
            default:
                return [
                    {do:"HEALTH",hp:status.hp,isPlayer},
                    {do:"TEXT",text:[name, "regained health!"]}
                ];
        }
    }
   
}

export default BattleScript;