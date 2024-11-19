import { Item } from '../Items/item';
import { WalkableTile } from './walkable-tile';

export class TerrainTile extends WalkableTile {
    item: Item | null = null;

    isTerrain(): boolean {
        return true;
    }

    removeItem() {
        this.item = null;
    }
}
