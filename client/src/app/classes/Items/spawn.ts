import { Injectable } from '@angular/core';
import { ItemType } from '@common/enums/item-type';
import { Item } from './item';

const ITEM_LIMIT = 6;

@Injectable({
    providedIn: 'root',
})
export class Spawn extends Item {
    type: ItemType = ItemType.Spawn;
    description: string = 'Point de départ. Choisissez où les joueurs commenceront leur aventure.';
    imageUrl: string = 'assets/images/item/bed.png';
    itemLimit: number = ITEM_LIMIT;
}
