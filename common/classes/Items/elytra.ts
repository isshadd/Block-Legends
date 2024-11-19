import { ItemType } from '../../enums/item-type';
import { Item } from './item';

export class Elytra extends Item {
    type: ItemType = ItemType.Elytra;
    description: string = 'Ailes. Ignore les désavantages du terrain.';
    imageUrl: string = 'assets/images/item/elytra.png';
}
