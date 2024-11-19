import { ItemType } from '../../enums/item-type';
import { Item } from './item';

export class EmptyItem extends Item {
    type: ItemType = ItemType.EmptyItem;
    description: string = 'Emplacement vide.';
    imageUrl: string = 'assets/images/item/emptySlot.png';
}
