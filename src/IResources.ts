
type Music = "battle" | "victory";

interface IResources {
    uniforms: { [index: string]: { step: number } };
    playingMusic: PIXI.sound.Sound | null;
    getMusic(music: Music): PIXI.sound.Sound | undefined;
    getShader(name: string): PIXI.Filter;
    getCry(id: string): string;
    getOpponentTrainerTexture(): PIXI.Texture | undefined;
    getPlayerTrainerTexture(): PIXI.Texture | undefined;
    getFront(id: string): PIXI.Texture[];
    getBack(id: string): PIXI.Texture;
}

export { IResources, Music };