import { Injectable } from '@angular/core';
import { PlayerMapEntity } from '@app/classes/Characters/player-map-entity';
import { Item } from '@app/classes/Items/item';
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
