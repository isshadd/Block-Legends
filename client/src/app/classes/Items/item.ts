import { Injectable } from '@angular/core';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { ItemType } from '@common/enums/item-type';
import { Vec2 } from '@common/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class Item implements PlaceableEntity {
    type: ItemType;
    description: string;
    imageUrl: string; // minecraftWiki
    coordinates: Vec2 = { x: -1, y: -1 };
    visibleState: VisibleState = VisibleState.NotSelected;
    isPlaced: boolean = false;
    itemLimit: number = 1;

    isItem(): boolean {
        return true;
    }
}
