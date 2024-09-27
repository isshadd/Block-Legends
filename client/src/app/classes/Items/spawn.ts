import { Injectable } from '@angular/core';
import { ItemType } from '@common/enums/item-type';
import { Item } from './item';

@Injectable({
    providedIn: 'root',
})
export class Spawn extends Item {
    type: ItemType = ItemType.Spawn;
    description: string = 'Point de Départ';
    imageUrl: string = 'assets/images/item/bed.png';
    itemLimit: number = 6;
}
