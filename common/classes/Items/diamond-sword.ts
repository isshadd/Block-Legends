import { ItemType } from '../../enums/item-type';
import { Item } from './item';

export class DiamondSword extends Item {
    type: ItemType = ItemType.Sword;
    description: string = 'Épée. +2 Attaque, -1 Défense.';
    imageUrl: string = 'assets/images/item/diamond-sword.png';
}
