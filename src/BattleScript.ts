import Status from "./Status";
import { BattleInfo, MemberObject } from "./BattleObjects";
import { Script, Scripts } from "./Script";
import moveInfo from './MoveInfo';

const convertPSStat: { [stat: string]: string } = {
    "accuracy": "ACCURACY",
    "evasiveness": "EVASION",
    "atk": "ATTACK",
    "def": "DEFENSE",
    "spa": "SPCL.ATTACK",
    "spd": "SPCL.DEFENSE",
    "spe": "SPEED"
};

type Effectiveness = "supereffective" | "resisted" | "immune";

function getIsPlayer(name: string): boolean {
    return name[1] === "1";
}

function getName(name: string): string {
    return name.substring(name.indexOf(" ") + 2);
}

function getTextName(name: string): string {
    return (name[1] === "2" ? "Enemy " : "") + getName(name);
}

function getStatus(status: string): Partial<Status> {
    const result: Partial<Status> = { hp: 0 };
    if (status.includes(" ")) {
        const [ health, cond ] = status.split(" ");
        status = health;
        result.condition = cond;
    }
    if (status.includes("/")) {
        const [ hp, maxHp ] = status.split("/");
        result.hp = Number.parseInt(hp);
        result.maxHp = Number.parseInt(maxHp);
    }
    return result;
}

function parseDetails(details: string) {
    const split = details.split(", ");
    // PS will not include L100, so we add it
    if (split[1][0] !== 'L') {
        split.splice(1, 0, "L100");
    }
    return split;
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
    trainerName?: string;
    index?: number;
    substituted?: boolean;
    flying?: boolean;
    fainted?: boolean;
}

class BattleScript {
    
    private battleInfo: BattleInfo;

    private stream: string[][] = [];

    private moveResults: { effectiveness?: Effectiveness, crit: boolean, substitute: boolean } = 
        { effectiveness: undefined, crit: false, substitute: false };

    private playerState: State = {};
    private opponentState: State = {};

    private introduction: 
        ((playerSwitch: Script) => (opponentSwitch: Script) => Script) |
        ((opponentSwitch: Script) => Script) |
        Script;

    constructor(battleInfo: BattleInfo) {
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
        if (process.env.NODE_ENV === "development") {
            console.log("Loaded chunk:");
            console.log(chunk);
        }
        chunk.split("\n").forEach(x => this.stream.push(x.split("|")));
    }

    buildAll(): Script | null {
        const script: Script[] = [];
        while (this.stream.length > 0) {
            const command = Scripts.flatten(this.build());
            if (process.env.NODE_ENV === "development") {
                console.log(command);
            }
            script.push(command);
        }
        return script;
    }

    build(): Script {
        if (this.stream.length === 0) return null;
        while (this.stream.length > 0) {
            const action = this.stream.shift()!;
            //if (process.env.NODE_ENV === "development") {
            //    console.log(JSON.stringify(action));
            //}
            switch (action[1]) {
                case "move":
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
                    if (action[3] === "Fly") {
                        if (getIsPlayer(action[2])) {
                            this.playerState.flying = true;
                        } else {
                            this.opponentState.flying = true;
                        }
                    }
                    break;
                case "-activate": return this.handleActivate(action);
                case "-damage": return this.handleDamage(action);
                case "-start": return this.handleStart(action);
                case "-end": return this.handleEnd(action);
                case "-status": return this.handleStatus(action);
                case "-curestatus": return this.handleCureStatus(action);
                case "-heal": return this.handleHeal(action);
                case '-boost': return this.handleBoost(action, true);
                case "-unboost": return this.handleBoost(action, false);
                case "turn": // TODO: use this to go to options?
                    if (this.playerState.flying) {
                        this.playerState.flying = false;
                        return "PASS";
                    }
                    return "OPTIONS";
                case "player":
                    if (getIsPlayer(action[2])) {
                        this.playerState.trainerName = action[3];
                    } else {
                        this.opponentState.trainerName = action[3];
                    }
                    break;
                // ignore these messages
                case "":
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
        let move = action[3].toUpperCase();
        if (move.length > 12) move = move.replace(" ", "");
        const name = getTextName(action[2]);
        const isPlayer = action[2][1] === "1";
        const miss = action[5] === "[miss]";
        const still = action[5] === "[still]";
        const actualMove = move + (still ? "_STILL" : "");

        const fail = (this.stream[0][1] === "-fail") ||
            // for SLEEP TALK, if nothing happens and the opponent starts their
            // move, consider that a failure. 
            (this.stream[0][1] === "move" && this.stream[0][2] !== action[2]);

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
            {do:"MOVE_SFX",move,isPlayer},
            {do:"EFFECT",name:move,isPlayer},
            {do:"WAIT",frames:16},
            substituted ? {do:"EFFECT",name:"SUBSTITUTE_ENTER",isPlayer} : null,
            isPlayer 
                ? "SHOW_PLAYER_STATS"
                : "SHOW_OPPONENT_STATS",
            // post anim
            { do: "EFFECT", name:move+"_POST", isPlayer },
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

    private handleFaint(action: string[]): Script {
        const name = getName(action[2]);
        const isPlayer = getIsPlayer(action[2]);
        if (isPlayer) {
            this.playerState.fainted = true;
            if (this.playerState.index == null) {
                throw new Error("BattleScript.handleFaint: playerState.index is undefined");
            }
            return [
                { do: "WAIT", frames: 20 },
                { do: "CRY", isPlayer: true, index: this.playerState.index },
                { do: "SHADER", isPlayer: true, name: "faint", steps: 15, delay: 1 },
                "HIDE_PLAYER_STATS",
                "HIDE_PLAYER",
                { do: "TEXT", text: [name, "fainted!"] },
                "FORCE_PLAYER_SWITCH"
            ];
        }
        return [
            { do: "WAIT", frames: 20 },
            { do: "SFX", name: "faint" },
            { do: "SHADER", isPlayer: false, name: "faint", steps: 15, delay: 1 },
            "HIDE_OPPONENT_STATS",
            "HIDE_OPPONENT",
            { do: "TEXT", text: [name, "fainted!"] }
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
        Find the first member of the team that matches the conditions. 
        It shouldn't really matter if there are multiple team members with the
        exact same traits, since visually they will be indistinguishable.
    */
    private findMember(team: MemberObject[], name: string, details: string): number {
        const [ species, level, gender, shiny ] = parseDetails(details);
        const data = this.battleInfo.data;
        return team.findIndex(member =>
            // don't want to compare by uppercase here, but if the nickname is the same as
            // the species name it reformats the name... 
            member.name.toUpperCase() === name.toUpperCase() && 
            data[member.id].name.toUpperCase() === species.toUpperCase() &&
            member.level === Number.parseInt(level.substring(1)) &&
            (member.gender === "none" || member.gender[0].toUpperCase() === gender)
        );
    }

    sendOutPlayer(name: string, index: number, status: Partial<Status>, 
        altText: boolean): Script
    {
        this.playerState.fainted = false;
        this.playerState.index = index;
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
        const name = getName(action[2]);
        const status = getStatus(action[4]);
        if (action[2][1] === "1") {
            const index = this.findMember(this.battleInfo.info.player.team, name, action[3]);
            return this.sendOutPlayer(name, index, status, this.playerState.fainted || altText);
        } 
        const index = this.findMember(this.battleInfo.info.opponent.team, name, action[3]);
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
        const name = getTextName(action[2]);
        const isPlayer = getIsPlayer(action[2]);
        switch (action[3]) {
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
        const name = getTextName(action[2]);
        const isPlayer = getIsPlayer(action[2]);
        switch(action[3]) {
            case "move: Beat Up":
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
        const from = action[4].split(" ")[1];
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
                // TODO: brn anim?
                event = [
                    {do:"TEXT",text:[`${name}'s`, "hurt by its burn!"]}
                ];
                break;
            case "psn":
                event = [
                    {do:"TEXT",text:[name, "is hurt by poison!"], auto: true},
                    {do:"WAIT",frames:48},
                    poisonAnim(isPlayer)
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
        const condition = action[3];
        const name = getTextName(action[2]);
        const isPlayer = getIsPlayer(action[2]);
        switch (condition) {
            case "Substitute":
                this.moveResults.substitute = true;
                this.getState(isPlayer).substituted = true;
                return { do: "TEXT", text: [name, "made a SUBSTITUTE!"] };
            case "confusion":
                return [
                    confuseAnim(isPlayer),
                    { do: "TEXT", text: [`${name}`,"became confused!"] }
                ];
            case "move: Focus Energy":
                return {do:"TEXT", text: [`${name}'s`,"getting pumped!"]};
            default:
                console.error("Unhandled:", action);
        }
        return [];
    }

    private handleEnd(action: string[]): Script {
        const name = getTextName(action[2]);
        const isPlayer = getIsPlayer(action[2]);
        switch(action[3]) {
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

    private handleStatus(action: string[]): Script {
        const condition = action[3];
        const isPlayer = getIsPlayer(action[2]);
        const name = getTextName(action[2]);
        const reason = action[4] && action[4].split("[from] ")[1];
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
                script.push(setStatus);
                script.push({ do: "TEXT", text: [`${name}'s`, "paralyzed! Maybe", "it can't attack!"] });
                break;
            case "brn":
                // TODO: BURN ANIM
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
            default:
                console.error("Unhandled condition:", condition);
        }
        return script;
    }

    private handleCureStatus(action: string[]): Script {
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
        const name = getTextName(action[2]);
        const isPlayer = getIsPlayer(action[2]);
        const status = getStatus(action[3]);
        if (status.hp == null) {
            throw new Error("BattleScript.handleHeal: status.hp is undefined");
        }
        return [
            {do:"HEALTH",hp:status.hp,isPlayer},
            {do:"TEXT",text:[name, "regained health!"]}
        ];
    }
   
}

export default BattleScript;