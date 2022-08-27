import * as PIXI from "pixi.js-legacy";
import * as PIXI_SOUND from "@pixi/sound";
import { IResources, Music } from "../../../src";

export default class Resources implements IResources {
    uniforms: { [index: string]: { step: number; }; } = {};
    playingMusic: PIXI_SOUND.Sound | null = null;

    private readonly demoFrontTexture: PIXI.Texture;
    private readonly demoBackTexture: PIXI.Texture;

    private readonly defaultFilter: PIXI.Filter;

    constructor() {
        this.demoFrontTexture = PIXI.Texture.from("demofront.png");
        this.demoBackTexture = PIXI.Texture.from("demoback.png");
        this.defaultFilter = new PIXI.Filter();
        PIXI_SOUND.sound.add("pressab", "pressab.wav");
    }

    getMusic(music: Music): PIXI_SOUND.Sound | undefined {
        throw new Error("Method not implemented.");
    }
    getShader(name: string): PIXI.Filter {
        return this.defaultFilter;
    }
    getCry(id: string): string {
        return "";
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