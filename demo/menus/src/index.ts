import * as PIXI from "pixi.js-legacy";
import { Input, GameV2, Graphics, MemberObject, View, BattleInfo } from "../../../src/index";
import Resources from "./Resources";

const SCALE = 3;
const APP_WIDTH = Graphics.GAMEBOY_WIDTH * SCALE;
const APP_HEIGHT = Graphics.GAMEBOY_HEIGHT * SCALE;

let app: PIXI.Application | null = null;
let renderTexture: PIXI.RenderTexture | null = null;

function initWindow() {
	// Blown-up pixelated textures
	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    // Application drawing window
    app = new PIXI.Application({
        width: APP_WIDTH,
        height: APP_HEIGHT,
        backgroundColor: 0xF8F8F8
    });

	document.getElementById("app")?.appendChild(app.view);

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
	Input.focus();
	document.addEventListener("keydown", (e: any) => Input.keyDown(e));
	document.addEventListener("keyup", (e: any) => Input.keyUp(e));
}

initWindow();

const exampleMember1: MemberObject = {
	id: "demo",
	level: 15,
	gender: "none",
	moves: ["BODY SLAM","SCRATCH"],
	name: "BLASTOISE"
};

const exampleMember2: MemberObject = {
	id: "demo",
	level: 20,
	gender: "none",
	moves: ["BODY SLAM","SCRATCH"],
	name: "BLASTOISE"
};

const battleInfo: BattleInfo = {
	info: {
		player: {
			name: "PLAYER",
			trainer: "demoback.png",
			team: [ exampleMember1, exampleMember1, exampleMember1, exampleMember1 ]
		},
		opponent: {
			name: "OPPONENT",
			trainer: "demofront.png",
			team: [ exampleMember2, exampleMember2 ]
		}
	},
	data: {
		"demo": {
			baseAtk: 5,
			baseDef: 5,
			baseHp: 5,
			baseSpAtk: 5,
			baseSpDef: 5,
			baseSpd: 5,
			cry: "",
			front: "demofront.png",
			back: "demoback.png",
			name: "BLASTOISE",
			types: ["NORMAL"],
			anim: { delay: [ 0 ], ref: [ 0 ] }
		}
	}
};

const resources = new Resources(battleInfo.info);
const view = new View(app!, resources, true);
const game = new GameV2(view, battleInfo, true);

view.setPlayerTexture("demo");
view.setOpponentTexture("demo");

function tick() {
	game.update();
    app!.renderer.render(view.getFullStage(), { renderTexture: renderTexture! });
}


app!.ticker.add(tick);


