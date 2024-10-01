import { GameMode } from '../../../enums/game-mode';
import { MapSize } from '../../../enums/map-size';
import { TileShared } from '../../tile-shared';

export class CreateGameSharedDto {
    name: string;
    description: string;
    size: MapSize;
    mode: GameMode;
    imageUrl: string;
    isVisible: boolean;
    tiles: TileShared[][];
}
