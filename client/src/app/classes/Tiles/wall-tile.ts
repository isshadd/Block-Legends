import { Injectable } from '@angular/core';
import { Tile } from '@app/classes/Tiles/tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { Vec2 } from '@common/vec2';

@Injectable({
    providedIn: 'root',
})
export class WallTile extends Tile {
    name: string = 'WallTile';
    description: string = 'Mur';
    imageUrl: string = 'assets/images/tiles/brickwall.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
    visibleState: VisibleState = VisibleState.notSelected;
}
