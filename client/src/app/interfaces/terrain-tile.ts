import { Item } from '@app/classes/Items/item';
import { Tile } from './tile';

export interface TerrainTile extends Tile {
    item: Item | null;
}
