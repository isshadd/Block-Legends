import { GameShared } from './game-shared';

export interface GameBoardParameters {
    game: GameShared;
    spawnPlaces: [number, string][];
    turnOrder: string[];
}
