import { Injectable } from '@angular/core';
import { ItemType } from '@common/enums/item-type';
import { Item } from './item';

@Injectable({
    providedIn: 'root',
})
export class EnchantedBook extends Item {
    type: ItemType = ItemType.EnchantedBook;
    description: string = 'Livre enchanté. Une magie puissante vous attend.';
    imageUrl: string = 'assets/images/item/enchanted-book.png';
}
