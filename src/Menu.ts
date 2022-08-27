import * as PIXI from 'pixi.js-legacy';
import { sound as PIXI_SOUND } from '@pixi/sound';
import * as Input from './Input.js';
import * as Graphics from './Graphics';
import Text from './Text';
import { HPStatsView } from './StatsView';
import GameV2 from './GameV2';
import { DeepEvent, Events } from './Event';
import { Pokemon } from '@pkmn/sim';

const menuTexture = PIXI.Texture.from('menu.png');
const movesTexture = PIXI.Texture.from('moves.png');
// const yesnoTexture = PIXI.Texture.from('yesno.png');
const switchstatsTexture = PIXI.Texture.from('switchstats.png');
const messageTexture = PIXI.Texture.from('message.png');
const arrowTexture = Graphics.charTex(10, 5);
const arrowTexture2 = Graphics.charTex(9, 5);

type Dir = "down" | "right";

type ArrowPos = [number, number];
type Machine = { [state: number]: () => void };
type Transition = [number, number, Dir];

/* Finite-State-Machine representing menu actions. */
abstract class Menu {
	public state: number = 0;
	protected states: number;
	private arrowPos: ArrowPos[] = [];
	private machine: Machine = {};
	protected arrowSpr: PIXI.Sprite;
	protected stage: PIXI.Container;
	private touchContainers: PIXI.Container[] = [];

	private showing: boolean = false;

	constructor(
		protected game: GameV2,
		trans: Transition[], 
		arrowPos: [number, number][], 
		onStateChange = () => {},
		// If the user clicks in these areas, then go to that state
		touchAreas: (PIXI.Rectangle | undefined)[] = []
	) {
		this.stage = game.view.getStage();
		this.arrowSpr = new PIXI.Sprite(arrowTexture);
		this.reset(trans, arrowPos, onStateChange);
		this.states = arrowPos.length;
		const scale = Math.floor(game.view.app.renderer.width / Graphics.GAMEBOY_WIDTH);
		let i = 0;
		for (const area of touchAreas) {
			if (area == null) continue;
			area.x *= scale;
			area.y *= scale;
			area.width *= scale;
			area.height *= scale;
			const container = new PIXI.Container();
			container.interactive = true;
			container.hitArea = area;
			container.cursor = "pointer";
			const state = i;
			const fn = (event: any) => {
				if (this.game.currentMenu() != this) {
					return;
				}
				event.stopPropagation();
				if (this != null) {
					this.state = state;
					Input.forceAdvance();
				} else {
					console.warn("Menu: this == null on touch container event");
				}
			};
			container.on("click", fn);
			container.on("tap", fn);
			this.touchContainers.push(container);
			i++;
		}
	}

	reset(trans: [number, number, Dir][], arrowPos: [number, number][], onStateChange: () => void) {
		const total = arrowPos.length;
		this.state = 0;
		this.arrowPos = arrowPos;
		this.machine = {};
		// Each state action will set the position of the menu arrow
		for (let i = 0; i < total; i++) {
			this.machine[i] = () => {
				this.arrowSpr.x = arrowPos[i][0];
				this.arrowSpr.y = arrowPos[i][1];
			};
		}
		// compose state actions with a d-pad check for
		//  a (bi-directional) state transition.
		for (const [s0, s1, dir] of trans) {
			if (dir === "down") {
				this.compose(s0, () => {
					if (Input.down() && !Input.up()) {
						this.state = s1;
						onStateChange();
					}
				});
				this.compose(s1, () => {
					if (Input.up()) {
						this.state = s0;
						onStateChange();
					}
				});
			} else if (dir === "right") {
				this.compose(s0, () => {
					if (Input.right() && !Input.left()) {
						this.state = s1;
						onStateChange();
					}
				});
				this.compose(s1, () => {
					if (Input.left()) {
						this.state = s0;
						onStateChange();
					}
				});
			}
		}
	}

	compose(s: number, g: () => void) {
		const f = this.machine[s];
		this.machine[s] = () => {
			f();
			g();
		};
	}

	update() {
		this.arrowSpr.x = this.arrowPos[this.state][0];
		this.arrowSpr.y = this.arrowPos[this.state][1];
	}

	listen() {
		this.machine[this.state]();
	}

	show() {
		if (!this.showing) {
			this._show();
			this.arrowSpr.x = this.arrowPos[this.state][0];
			this.arrowSpr.y = this.arrowPos[this.state][1];
			this.game.view.getStage().addChild(this.arrowSpr);
			for (const container of this.touchContainers) {
				this.game.view.app.stage.addChild(container);
			}
			this.showing = true;
		}
	}

	hide() {
		if (this.showing) {
			this._hide();
			this.game.view.getStage().removeChild(this.arrowSpr);
			for (const container of this.touchContainers) {
				this.game.view.app.stage.removeChild(container);
			}
			this.showing = false;
		}
	}

	abstract _show(): void;
	abstract _hide(): void;

	// Select something in a menu, then display a message and return
	selectMessage(text: string[]) {
		this.game.getEventDriver().append(Events.flatten([
			() => this.arrowSpr.texture = arrowTexture2,
			this.game.view.text(text),
			this.game.view.clearTextbox(),
			{
				init: () => this.arrowSpr.visible = false,
				done: t => t >= 4
			},
			() => {
				this.arrowSpr.texture = arrowTexture;
				this.arrowSpr.visible = true;
			}
		]));
	}

	continue() {}
}

class Options extends Menu {
	private menuSpr: PIXI.Sprite;

	constructor(game: GameV2) {
		super(game, [[0, 1, "right"], [0, 2, "down"],
					 [1, 3, "down"], [2, 3, "right"]],
					 [[72, 112], [120, 112], [72, 128], [120, 128]], 
					 undefined,
					 [ new PIXI.Rectangle(64, 99, 59, 26),
					   new PIXI.Rectangle(64 + 59, 99, 37, 26),
					   new PIXI.Rectangle(64, 99 + 26, 59, 26),
					   new PIXI.Rectangle(64 + 59, 99 + 26, 37, 26) ]);
		this.compose(0, () => {
			if (Input.selected()) {
				Input.releaseSelect();
				Input.releaseBack();
				const player =  game.getInterpreter().getMembersOut().player;
				if (player == null) {
					throw new Error("Options.constructor: member player is null");
				}
				const moves = player.moves;
				PIXI_SOUND.play('pressab');

				const simulatedPlayer = this.game.getSimulatedPlayer();
				if (simulatedPlayer.moveSlots.every(move => move.pp <= 0)) {
					// struggle
					this.game.popAllMenus();
					this.game.submit(0);
				} else if (simulatedPlayer.getVolatile('encore') != null) {
					// must use previous move
					const moveIndex = simulatedPlayer.moveSlots.findIndex(move => move.move === simulatedPlayer.lastMove?.name);
					this.game.popAllMenus();
					this.game.submit(moveIndex);
				} else {
					game.showMoves(moves);
				}
			}
		});
		this.compose(1, () => {
			if (Input.selected()) {
				Input.releaseSelect();
				PIXI_SOUND.play('pressab');
				game.showGeneralTeamView();
			}
		});
		this.compose(2, () => {
			if (Input.selected()) {
				Input.releaseSelect();
				PIXI_SOUND.play('pressab');
				this.hide();
				// TODO: pack items
				game.getEventDriver().append(Events.flatten([
					game.view.text([ "It's empty." ]),
					game.view.clearTextbox(),
					Events.wait(10),
					() => this.show()
				]));
			}
		});
		this.compose(3, () => {
			if (Input.selected()) {
				Input.releaseSelect();
				PIXI_SOUND.play('pressab');
				this.hide();
				game.getEventDriver().append(Events.flatten([
					game.view.text([
						"No! There's no",
						"running from a",
						"battle!"
					]),
					game.view.clearTextbox(),
					Events.wait(10),
					() => this.show()
				]));
			}
		});
		this.menuSpr = new PIXI.Sprite(menuTexture);
		this.menuSpr.x = 64;
		this.menuSpr.y = 96;
	}

	_show() {
		this.game.view.getStage().addChild(this.menuSpr);
	}

	_hide() {
		this.game.view.getStage().removeChild(this.menuSpr);
	}
}

class Moves extends Menu {
	private movesSpr: PIXI.Sprite;
	private type: Text;
	private pp: Text;
	private maxPp: Text;
	private moves: Text[];
	private stateToSimulatedIndex: { [state: number]: number } = {};

	constructor(game: GameV2, moves: string[], state: number) {
		let stateToSimulatedIndex: { [index: number]: number } = {};
		if (moves.every(m => m === "")) 
			throw new Error("Cannot create move menu with no moves!");
		moves = [...moves, ...[...new Array(4 - moves.length)].map(_ => "")];
		let trans: Transition[] = [];
		let lastMove: number | undefined = undefined;
		const exists = moves.map(move => move === "" ? undefined : true);
		for (let i = 0; i < 4; i++) {
			if (exists[i]) {
				if (lastMove !== undefined) {
					trans.push([lastMove, i, "down"]);
				}
				stateToSimulatedIndex[i] = trans.length;
				lastMove = i;
			}
		}
		if (trans.length > 1)
			trans.push([lastMove!, trans[0][0], "down"]);
		super(game, trans,
				[[40, 104], [40, 112], [40, 120], [40, 128]],
				() => {
					this.updateMoveInfo();
					Input.releaseArrows();
				}, [
					exists[0] && new PIXI.Rectangle(34, 99, 126, 12),
					exists[1] && new PIXI.Rectangle(34, 111, 126, 8),
					exists[2] && new PIXI.Rectangle(34, 111 + 8, 126, 8),
					exists[3] && new PIXI.Rectangle(34, 111 + 16, 126, 16)
				]);
		this.stateToSimulatedIndex = stateToSimulatedIndex;
		this.state = state;
		while (moves[this.state] === "") this.state = (this.state + 1) % 4;
		this.movesSpr = new PIXI.Sprite(movesTexture);
		this.movesSpr.x = 0;
		this.movesSpr.y = 64;
		this.type = new Text(this.stage, 16, 80);
		this.pp = new Text(this.stage, 40, 88);
		this.maxPp = new Text(this.stage, 64, 88);
		this.moves = [
			new Text(this.stage, 48, 104),
			new Text(this.stage, 48, 112),
			new Text(this.stage, 48, 120),
			new Text(this.stage, 48, 128)
		];
	}

	listen() {
		const moveIndex = this.stateToSimulatedIndex[this.state];
		if (Input.back()) {
			Input.releaseBack();
			PIXI_SOUND.play('pressab');
			this.game.popMenu();
		} else if (Input.selected()) {
			Input.releaseSelect();
			PIXI_SOUND.play('pressab');
			const player = this.game.getSimulatedPlayer();
			if (player.moveSlots[moveIndex].disabled) {
				this.game.getEventDriver().append(Events.flatten([
					this.game.view.text([
						"This move is",
						"DISABLED!"
					]),
					this.game.view.clearTextbox()
				]));
			} else if (this.game.getSimulatedPlayer().moveSlots[moveIndex].pp <= 0) {
				this.game.getEventDriver().append(Events.flatten([
					this.game.view.text([
						"There's no PP left",
                        "for this move!"
					]),
					this.game.view.clearTextbox()
				]));
			} else {
				this.game.popAllMenus();
				this.game.submit(moveIndex);
			}
		} else {
			super.listen();
		}
	}

	updateMoveInfo() {
		const stats = this.game.getSimulatedPlayer().moveSlots[this.stateToSimulatedIndex[this.state]];
		const move = this.game.getSimulatedDex().moves.moveCache.get(stats.id);
		if (move == null) {
			throw new Error("Moves.updateMoveInfo: move is null");
		}
		this.type.change(
			move.type.toUpperCase()
		);
		this.pp.change(stats.pp.toString());
		this.maxPp.change(stats.maxpp.toString());
	}

	_show() {
		const player = this.game.getInterpreter().getMembersOut().player;
		if (player == null) {
			throw new Error("Moves._show: member player is null");
		}
		this.state = Math.min(this.state, player.moves.length - 1);

		this.game.view.getStage().addChild(this.movesSpr);

		this.updateMoveInfo();

		for (let i = 0; i < 4; i++) {
			const move = player.moves[i];
			if (move === undefined) {
				this.moves[i].clear();
			} else {
				this.moves[i].change(move);
			}
		}
	}

	_hide() {
		this.game.view.getStage().removeChild(this.movesSpr);
		this.moves.forEach(m => m.clear());
		this.type.clear();
		this.pp.clear();
		this.maxPp.clear();
	}
}

/*
class YesNo extends Menu {
	private resume: any;
	private yesnoSpr: PIXI.Sprite;

	constructor(game, resume) {
		super(game, [[0, 1, "down"]], [[16, 64], [16, 80]]);
		this.resume = resume;
		this.yesnoSpr = new PIXI.Sprite(yesnoTexture);
		this.yesnoSpr.x = 8;
		this.yesnoSpr.y = 56;
	}

	listen() {
		if (Input.back()) {
			Input.releaseBack();
			this.hide();
			this.game.runEvent(this.resume);
		} else if (Input.selected()) {
			Input.releaseSelect();
			PIXI_SOUND.play('pressab');
			this.hide();

			if (this.state === 0) {
				this.game.runEvent(Do().Wait(10).Then({
					init: () => this.game.switchoutTeamView(this.resume)
				}));
			} else {
				this.game.runEvent(this.resume);
			}
		} else {
			super.listen();
		}
	}

	_show() {
		this.stage.addChild(this.yesnoSpr);
	}

	_hide() {
		this.stage.removeChild(this.yesnoSpr);
	}
}*/

class SwitchStats extends Menu {
	private index: number;
	private switchstatsSpr: PIXI.Sprite;

	constructor(game: GameV2, index: number) {
		super(game, [[0, 1, "down"], [1, 2, "down"]],
					 [[96, 96], [96, 112], [96, 128]],
					 () => Input.releaseArrows(), [
						new PIXI.Rectangle(89, 91, 71, 17),
						new PIXI.Rectangle(89, 108, 71, 16),
						new PIXI.Rectangle(89, 124, 71, 20)
					 ]);
		this.index = index;
		this.switchstatsSpr = new PIXI.Sprite(switchstatsTexture);
		this.switchstatsSpr.x = 88;
		this.switchstatsSpr.y = 88;
	}

	listen() {
		const member = this.game.getSimulatedPlayerMember(this.index);
		if (Input.back()) {
			Input.releaseBack();
			this.game.popMenu();
		} else if (Input.selected()) {
			Input.releaseSelect();
			PIXI_SOUND.play('pressab');
			if (this.state === 0) {
				if (member.hp <= 0) {
					this.selectMessage(["There's no will to ", "battle!" ]);
				} else if (member === this.game.getSimulatedPlayer()) {
					const name = GameV2.getTrueName(this.game.getSimulatedPlayer().name);
					this.selectMessage([name, "is already out."]);
				} else {
					this.game.switch(this.index);
				}
			} else if (this.state === 1) {
				this.selectMessage(["STATS menu is", "not finished." ]);
			} else {
				this.game.popMenu();
			}
		} else {
			super.listen();
		}
	}

	_show() {
		this.stage.addChild(this.switchstatsSpr);
	}

	_hide() {
		this.stage.removeChild(this.switchstatsSpr);
	}
}

function createTeamViewTransitions(length: number): [Transition[], [number, number][]] {
	let trans: Transition[] = [];
	let pos: ArrowPos[] = [];
	for (let i = 0; i < length; i++) {
		trans.push([i, i + 1, "down"]);
		pos.push([0, 8 + i * 16]);
	}
	trans.push([length, 0, "down"]);
	pos.push([0, 8 + length * 16]);
	return [ trans, pos ];
}

function createTeamViewTouchAreas(length: number): PIXI.Rectangle[] {
	const areas: PIXI.Rectangle[] = [
		new PIXI.Rectangle(0, 0, 160, 23)
	];
	for (let i = 0; i < length - 1; i++) {
		areas.push(new PIXI.Rectangle(0, 23 + i * 16, 160, 16));
	}
	areas.push(new PIXI.Rectangle(0, 23 + (length - 1) * 16, 100, 13));
	return areas;
}

abstract class TeamView extends Menu {
	private message: string;
	private canCancel: boolean;
	private iconSpr?: PIXI.Sprite[];
	private fntText?: Text[];
	public stats?: HPStatsView[];
	private cancelTxt?: Text;
	private messageSpr: PIXI.Sprite;
	private messageTxt: Text;

	constructor(game: GameV2, message: string, canCancel = true) {
		const teamLength = game.battleInfo.info.player.team.length;
		const [ trans, pos ] = createTeamViewTransitions(teamLength);
		super(game, trans, pos, Input.releaseArrows, 
			createTeamViewTouchAreas(teamLength));
		this.message = message;

		this.messageSpr = new PIXI.Sprite(messageTexture);
		this.messageSpr.y = Graphics.GAMEBOY_HEIGHT - 32;
		this.messageTxt = new Text(this.stage, 8, Graphics.GAMEBOY_HEIGHT - 16);

		this.canCancel = canCancel;
		this.state = 0;
		// this.state = this.game.teamViewIndex;
	}

	private generateGraphics() {
		const teamLength = this.game.battleInfo.info.player.team.length;
		this.iconSpr = [];
		this.fntText = [];
		this.stats = [];
		for (let i = 0; i < teamLength; i++) {
			const member: Pokemon = this.game.getSimulatedPlayerMember(i);
			const memberInfo = this.game.battleInfo.info.player.team[i];
			const icon = this.game.battleInfo.data[memberInfo.id].icon || 0;

			this.fntText[i] = new Text(this.stage, 40, 16 + i * 16);
			if (member.hp <= 0) {
				this.fntText[i].change("FNT");
			}

			const view = new HPStatsView(this.stage, 24, 8 + i * 16, {
				hpTextX: 10, hpTextY: 0, lvlX: 6, lvlY: 1, hpbarX: 8, hpbarY: 1,
				statusX: -4
			});
			this.stats.push(view);
			view.show(memberInfo, {
				hp: member.hp,
				maxHp: member.maxhp,
				condition: member.status
			});

			const spr = new PIXI.Sprite(Graphics.icons[icon][0]);
			spr.x = 0;
			spr.y = 4 + i * 16;
			this.iconSpr.push(spr);
		}
		this.cancelTxt = new Text(this.stage, 8, 8 + teamLength * 16);
		this.cancelTxt.change("CANCEL");
	}

	// refresh team view with a new team
	/*
	refresh(team: PlayerMember[]) {
		const oldState = this.state;
		this.team = team;
		const [ trans, pos ] = createTeamViewTransitions(team);
		this.reset(trans, pos, Input.releaseArrows);
		this.state = Math.min(oldState, pos.length - 1);
		this.hide();
		this.generateGraphics();
		this.game.addMenu(this);
	}
	*/

	exit(then?: DeepEvent) {
		this.game.getEventDriver().append(Events.flatten([
			() => this.arrowSpr.texture = arrowTexture2,
			Events.wait(10),
			() => this.game.popMenu(),
			then
		]));
	}

	_jumpRate(i: number) {
		const member = this.game.getSimulatedPlayerMember(i);
		if (member.hp <= 0) return [ 1, -1000 ];
		return [ 32, 16 ];
	}

	_animRate(i: number) {
		const member = this.game.getSimulatedPlayerMember(i);
		if (member.hp <= 0) return [ 270, 135 ];
		if (member.hp <= member.maxhp / 2) return [ 135, 67 ];
		return [ 16, 10 ];
	}

	update() {
		if (this.stats == null || this.iconSpr == null) {
			throw new Error("TeamView.update: updating TeamView before shown");
		}
		super.update();
		// this.game.teamViewIndex = this.state;

		this.stats.forEach(s => s.update());
		this.iconSpr.forEach((s, i) => {
			const memberInfo = this.game.battleInfo.info.player.team[i];
			const icon = this.game.battleInfo.data[memberInfo.id].icon || 0;
			s.x = this.state === i ? 8 : 0;

			const [ jtime, jswitch ] = this._jumpRate(i);
			const [ atime, aswitch ] = this._animRate(i);

			s.y = 4 + i * 16 + (this.state === i && this.game.getFrames() % jtime < jswitch ? -2 : 0);
			s.texture = Graphics.icons[icon][this.game.getFrames() % atime < aswitch ? 0 : 1];
		});
	}

	protected deny() {
		Input.releaseBack();
		this.game.getEventDriver().append(Events.flatten([
			() => this.arrowSpr.texture = arrowTexture2,
			this.game.view.sfx("pressab", true),
			this.game.view.sfx("denied", true),
			{
				init: () => this.arrowSpr.visible = false,
				done: t => t >= 4
			},
			() => {
				this.arrowSpr.texture = arrowTexture;
				this.arrowSpr.visible = true;
			}
		]));
	}

	listen() {
		if (Input.back()) {
			if (this.canCancel) {
				PIXI_SOUND.play('pressab');
				Input.releaseBack();
				this.exit();
			} else {
				this.deny();
			}
		}
		else if (Input.selected()) {
			Input.releaseSelect();
			if (this.state === this.states - 1) {
				if (this.canCancel) {
					PIXI_SOUND.play('pressab');
					this.exit();
				} else {
					this.deny();
				}
			} else {
				PIXI_SOUND.play('pressab');
				this.handle();
			}
		} else {
			super.listen();
		}
	}

	/* Executed when selecting a team member. */
	protected abstract handle(): void;

	/* Executed when leaving the menu (before textbox is shown) */
	protected onExit(): DeepEvent {
		return {};
	}

	_show() {
		this.generateGraphics();
		const driver = this.game.getEventDriver();
		driver.force(this.game.view.hidePlayer());
		driver.force(this.game.view.hideOpponent());
		driver.force(this.game.view.hidePlayerStats());
		driver.force(this.game.view.hideOpponentStats());
		this.stage.addChild(this.messageSpr);
		this.messageTxt.change(this.message);
		// render icon sprites from bottom to top
		for (let i = this.iconSpr!.length - 1; i >= 0; i--) {
			this.stage.addChild(this.iconSpr![i]);
		}
	}

	_hide() {
		if (this.stats == null || this.iconSpr == null || this.fntText == null || this.cancelTxt == null) {
			throw new Error("TeamView._hide: hiding TeamView before shown");
		}
		this.stats.forEach(s => s.hide());
		this.iconSpr.forEach(s => this.stage.removeChild(s));
		this.fntText.forEach(t => t.clear());
		this.stage.removeChild(this.messageSpr);
		this.cancelTxt.clear();
		this.messageTxt.clear();
		
		const driver = this.game.getEventDriver();
		driver.force(this.game.view.showPlayer());
		driver.force(this.game.view.showOpponent());
		driver.force(this.game.view.showPlayerStats());
		driver.force(this.game.view.showOpponentStats());
	}
}

class SwitchoutTeamView extends TeamView {
	private roar: boolean;

	constructor(game: GameV2, canCancel=true, roar=false) {
		super(game, "Which member?", canCancel);
		this.roar = roar;
	}

	handle() {
		const member = this.game.getSimulatedPlayerMember(this.state);
		if (member.hp <= 0) {
			this.selectMessage(["There's no will to ", "battle!" ]);
		} else if (member === this.game.getSimulatedPlayer()) {
			if (this.roar) {
				this.selectMessage([`${GameV2.getTrueName(member.name)}`, "is too afraid!"]);
			} else {
				this.selectMessage([`${GameV2.getTrueName(member.name)}`, "is already out."]);
			}
		} else {
			this.exit(() => this.game.switch(this.state));
		}
	}
}

class GeneralTeamView extends TeamView {
	constructor(game: GameV2) {
		super(game, "Choose a member.");
	}

	handle() {
		this.arrowSpr.texture = arrowTexture2;
		this.game.showTeamViewOptions(this.state);
	}

	continue() {
		this.arrowSpr.texture = arrowTexture;
	}
}

export { 
	Menu, 
	Options,
	Moves, 
	/* YesNo, */ 
	SwitchStats, 
	SwitchoutTeamView, 
	GeneralTeamView, 
	TeamView 
};