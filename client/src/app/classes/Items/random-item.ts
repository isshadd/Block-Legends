import { ItemType } from '@common/enums/item-type';
import { Item } from './item';

const ITEM_LIMIT = 6;

export class RandomItem extends Item {
    type: ItemType = ItemType.Random;
    description: string = "Objet aléatoire. Parfait pour ceux qui n'arrivent pas à se décider.";
    imageUrl: string = 'assets/images/item/random.png';
    itemLimit: number = ITEM_LIMIT;
}
