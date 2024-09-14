import { Injectable } from '@angular/core';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class Item implements PlaceableEntity {
    name: String = 'Item';
    description: String = 'Item';
    imageUrl: String = 'assets/images/item/baseItem.png'; //minecraftWiki
    coordinates: Vec2 = { x: -1, y: -1 };
    constructor() {}
}
