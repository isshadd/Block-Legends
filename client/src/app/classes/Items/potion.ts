import { Injectable } from '@angular/core';
import { ItemType } from '@common/enums/item-type';
import { Item } from './item';

@Injectable({
    providedIn: 'root',
})
export class Potion extends Item {
    type: ItemType = ItemType.Potion;
    description: string = 'Potion de santé. La guérison est essentielle.';
    imageUrl: string = 'assets/images/item/potion.png';
}
