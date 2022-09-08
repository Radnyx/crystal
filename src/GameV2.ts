/**
 * Version 2.0 of Battle engine
 * Uses pokemon-showdown as logic backend.
 * Interprets game state to be drawn accordingly.
 */

import { AnyObject, Battle, BattleStreams, Pokemon, PokemonSet, RandomPlayerAI, Side, Teams as PSTeams } from '@pkmn/sim';
import { GeneralTeamView, Menu, Moves, Options, SwitchoutTeamView, SwitchStats, TeamView } from './Menu';

import { BattleInfo, FighterObject, MemberObject } from './BattleObjects';
import BattleScript from './BattleScript';
import Interpreter from './Interpreter';
import { Events, EventDriver } from './Event';
import IGame from './IGame';
import View from './View';
import { ObjectReadWriteStream } from '@pkmn/streams';

function buildPSGender(gender: "male" | "female" | "none"): string {
    switch (gender) {
        case "male": return "M";
        case "female": return "F";
        case "none": return "";
    }
}

function buildPSTeam(members: MemberObject[], fighters: { [id: string]: FighterObject }): PokemonSet[] {
    return members.map((member, index) => {
        const fighter = fighters[member.id];
        if (fighter == null) {
            throw new Error(`GameV2.buildPSTeam: member id "${member.id}" does not exist`);
        }
        return {
            name: (index.toString()) + member.name,
            species: fighter.name,
            item: "", // TODO
            ability: "",
            moves: member.moves,
            nature: "",
            gender: buildPSGender(member.gender),
            evs: { hp: 252, atk: 252, def: 252, spa: 252, spd: 252, spe: 252 },
            ivs: { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 },
            level: member.level
        }
    });
}

class PlayerController extends RandomPlayerAI {
    receiveRequest(request: AnyObject): void {
        //if (process.env.NODE_ENV === "development") {
        //    console.log("received:\n", request);
        //}
    }
} 

class GameV2 implements IGame {

    private eventDriver: EventDriver;

    // all graphical changes or effects are performed here
    public readonly view: View;

    public battleInfo: BattleInfo;

    // Writes script from pokemon-showdown stream
    private battleScript?: BattleScript;

    // Interprets script into executable events
    private interpreter: Interpreter;

    private menuStack: Menu[];

    private battle: Battle;

    private streams: { p1: ObjectReadWriteStream<string> };

    private frames: number;

    private movesState: number = 0;

    constructor (view: View, battleInfo: BattleInfo, private debug: boolean = false) {
        this.view = view;
        this.battleInfo = battleInfo;
        if (this.debug) {
            console.log("GameV2.constructor: initializing");
        }
        this.frames = 0;
        this.menuStack = [];

        this.battleScript = new BattleScript(this.battleInfo, debug);
        this.interpreter = new Interpreter(this.view, this.battleInfo);
        this.eventDriver = new EventDriver();

        if (this.debug) {
            console.log("GameV2.constructor: creating battle stream");
        }
        const battleStream = new BattleStreams.BattleStream();
        const streams = BattleStreams.getPlayerStreams(battleStream);
        const spec = {formatid: 'gen2randombattle'};

        if (this.debug) {
            console.log("GameV2.constructor: creating player streams");
        }

        const p1 = new PlayerController(streams.p1);
        const p2 = new RandomPlayerAI(streams.p2);

        if (this.debug) {
            console.log("GameV2.constructor: starting player streams");
        }

        p1.start();
        p2.start();
        
        void (async () => {
            for await (const chunk of streams.omniscient) {
                this.battleScript?.load(chunk);
            }
        })();

        streams.omniscient.write(`>start ${JSON.stringify(spec)}`);
        if (battleStream.battle == null) {
            throw new Error("GameV2.constructor: battleStream.battle is null");
        }
        this.battle = battleStream.battle;

        if (this.debug) {
            console.log("GameV2.constructor: building stream teams");
        }

        const playerTeam = PSTeams.pack(buildPSTeam(this.battleInfo.info.player.team, this.battleInfo.data));
        const opponentTeam = PSTeams.pack(buildPSTeam(this.battleInfo.info.opponent.team, this.battleInfo.data));
        streams.omniscient.write(`>player p1 ${JSON.stringify({ 
            name: battleInfo.info.player.name, team: playerTeam })}`);
        streams.omniscient.write(`>player p2 ${JSON.stringify({ 
            name: battleInfo.info.opponent.name, team: opponentTeam })}`);
        this.streams = streams;

        this.view.restart();
    }

    update() {
        const script = this.battleScript?.buildAll();
        if (script != null) {
            this.eventDriver.append(this.interpreter.interpret(this, script));
        }
        
        this.eventDriver.update();

        for (const menu of this.menuStack) {
            menu.update();
        }
        if (!this.eventDriver.running() && this.menuStack.length > 0) {
            this.menuStack[this.menuStack.length - 1]!.listen();
        }

        this.view.update();
        this.frames++;
    }

    getFrames() {
        return this.frames;
    }

    getEventDriver() {
        return this.eventDriver;
    }

    getInterpreter(): Interpreter {
        return this.interpreter;
    }

    currentMenu(): Menu | null {
        if (this.menuStack.length === 0) {
            return null;
        }
        return this.menuStack[this.menuStack.length - 1]!;
    }

    showOptions() {
        this.currentMenu()?.hide();
        this.pushMenu(new Options(this));
    }

    showMoves(moves: string[]) {
        this.currentMenu()?.hide();
        this.pushMenu(new Moves(this, moves, this.movesState));
    }

    showGeneralTeamView() {
        this.currentMenu()?.hide();
        this.pushMenu(new GeneralTeamView(this));
    }

    showTeamViewOptions(index: number) {
        this.pushMenu(new SwitchStats(this, index));
    }

    private pushMenu(menu: Menu) {
        if (this.debug) {
            console.log("Pushed menu:", menu);
        }
        this.menuStack.push(menu);
        this.view.getTextbox().clear();
        menu.show();
    }

    popMenu() {
        const menu = this.currentMenu();
        if (menu == null) {
            throw new Error("GameV2.popMenu: menu stack is empty");
        }
        menu.hide();
        if (menu instanceof Moves) {
			this.movesState = menu.state;
        }
        this.menuStack.pop();
        this.currentMenu()?.show();
        this.currentMenu()?.continue();
    }

    popAllMenus() {
        while (this.menuStack.length > 0) this.popMenu();
    }

    forcePlayerSwitch() {
        if (this.battle.p1.pokemon.some(member => member.hp > 0)) {
            this.currentMenu()?.hide();
            this.pushMenu(new SwitchoutTeamView(this, false));
        }
    }

    inTeamView() {
        return this.currentMenu() instanceof TeamView;
    }

    pass() {
        this.streams.p1.write("move 1");
    }

    submit(attack: number) {
        this.popAllMenus();
        this.streams.p1.write(`move ${attack + 1}`);
    }

    switch(index: number) {
        this.movesState = 0;
        const currentMember = this.getSimulatedPlayer();
        const member = this.getSimulatedPlayerMember(index);
        this.popAllMenus();
        this.eventDriver.append(Events.flatten([
            currentMember.hp > 0 ? [
                this.view.text([
                    `${GameV2.getTrueName(currentMember.name)}, that's`, 
                    "enough! Come back!"
                ], true),
                Events.wait(24),
                this.view.sfx("ballpoof"),
                this.view.shader(true, 'plyAppear', 4, 5, true),
                this.view.hidePlayer()
            ] : undefined,
            Events.wait(24),
            () => this.streams.p1.write(`switch ${this.battle.p1.pokemon.indexOf(member) + 1}`)
        ]));
    }

    getSimulatedPlayer(): Pokemon {
        const poke = this.battle.p1.active[0];
        if (poke == null) {
            throw new Error("GameV2.getSimulatedPlayer: simulator player member is null");
        }
        return poke;
    }

    getSimulatedOpponent(): Pokemon {
        const poke = this.battle.p2.active[0];
        if (poke == null) {
            throw new Error("GameV2.getSimulatedOpponent: simulator opponent member is null");
        }
        return poke;
    }
    
    getSimulatedPlayerMember(index: number): Pokemon {
        return this.battle.p1.pokemon.find(pkmn => pkmn.set === this.battle.p1.team[index])!;
    }

    getSimulatedOpponentMember(index: number): Pokemon {
        return this.battle.p2.pokemon.find(pkmn => pkmn.set === this.battle.p2.team[index])!;
    }

    getPlayerTeamLength() {
        return this.battle.p1.team.length;
    }

    getSimulatedDex() {
        return this.battle.dex;
    }

    private static getTeamHealth(team: Side): number[] {
        let hp = [];
        for (let i = 0; i < team.team.length; i++) {
            hp.push(team.pokemon.find(pkmn => pkmn.set === team.team[i])!.hp);
        }
        return hp;
    }

    getPlayerTeamHealth(): number[] {
        return GameV2.getTeamHealth(this.battle.p1);
    }

    getOpponentTeamHealth(): number[] {
        return GameV2.getTeamHealth(this.battle.p2);
    }

    static getTrueName(name: string) {
        return name.substring(1);
    }
}

export default GameV2;