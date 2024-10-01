import { ItemType } from '@common/enums/item-type';
import { Item } from './item.schema';

describe('Item Class', () => {
    it('should create an item with the correct type', () => {
        const item = new Item();
        item.type = ItemType.Sword;

        expect(item.type).toBe(ItemType.Sword);
    });

    it('should allow undefined type', () => {
        const item = new Item();
        item.type = undefined;

        expect(item.type).toBeUndefined();
    });
});
