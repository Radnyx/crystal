import * as PIXI from "pixi.js-legacy";
import effects from "../../../src/Effect";
import { EventDriver, Events, Graphics, moveInfo, View } from "../../../src/index";
import Resources from "./Resources";
import Cookies from "js-cookie";

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
	app.stage.cursor = "pointer";
}

initWindow();

const defaultMove = Cookies.get("move");
const state = {
	setOnClick: false,
	setDefaultValue: defaultMove != null,
	move: defaultMove
}

const resources = new Resources(defaultMove);
const view = new View(app!, resources, true);
const eventDriver = new EventDriver();

view.setPlayerTexture("demo");
view.setOpponentTexture("demo");

eventDriver.append(Events.flatten([
	view.showPlayer(),
	view.showOpponent()
]));

app!.stage.addListener("click", () => {
	if (state.move) {
		const pan = moveInfo[state.move]!.pan || 1;
		const sfx = moveInfo[state.move]!.sfx;

		const preEffect = effects[state.move+"_PRE"];
		const mainEffect = effects[state.move];
		const postEffect = effects[state.move+"_POST"];
		eventDriver.append(Events.flatten([
			preEffect && preEffect.ply!(view),
			view.sfx(sfx, false, pan),
			mainEffect && mainEffect.ply!(view),
			postEffect && postEffect.ply!(view),

			
			preEffect && preEffect.opp!(view),
			view.sfx(sfx, false, -pan),
			mainEffect && mainEffect.opp!(view),
			postEffect && postEffect.opp!(view),
		]));
	}
});

function tick() {
	if (!state.setOnClick) {
		const useMoveButton = document.getElementById("useMove") as HTMLButtonElement;
		if (useMoveButton != null) {
			useMoveButton.onclick = useMove;
			state.setOnClick = true;
		}
	}
    eventDriver.update();
	view.update();
    app!.renderer.render(view.getFullStage(), { renderTexture: renderTexture! });
}

app!.ticker.add(tick);

function useMove() {
	const val = (document.getElementById("move") as HTMLInputElement).value.toUpperCase();
	state.move = val;
	Cookies.set("move", val);
	resources.loadMove(val);
}


