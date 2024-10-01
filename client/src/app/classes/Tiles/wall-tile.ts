import { Injectable } from '@angular/core';
import { Tile } from '@app/classes/Tiles/tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { TileType } from '@common/enums/tile-type';
import { Vec2 } from '@common/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class WallTile extends Tile {
    type: TileType = TileType.Wall;
    description: string = 'Mur. Impossible de passer.';
    imageUrl: string = 'assets/images/tiles/brickwall.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
    visibleState: VisibleState = VisibleState.NotSelected;
}
