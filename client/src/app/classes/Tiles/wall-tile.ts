import { Injectable } from '@angular/core';
import { Tile } from '@app/classes/Tiles/tile';
import { TileType } from '@common/enums/tile-type';

@Injectable({
    providedIn: 'root',
})
export class WallTile extends Tile {
    type: TileType = TileType.Wall;
    description: string = 'Mur. Impossible de passer.';
    imageUrl: string = 'assets/images/tiles/brickwall.jpg';
}
