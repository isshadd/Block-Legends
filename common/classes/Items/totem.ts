import { ItemType } from '../../enums/item-type';
import { Item } from './item';

export class Totem extends Item {
    type: ItemType = ItemType.Totem;
    description: string = 'Totem. Si ta vie est en bas du maximum, quand tu enlèves une vie à un adversaire, tu gagnes une vie. -2 Défense.';
    imageUrl: string = 'assets/images/item/totem.png';
}
