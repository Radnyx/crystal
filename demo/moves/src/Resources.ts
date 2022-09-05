import * as PIXI from "pixi.js-legacy";
import { Sound } from "@pixi/sound";
import { Context, IResources, moveInfo, Music } from "../../../src";

export default class Resources implements IResources {
    uniforms: { [index: string]: { step: number; }; } = {};
    playingMusic: Sound | null = null;
    private readonly loader = Context.createPIXILoader();

    private readonly demoFrontTexture: PIXI.Texture;
    private readonly demoBackTexture: PIXI.Texture;

    constructor(move?: string) {
        this.demoFrontTexture = PIXI.Texture.from("demofront.png");
        this.demoBackTexture = PIXI.Texture.from("demoback.png");
        move && this.loadMove(move);
    }

    loadMove(move: string) {
        const moveData = moveInfo[move];
        if (moveData.sfx)
            this.loader.add(moveData.sfx, `attacksfx/${moveData.sfx}.wav`);
        this.loader.load();
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