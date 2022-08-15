import * as PIXI from "pixi.js-legacy";
import { Sound } from "@pixi/sound";
import { IResources, Music } from "../../src";

export default class Resources implements IResources {
    uniforms: { [index: string]: { step: number; }; } = {};
    playingMusic: Sound | null = null;

    private readonly demoFrontTexture: PIXI.Texture;
    private readonly demoBackTexture: PIXI.Texture;

    constructor() {
        this.demoFrontTexture = PIXI.Texture.from("demofront.png");
        this.demoBackTexture = PIXI.Texture.from("demoback.png");
    }

    getMusic(music: Music): Sound | undefined {
        throw new Error("Method not implemented.");
    }
    getShader(name: string): PIXI.Filter {
        throw new Error("Method not implemented.");
    }
    getCry(id: string): string {
        throw new Error("Method not implemented.");
    }
    getOpponentTrainerTexture(): PIXI.Texture<PIXI.Resource> | undefined {
        return undefined;
    }
    getPlayerTrainerTexture(): PIXI.Texture<PIXI.Resource> | undefined {
        return undefined;
    }
    getFront(id: string): PIXI.Texture<PIXI.Resource>[] {
        return [ this.demoFrontTexture ];
    }
    getBack(id: string): PIXI.Texture<PIXI.Resource> {
        return this.demoBackTexture;
    }
};