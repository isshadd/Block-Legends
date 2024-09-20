import { Injectable } from '@angular/core';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class Item implements PlaceableEntity {
    name: string = 'Item';
    description: string = 'Objet';
    imageUrl: string = 'assets/images/item/baseItem.png'; // minecraftWiki
    coordinates: Vec2 = { x: -1, y: -1 };
    visibleState: VisibleState = VisibleState.notSelected;
    testItem: string = 'test'; //TODO: remove this
}
