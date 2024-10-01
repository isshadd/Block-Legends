import { Injectable } from '@angular/core';
import { TileType } from '@common/enums/tile-type';
import { Tile } from './tile';

@Injectable({
    providedIn: 'root',
})
export class OpenDoor extends Tile {
    type: TileType = TileType.OpenDoor;
    description: string = 'Porte Ouverte';
    imageUrl: string = 'assets/images/tiles/open-door.png';
}
