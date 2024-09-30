import { ItemType } from '@common/enums/item-type';
import { TileType } from '@common/enums/tile-type';
import { Item } from './item.schema';
import { Tile } from './tile.schema';

describe('Tile Class', () => {
    it('should create a tile with a valid type and no item', () => {
        const tile = new Tile();
        tile.type = TileType.Grass;

        expect(tile.type).toBe(TileType.Grass);
        expect(tile.item).toBeUndefined();
    });

    it('should create a tile with a valid type and an item', () => {
        const item = new Item();
        item.type = ItemType.Sword;

        const tile = new Tile();
        tile.type = TileType.Grass;
        tile.item = item;

        expect(tile.type).toBe(TileType.Grass);
        expect(tile.item).toBeInstanceOf(Item);
        expect(tile.item?.type).toBe(ItemType.Sword);
    });
});
