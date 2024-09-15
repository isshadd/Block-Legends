import { TestBed } from '@angular/core/testing';
import { Item } from './item';

describe('Item', () => {
    let service: Item;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(Item);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have default name as "Item"', () => {
        expect(service.name).toBe('Item');
    });

    it('should have default description as "Item"', () => {
        expect(service.description).toBe('Item');
    });

    it('should have default imageUrl as "assets/images/item/baseItem.png"', () => {
        expect(service.imageUrl).toBe('assets/images/item/baseItem.png');
    });

    it('should have default coordinates of { x: -1, y: -1 }', () => {
        expect(service.coordinates).toEqual({ x: -1, y: -1 });
    });
});
