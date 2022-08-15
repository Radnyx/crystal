import * as PIXI from "pixi.js-legacy";
import effects from "../../src/Effect";
import { EventDriver, Events, Graphics, View } from "../../src/index";
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
	app.stage.cursor = "pointer";
}

initWindow();

const state = {
	setOnClick: false,
	move: "DISABLE"
}

const resources = new Resources();
const view = new View(app!, resources);
const eventDriver = new EventDriver();

view.setPlayerTexture("demo");
view.setOpponentTexture("demo");

eventDriver.append(Events.flatten([
	view.showPlayer(),
	view.showOpponent()
]));

app!.stage.addListener("click", () => {
    eventDriver.append(Events.flatten([
		effects[state.move].ply!(view),
		effects[state.move].opp!(view)
	]));
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
	state.move = (document.getElementById("move") as HTMLInputElement).value;
}


