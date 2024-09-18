import { Injectable } from '@angular/core';
import { Tile } from '@app/interfaces/tile';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class DoorTile implements Tile {
    name: string = 'DoorTile';
    description: string = 'DoorTile';
    imageUrl: string = 'assets/images/tiles/door.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
}
