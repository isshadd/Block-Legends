import { TileShared } from '../../tile-shared';

export class UpdateGameSharedDto {
    name?: string;
    description?: string;
    imageUrl?: string;
    isVisible?: boolean;
    tiles?: TileShared[][];
}
