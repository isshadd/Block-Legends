import { ItemType } from '@common/enums/item-type';
import { Item } from './item';

export class RandomItem extends Item {
    type: ItemType = ItemType.Random;
    description: string = 'Random Item';
    imageUrl: string = 'assets/images/item/random.png';
    itemLimit: number = 6;
}
