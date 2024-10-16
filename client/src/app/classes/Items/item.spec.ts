import { VisibleState } from '@app/interfaces/placeable-entity';
import { ItemType } from '@common/enums/item-type';
import { Vec2 } from '@common/interfaces/vec2';
import { Item } from './item';

describe('Item', () => {
    let item: Item;

    beforeEach(() => {
        item = new Item();
    });

    it('should create an instance of Item', () => {
        expect(item).toBeTruthy();
        expect(item).toBeInstanceOf(Item);
    });

    it('should have default coordinates set to (-1, -1)', () => {
        expect(item.coordinates).toEqual({ x: -1, y: -1 });
    });

    it('should have default visibleState set to NotSelected', () => {
        expect(item.visibleState).toBe(VisibleState.NotSelected);
    });

    it('should have default isPlaced set to false', () => {
        expect(item.isPlaced).toBeFalse();
    });

    it('should have default itemLimit set to 1', () => {
        expect(item.itemLimit).toBe(1);
    });

    it('should return true for isItem()', () => {
        expect(item.isItem()).toBeTrue();
    });

    it('should allow setting the type, description, and imageUrl properties', () => {
        item.type = ItemType.Sword;
        item.description = 'A sword item';
        item.imageUrl = 'path/to/sword.png';

        expect(item.type).toBe(ItemType.Sword);
        expect(item.description).toBe('A sword item');
        expect(item.imageUrl).toBe('path/to/sword.png');
    });

    it('should allow setting the coordinates property', () => {
        const newCoordinates: Vec2 = { x: 5, y: 10 };
        item.setCoordinates(newCoordinates);

        expect(item.coordinates).toEqual(newCoordinates);
    });

    it('should allow updating the visibleState property', () => {
        item.visibleState = VisibleState.Selected;
        expect(item.visibleState).toBe(VisibleState.Selected);
    });

    it('should allow updating the isPlaced property', () => {
        item.isPlaced = true;
        expect(item.isPlaced).toBeTrue();
    });

    it('should allow updating the itemLimit property', () => {
        item.itemLimit = 5;
        expect(item.itemLimit).toBe(5);
    });
});
