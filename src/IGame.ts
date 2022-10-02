interface IGame {
    pass(): void;
    showOptions(): void;
    showMoves(move: string[]): void;
    forcePlayerSwitch(): void;
    getPlayerTeamHealth(): number[];
    getOpponentTeamHealth(): number[];
    loadMove(move: string): Promise<void>;
}

export default IGame;