
interface IResources {
    uniforms: { [index: string]: { step: number } };
    getMusic(): PIXI.sound.Sound;
    getShader(name: string): PIXI.Filter;
    getCry(id: string): string;
    getOpponentTrainerTexture(): PIXI.Texture | undefined;
    getPlayerTrainerTexture(): PIXI.Texture | undefined;
    getFront(id: string): PIXI.Texture[];
    getBack(id: string): PIXI.Texture;
}

export default IResources;