import { ItemType } from '../../enums/item-type';
import { Item } from './item';

export class EnchantedBook extends Item {
    type: ItemType = ItemType.EnchantedBook;
    description: string = 'Livre de glace. Quand tu te déplaces, la dernière case de ton mouvement est gelée.';
    imageUrl: string = 'assets/images/item/enchanted-book.png';
}
