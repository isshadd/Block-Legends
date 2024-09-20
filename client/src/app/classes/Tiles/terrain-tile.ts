import { Injectable } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { Tile } from './tile';

@Injectable({
    providedIn: 'root',
})
export class TerrainTile extends Tile {
    item: Item | null;

    constructor(copy?: TerrainTile) {
        super(copy);
        this.item = copy?.item ?? null;
    }
}
