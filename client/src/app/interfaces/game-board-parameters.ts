import { GameShared } from '@common/interfaces/game-shared';

export interface GameBoardParameters {
    game: GameShared;
    spawnPlaces: [number, string][];
    turnOrder: string[];
}
