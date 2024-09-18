import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { BaseTile } from './base-tile';

@Injectable({
    providedIn: 'root',
})
export class WaterTile extends BaseTile {
    name: string = 'WaterTile';
    description: string = 'WaterTile';
    imageUrl: string = 'assets/images/tiles/water.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
}
