import { Injectable } from '@angular/core';
import { TileType } from '@common/enums/tile-type';
import { Tile } from './tile';

@Injectable({
    providedIn: 'root',
})
export class DoorTile extends Tile {
    type: TileType = TileType.Door;
    description: string = "Porte fermée. Ne peut être franchie que si elle est ouverte. Cliquez avec une autre porte pour l'ouvrir.";
    imageUrl: string = 'assets/images/tiles/door.jpg';

    isDoor(): boolean {
        return true;
    }
}
