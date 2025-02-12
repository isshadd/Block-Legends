import { ItemType } from '../../enums/item-type';
import { Item } from './item';

export class Elytra extends Item {
    type: ItemType = ItemType.Elytra;
    description: string = 'Ailes. Ignore les désavantages de la glace, -1 Vitesse.';
    imageUrl: string = 'assets/images/item/elytra.png';
}
