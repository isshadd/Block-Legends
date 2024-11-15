export interface GameBattle {
    time: number;
    firstPlayerId: string;
    secondPlayerId: string;
    firstPlayerRemainingEvades: number;
    secondPlayerRemainingEvades: number;
    firstPlayerRemainingLife: number;
    secondPlayerRemainingLife: number;
    isFirstPlayerTurn: boolean;
}
