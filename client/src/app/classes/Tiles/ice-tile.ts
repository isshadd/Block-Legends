import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { BaseTile } from './base-tile';

@Injectable({
    providedIn: 'root',
})
export class IceTile extends BaseTile {
    name: string = 'IceTile';
    description: string = 'IceTile';
    imageUrl: string = 'assets/images/tiles/ice.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
}
