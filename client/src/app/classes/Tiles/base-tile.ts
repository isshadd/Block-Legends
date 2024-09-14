import { Injectable } from '@angular/core';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class BaseTile implements PlaceableEntity {
    name: string = 'BaseTile';
    description: string = 'BaseTile';
    imageUrl: string = 'assets/images/tiles/grass.png';
    coordinates: Vec2 = { x: -1, y: -1 };
}
