import { ItemType } from '../../enums/item-type';
import { Item } from './item';

export class Chestplate extends Item {
    type: ItemType = ItemType.Chestplate;
    description: string = 'Armure. +2 Défense, -1 Vitesse.';
    imageUrl: string = 'assets/images/item/chestplate.png';
}
