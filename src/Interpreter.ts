import { BattleInfo, MemberObject } from "./BattleObjects";
import moveStats from './MoveInfo';
import { Script, Scripts } from "./Script";
import { Event, DeepEvent, Events } from "./Event";
import IView from "./IView";
import IGame from "./IGame";

interface MembersOut {
    player?: MemberObject;
    opponent?: MemberObject;
}

class Interpreter {
    private battleInfo: BattleInfo;
    private view: IView;
    private membersOut: MembersOut;

    constructor(view: IView, battleInfo: BattleInfo) {
        this.battleInfo = battleInfo;
        this.view = view;
        this.membersOut = {};
    }

    public getMembersOut(): MembersOut {
        return this.membersOut;
    }

    private static assertGameNotNull(game: IGame | null): asserts game {
        if (game == null) {
            throw new Error("Interpreter.interpet: game is null");
        }
    }

    private stepNoArgs(game: IGame | null, command: string): Event {
        switch (command) {
            case "FORCE_PLAYER_SWITCH":
                Interpreter.assertGameNotNull(game);
                return { init: () => game.forcePlayerSwitch() };
            case "PASS":
                Interpreter.assertGameNotNull(game);
                return { init: () => game.pass() };
            case "OPTIONS":
                Interpreter.assertGameNotNull(game);
                return { init: () => game.showOptions() };
            case "CLEAR_TEXT":
                return this.view.clearTextbox();
            case "SLIDE_IN_TRAINERS":
                return this.view.slideInTrainers();
            case "SLIDE_IN_OPPONENT_TRAINER":
                return this.view.slideInOpponentTrainer();
            case "SLIDE_OUT_PLAYER_TRAINER":
                return this.view.slideOutPlayerTrainer();
            case "SLIDE_OUT_OPPONENT_TRAINER":
                return this.view.slideOutOpponentTrainer();
            case "SHOW_PLAYER_TEAM_STATUS":
                Interpreter.assertGameNotNull(game);
                return this.view.showPlayerTeamStatus(game.getPlayerTeamHealth());
            case "SHOW_OPPONENT_TEAM_STATUS":
                Interpreter.assertGameNotNull(game);
                return this.view.showOpponentTeamStatus(game.getOpponentTeamHealth());
            case "HIDE_PLAYER_TEAM_STATUS":
                return this.view.hidePlayerTeamStatus();
            case "HIDE_OPPONENT_TEAM_STATUS":
                return this.view.hideOpponentTeamStatus();
            case "SHOW_PLAYER_STATS":
                return this.view.showPlayerStats(this.membersOut.player);
            case "SHOW_OPPONENT_STATS":
                return this.view.showOpponentStats(this.membersOut.opponent);
            case "HIDE_PLAYER_STATS":
                return this.view.hidePlayerStats();
            case "HIDE_OPPONENT_STATS":
                return this.view.hideOpponentStats();
            case "SCREEN_SHAKE":
                return this.view.screenShake();
            case "INVERT_COLORS":
                return this.view.invertColors();
            case "TOGGLE_GRAY_SCALE":
                return this.view.toggleGrayScale();
            case "SHOW_PLAYER":
                return this.view.showPlayer();
            case "HIDE_PLAYER":
                return this.view.hidePlayer();
            case "SHOW_OPPONENT":
                return this.view.showOpponent();
            case "HIDE_OPPONENT":
                return this.view.hideOpponent();
            case "PLAY_VICTORY_MUSIC":
                return { init: () => this.view.startMusic("victory") };
            default:
                throw new Error(`Unsupported script command: ${command}.`);
        } 
    }

    private step(game: IGame | null, command?: Script): DeepEvent {
        if (command == null) {
            return undefined;
        }
        if (Scripts.isSubCommand(command)) {
            return command.map(s => this.step(game, s));
        }
        if (typeof command === 'string') {
            return this.stepNoArgs(game, command);
        }
        let member: MemberObject;
        let id: string;
        switch (command.do) {
            case "ANIMATE":
                id = this.battleInfo.info.opponent.team[command.index].id;
                return this.view.anim(id, this.battleInfo.data[id].anim);
            case "EFFECT":
                return this.view.effect(command.name, command.isPlayer);
            case "HEALTH":
                return Events.changeHealth(command.isPlayer
                    ? this.view.getPlayerStatus()
                    : this.view.getOpponentStatus(), command.hp);
            case "SHADER":
                return this.view.shader(command.isPlayer, command.name, command.steps, command.delay, false);
            case "PARTICLE":
                return this.view.particle(command.type, ...command.args);
            case "SET_STATUS":
                return () => this.view.setStatus(command.isPlayer, command.status)
            case "SET_PLAYER":
                member = this.battleInfo.info.player.team[command.index];
                this.membersOut.player = member;
                return {
                    init: state => {
                        state.playerId = member.id;
                        this.view.setPlayerTexture(member.id);
                    }
                };
            case "SET_OPPONENT":
                member = this.battleInfo.info.opponent.team[command.index];
                this.membersOut.opponent = member;
                return {
                    init: state => {
                        state.opponentId = member.id;
                        this.view.setOpponentTexture(member.id);
                    }
                };
            case "TEXT":
                return this.view.text(command.text, command.auto);
            case "SFX":
                return this.view.sfx(command.name, command.wait, command.panning);
            case "CRY":
                if (command.isPlayer) {
                    id = this.battleInfo.info.player.team[command.index].id;
                } else {
                    id = this.battleInfo.info.opponent.team[command.index].id;
                }
                return this.view.cry(id, true, command.isPlayer);
            case "MOVE_SFX":
                return this.moveSfx(command.move, command.isPlayer);
            case "WAIT":
                return Events.wait(command.frames);
            default:
                throw new Error(`Unsupported script command: ${JSON.stringify(command)}.`);
        }
    }

    public interpret(game: IGame | null, script?: Script): Event {
        return Events.flatten(this.step(game, script))
    }

    private moveSfx(moveName: string, isPlayer: boolean): Event {
        const move = moveStats[moveName];
        let sfx;
        let pan: number = 1;
        if (typeof move === "string") {
            sfx = move;
        } else {
            sfx = move?.sfx;
            pan = move?.pan || pan;
        }
        const member = isPlayer
            ? this.membersOut.player
            : this.membersOut.opponent;
        if (member == null) {
            throw new Error("Interpreter.moveSfx: member is null");
        }
	  	// play the member's cry if no sound effect
		if (sfx == null) {
            return this.view.cry(member.id, false, isPlayer);
        }
        return this.view.sfx(sfx, false, pan * (isPlayer ? -0.5 : 0.5));
    }
}

export default Interpreter;