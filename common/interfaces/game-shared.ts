import { GameMode } from '../enums/game-mode';
import { MapSize } from '../enums/map-size';
import { TileShared } from './tile-shared';

export interface GameShared {
    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    name: string;
    description: string;
    size: MapSize;
    mode: GameMode;
    imageUrl: string;
    isVisible: boolean;
    tiles: TileShared[][];
}
