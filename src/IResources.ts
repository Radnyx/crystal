import * as PIXI from "pixi.js-legacy";
import * as PIXI_SOUND from "@pixi/sound";

type Music = "battle" | "victory";

interface IResources {
    uniforms: { [index: string]: { step: number } };
    playingMusic: PIXI_SOUND.Sound | null;
    getMusic(music: Music): PIXI_SOUND.Sound | undefined;
    getShader(name: string): PIXI.Filter;
    getCry(id: string): string | undefined;
    getOpponentTrainerTexture(): PIXI.Texture | undefined;
    getPlayerTrainerTexture(): PIXI.Texture | undefined;
    getFront(id: string): PIXI.Texture[];
    getBack(id: string): PIXI.Texture;
}

export { IResources, Music };