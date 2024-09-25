import { TileShared } from './tile-shared';

export interface MapShared {
    _id?: string;
    name: string;
    description: string;
    size: number;
    tiles: TileShared[][];
}
