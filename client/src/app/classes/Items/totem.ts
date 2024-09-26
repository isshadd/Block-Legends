import { Injectable } from '@angular/core';
import { ItemType } from '@common/enums/item-type';
import { Item } from './item';

@Injectable({
    providedIn: 'root',
})
export class Totem extends Item {
    type: ItemType = ItemType.Totem;
    description: string = 'Totem';
    imageUrl: string = 'assets/images/item/totem.png';
}
