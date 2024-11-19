import { ItemType } from '../../enums/item-type';
import { Item } from './item';

export class Chestplate extends Item {
    type: ItemType = ItemType.Chestplate;
    description: string = 'Armure. Offre plus de protection contre les attaques.';
    imageUrl: string = 'assets/images/item/chestplate.png';
}
