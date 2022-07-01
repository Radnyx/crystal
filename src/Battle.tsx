import React, { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';

import { default as PIXI_SOUND } from "pixi-sound";
import * as PIXI from 'pixi.js';
import * as Input from './Input.js';
import * as Graphics from './Graphics';
import { ResourceLoader, Resources } from './Resources';
import { BattleInfo, BattleObject } from "./BattleObjects";

import GameV2 from './GameV2';
import View from "./View";
import Interpreter from './Interpreter';
import { Script } from './Script';
import { EventDriver } from './Event';

import * as moves from "./MoveInfo";

const SCALE = 3;
const APP_WIDTH = Graphics.GAMEBOY_WIDTH * SCALE;
const APP_HEIGHT = Graphics.GAMEBOY_HEIGHT * SCALE;

let app: PIXI.Application = null;
let renderTexture: PIXI.RenderTexture = null;

function initWindow() {
	if (document.getElementById("battle-view").childElementCount !== 0) return;

	// Blown-up pixelated textures
	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

	// Application drawing window
	app = new PIXI.Application({
		width: APP_WIDTH,
		height: APP_HEIGHT,
		backgroundColor: 0xF8F8F8
	});

	app.view.style.borderWidth = "4px";
	app.view.style.borderColor = "black";
	app.view.style.borderStyle = "solid";
	document.getElementById("battle-view").appendChild(app.view);

	// Official GAMEBOY screen
	renderTexture = PIXI.RenderTexture.create({
		width: Graphics.GAMEBOY_WIDTH,
		height: Graphics.GAMEBOY_HEIGHT
	});

	// Stretch screen to application window
	const sprite = new PIXI.Sprite(renderTexture);
	sprite.width = APP_WIDTH;
	sprite.height = APP_HEIGHT;
	app.stage.addChild(sprite);
	app.stage.interactive = true;
	app.stage.cursor = "pointer";
}

const testMoveAnim = move => (stuff?: [BattleInfo, Resources]) => {
	if (stuff == null) return;
	const [ battleInfo, resources ] = stuff; 

	const view = new View(app, resources);
	const interpreter = new Interpreter(view, battleInfo);
	PIXI_SOUND.add(moves[move].sfx, "sfx/attacks/" + moves[move].sfx + ".wav");

	function performMove(move: string, isPlayer: boolean): Script {
		return [
			isPlayer 
				? "HIDE_PLAYER_STATS"
				: "HIDE_OPPONENT_STATS",
			{do:"WAIT",frames:16},
			{do:"MOVE_SFX",move,isPlayer},
			{do:"EFFECT",name:move,isPlayer},
			{do:"WAIT",frames:16},
			isPlayer 
				? "SHOW_PLAYER_STATS"
				: "SHOW_OPPONENT_STATS",
			// post anim
			{ do: "EFFECT", name:move+"_POST", isPlayer }
		];
	}

	const driver = new EventDriver();
	for (let i = 0; i < 10; i++) {
		driver.append(interpreter.interpret(null, [
			{do:"TEXT",text:[`${i}`], auto:true},
			{do:"SET_PLAYER",index:0},
			{do:"SET_OPPONENT",index:0},
			"SHOW_PLAYER",
			"SHOW_OPPONENT",
			"SHOW_PLAYER_STATS",
			"SHOW_OPPONENT_STATS",
			{do:"WAIT",frames:60},
			performMove(move, true),
			performMove(move, false)
		]));
	}

	// Game loop
	app.ticker.add(() => {
		driver.update();
		view.update();
		app.renderer.render(view.getFullStage(), renderTexture);
	});
}

let oldTicker: (() => void) | null = null;

async function startNew(stuff?: [BattleInfo, Resources]): Promise<GameV2 | null> {
	if (stuff == null) return null;
	const [ battleInfo, resources ] = stuff; 

	if (oldTicker != null) {
		app.ticker.remove(oldTicker);
	}

	const view = new View(app, resources);
	const game = new GameV2(view, battleInfo);

	// Game loop
	oldTicker = () => {
		game.update();
		app.renderer.render(view.getFullStage(), renderTexture);
	}
	app.ticker.add(oldTicker);

	return game;
}

/**
 * @param battle JSON representation of battle
 * @returns promise containing team information and map of loaded assets, or null if `battle` is null
 */
async function getResources(battle: BattleObject, resourceLoader: ResourceLoader): 
		Promise<[BattleInfo, Resources] | null> {	
	if (process.env.NODE_ENV === "development") {
		console.log("getResources", battle);
	}
	if (battle == null) return null;

	const { fighterLoader, storageLoader } = resourceLoader;

	// 1) load the Fighter info for both teams, this contains
	//    basic information about each fighter, and links to DB resources
	fighterLoader.addTeam(battle.player);
	fighterLoader.addTeam(battle.opponent);	

	const fighters = await fighterLoader.load();
	for (const fighter of Object.values(fighters)) {
		storageLoader.add(fighter.front);
		storageLoader.add(fighter.back);
		storageLoader.add(fighter.cry);
	}

	if (process.env.NODE_ENV === "development") {
		console.log("Downloading assets...");
	}
	// 2) use DB links to download all necessary assets
	const assets = await storageLoader.load();
	for (const [ url, asset ] of Object.entries(assets)) {
		resourceLoader.add(url, asset);
	}

	if (process.env.NODE_ENV === "development") {
		console.log("Loading assets into memory...");
	}
	// 3) load all downloaded or public assets, build textures, and so on
	return resourceLoader.loadTeams({ info: battle, data: fighters });
}

interface BattleProps {
	battle: BattleObject;
	resourceLoader: ResourceLoader;
	// indicates game has been loaded
	setGame: (game: GameV2) => void;
}

let focused = true;
let keepFocus = true;

const Battle = forwardRef<any, BattleProps>
	(({ battle, resourceLoader, setGame }, ref) => {

	const gameRef = useRef<GameV2>(null);

	function focus() {
		Input.focus();
		if (!focused) {
			gameRef.current.view.resumeMusic();
			app.stage.getChildAt(0).filters = [ ];
			app.stage.removeChildAt(1);
			app.stage.removeChildAt(1);
		}
		focused = true;
	}

	useImperativeHandle(ref, () => ({ 
		keepFocus: () => keepFocus = true,
		focus
	}));

	useEffect(() => {
		document.title = "Crystal Battle Maker";
		document.addEventListener('keydown', Input.keyDown);
  		document.addEventListener('keyup', Input.keyUp);
		function unfocus() {
			if (keepFocus) {
				keepFocus = false;
				return;
			}
			// click outside game to lose focus
			Input.unfocus();
			if (focused) {
				gameRef.current.view.pauseMusic();
				app.stage.getChildAt(0).filters = [ new PIXI.filters.BlurFilter(2) ];
				const rectangle = PIXI.Sprite.from(PIXI.Texture.WHITE);
				rectangle.width = APP_WIDTH;
				rectangle.height = APP_HEIGHT / 2;
				rectangle.tint = 0x000000;
				rectangle.alpha = 0.7;
				rectangle.anchor.set(0.5);
				rectangle.position.set(APP_WIDTH / 2, APP_HEIGHT / 2);
				app.stage.addChild(rectangle);
				let text = new PIXI.Text(
					"Controls:\nPress X to select option\nZ to go back\nUp/Down/Left/Right to move cursor\n\nClick to re-gain focus!",
					{ 
						fontFamily: "Arial", 
						fontSize: 24, 
						fill: 0xFFFFFF, 
						align: "center",
						fontWeight: "bold"
					}
				);
				text.anchor.set(0.5);
				text.position.set(APP_WIDTH / 2, APP_HEIGHT / 2);
				app.stage.addChild(text);
			}
			focused = false;
		}
		document.addEventListener("click", unfocus);

		initWindow();

		document.getElementById("battle-view").addEventListener("click", event => {
			event.stopPropagation();
			focus();
		});

		function changeVisibility() {
			if (document.visibilityState === "hidden") {
				gameRef.current?.view.pauseMusic();
			} else if (focused) {
				gameRef.current?.view.resumeMusic();
			}
		}
		document.addEventListener("visibilitychange", changeVisibility);

		return () => {
			document.removeEventListener('keydown', Input.keyDown);
			document.removeEventListener('keyup', Input.keyUp);
			document.removeEventListener("click", unfocus);
			document.removeEventListener("visibilitychange", changeVisibility);
		}
	}, []);

  	useEffect(() => {
        if (process.env.NODE_ENV === "development") {
			console.log("Loading new game...");
		}
		getResources(battle, resourceLoader)
			?.then(startNew)
			?.then(game => {
				setGame(game);
				gameRef.current?.view.stopMusic();
				gameRef.current = game;
				gameRef.current?.view.startMusic();
			})
			?.catch(console.error);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [battle, resourceLoader]);

	return <div id={"battle-view"}></div>;
});

export default Battle;