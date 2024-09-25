import { Injectable } from '@angular/core';
import { Tile } from '@app/classes/Tiles/tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { Vec2 } from '@common/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class DoorTile extends Tile {
    name: string = 'DoorTile';
    description: string = 'Porte';
    imageUrl: string = 'assets/images/tiles/door.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
    visibleState: VisibleState = VisibleState.notSelected;
}
