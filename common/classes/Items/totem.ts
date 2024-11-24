import { ItemType } from '../../enums/item-type';
import { Item } from './item';

export class Totem extends Item {
    type: ItemType = ItemType.Totem;
    description: string = 'Totem. Si tu meurs, tu as une autre chance de vivre!';
    imageUrl: string = 'assets/images/item/totem.png';
}
