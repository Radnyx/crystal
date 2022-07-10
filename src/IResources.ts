import * as PIXI from "pixi.js-legacy";
import pixiSound from "@pixi/sound";

type Music = "battle" | "victory";

interface IResources {
    uniforms: { [index: string]: { step: number } };
    playingMusic: pixiSound.Sound | null;
    getMusic(music: Music): pixiSound.Sound | undefined;
    getShader(name: string): PIXI.Filter;
    getCry(id: string): string;
    getOpponentTrainerTexture(): PIXI.Texture | undefined;
    getPlayerTrainerTexture(): PIXI.Texture | undefined;
    getFront(id: string): PIXI.Texture[];
    getBack(id: string): PIXI.Texture;
}

export { IResources, Music };