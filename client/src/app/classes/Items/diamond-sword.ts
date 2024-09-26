import { Injectable } from '@angular/core';
import { ItemType } from '@common/enums/item-type';
import { Item } from './item';

@Injectable({
    providedIn: 'root',
})
export class DiamondSword extends Item{
    type: ItemType = ItemType.Sword;
    description: string = 'Diamond Sword';
    imageUrl: string = 'assets/images/item/diamond-sword.png';
}
