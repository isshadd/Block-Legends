import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { BaseTile } from './base-tile';

@Injectable({
    providedIn: 'root',
})
export class DoorTile extends BaseTile {
    name: String = 'DoorTile';
    description: String = 'DoorTile';
    imageUrl: String = 'assets/images/tiles/door.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
}
