import { Injectable } from '@angular/core';
import { ItemType } from '@common/enums/item-type';
import { Item } from './item';

@Injectable({
    providedIn: 'root',
})
export class Flag extends Item {
    type: ItemType = ItemType.Flag;
    description: string = 'Drapeau. Prends-le si tu veux gagner.';
    imageUrl: string = 'assets/images/item/flag.png';
}
