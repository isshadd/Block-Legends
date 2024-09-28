import { TileShared } from '../../tile-shared';

export class UpdateGameSharedDto {
    name?: string;
    description?: string;
    imageUrl?: string;
    lastModificationDate: Date;
    isVisible?: boolean;
    tiles?: TileShared[][];
}
