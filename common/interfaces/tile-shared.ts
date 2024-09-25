import { ItemShared } from './item-shared';

export interface TileShared {
    name: string;
    item?: ItemShared | null;
}
