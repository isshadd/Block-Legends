import { Injectable } from '@angular/core';
import { TileType } from '@common/enums/tile-type';
import { Tile } from './tile';

@Injectable({
    providedIn: 'root',
})
export class DoorTile extends Tile {
    type: TileType = TileType.Door;
    description: string = 'Ouvrir la porte pour passer';
    imageUrl: string = 'assets/images/tiles/door.jpg';

    isDoor(): boolean {
        return true;
    }
}
