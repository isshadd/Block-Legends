import { Injectable } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { PlayerMapEntity } from '../Characters/player-map-entity';
import { Tile } from './tile';

@Injectable({
    providedIn: 'root',
})
export class TerrainTile extends Tile {
    item: Item | null = null;
    player: PlayerMapEntity | null = null;

    isTerrain(): boolean {
        return true;
    }
}
