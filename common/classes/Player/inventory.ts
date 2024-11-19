import { EmptyItem } from '../Items/empty-item';
import { Item } from '../Items/item';

export class Inventory {
    items: Item[] = [new EmptyItem(), new EmptyItem()];
}
