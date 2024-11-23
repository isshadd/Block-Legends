import { ItemType } from '../../enums/item-type';
import { Item } from './item';

export class Potion extends Item {
    type: ItemType = ItemType.MagicShield;
    description: string = `Bouclier magique. S'il te reste une seule vie, 50% de chance d'avoir 100 d'armoure au moment de recevoir une attaque.`;
    imageUrl: string = 'assets/images/item/potion.png';
}
