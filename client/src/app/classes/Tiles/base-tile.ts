import { Injectable } from '@angular/core';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class BaseTile implements PlaceableEntity {
    name: String = 'BaseTile';
    description: String = 'BaseTile';
    imageUrl: String = 'assets/images/tiles/grass.png';
    coordinates: Vec2 = { x: -1, y: -1 };
    constructor() {}
}
