import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { BaseTile } from './base-tile';

@Injectable({
    providedIn: 'root',
})
export class WallTile extends BaseTile {
    name: string = 'WallTile';
    description: string = 'WallTile';
    imageUrl: string = 'assets/images/tiles/brickwall.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
}
