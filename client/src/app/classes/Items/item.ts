import { Injectable } from '@angular/core';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { ItemType } from '@common/enums/item-type';
import { Vec2 } from '@common/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class Item implements PlaceableEntity {
    type: ItemType = ItemType.Item;
    description: string = 'Objet';
    imageUrl: string = 'assets/images/item/baseItem.png'; // minecraftWiki
    coordinates: Vec2 = { x: -1, y: -1 };
    visibleState: VisibleState = VisibleState.notSelected;
    isPlaced: boolean = false;
    testItem: string = 'test'; //TODO: remove this
}
