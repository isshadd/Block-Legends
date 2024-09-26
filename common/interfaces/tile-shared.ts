import { TileType } from '@common/enums/tile-type';
import { ItemShared } from './item-shared';

export interface TileShared {
    type: TileType;
    item?: ItemShared | null;
}
