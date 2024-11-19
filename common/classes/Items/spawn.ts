import { ItemType } from '../../enums/item-type';
import { Item } from './item';

export class Spawn extends Item {
    type: ItemType = ItemType.Spawn;
    description: string = 'Point de départ. Choisissez où les joueurs commenceront leur aventure.';
    imageUrl: string = 'assets/images/item/bed.png';
}
