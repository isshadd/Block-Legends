import { Injectable } from '@angular/core';
import { Tile } from '@app/interfaces/tile';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class WallTile implements Tile {
    name: string = 'WallTile';
    description: string = 'WallTile';
    imageUrl: string = 'assets/images/tiles/brickwall.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
}
