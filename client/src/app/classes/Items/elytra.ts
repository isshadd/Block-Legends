import { Injectable } from '@angular/core';
import { ItemType } from '@common/enums/item-type';
import { Item } from './item';

@Injectable({
    providedIn: 'root',
})
export class Elytra extends Item {
    type: ItemType = ItemType.Elytra;
    description: string = 'Ailes';
    imageUrl: string = 'assets/images/item/elytra.png';
}
