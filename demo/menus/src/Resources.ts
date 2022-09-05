import * as PIXI from "pixi.js-legacy";
import { BattleObject, Context, moveInfo, TeamObject } from "../../../src";
import * as PIXI_SOUND from "@pixi/sound";
import { IResources, Music } from "../../../src";

function getMovesFromTeam(team: TeamObject): string[] {
    return team.team.map(member => member.moves).flat().filter(m => m !== "");
}

export default class Resources implements IResources {
    uniforms: { [index: string]: { step: number; }; } = {};
    playingMusic: PIXI_SOUND.Sound | null = null;

    private readonly demoFrontTexture: PIXI.Texture;
    private readonly demoBackTexture: PIXI.Texture;

    private readonly defaultFilter: PIXI.Filter;

    constructor(battleObject: BattleObject) {
        this.demoFrontTexture = PIXI.Texture.from("demofront.png");
        this.demoBackTexture = PIXI.Texture.from("demoback.png");
        this.defaultFilter = new PIXI.Filter();
        const loader = Context.createPIXILoader();
        loader.add("pressab", "pressab.wav");
        const moves = new Set([getMovesFromTeam(battleObject.player), getMovesFromTeam(battleObject.opponent)].flat());
        for (const move of [...moves]) {
            const moveStill = move + "_STILL";
            if (moveInfo[moveStill] != null) {
                moves.add(moveStill);
            }
        }
        for (const move of moves) {
            const moveData = moveInfo[move];
            if (moveData.sfx)
                loader.add(moveData.sfx, `../../attacksfx/${moveData.sfx}.wav`);
        }
        loader.load();
    }

    getMusic(music: Music): PIXI_SOUND.Sound | undefined {
        throw new Error("Method not implemented.");
    }
    getShader(name: string): PIXI.Filter {
        return this.defaultFilter;
    }
    getCry(id: string): string | undefined {
        return undefined;
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