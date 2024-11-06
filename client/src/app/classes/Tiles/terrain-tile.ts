import { Injectable } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { WalkableTile } from './walkable-tile';

@Injectable({
    providedIn: 'root',
})
export class TerrainTile extends WalkableTile {
    item: Item | null = null;

    isTerrain(): boolean {
        return true;
    }

    removeItem() {
        this.item = null;
    }
}
