import { TestBed } from '@angular/core/testing';
import { Item } from '@app/classes/Items/item';
import { TerrainTile } from './terrain-tile';

describe('TerrainTile', () => {
    let terrainTile: TerrainTile;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TerrainTile],
        });
        terrainTile = TestBed.inject(TerrainTile);
    });

    it('should be created', () => {
        expect(terrainTile).toBeTruthy();
    });

    it('should return true for isTerrain()', () => {
        expect(terrainTile.isTerrain()).toBeTrue();
    });

    it('should initialize with a null item', () => {
        expect(terrainTile.item).toBeNull();
    });

    it('should allow setting an item', () => {
        const mockItem = new Item(); // Assuming Item has a default constructor
        terrainTile.item = mockItem;
        expect(terrainTile.item).toBe(mockItem);
    });

    it('should remove the item when removeItem() is called', () => {
        const mockItem = new Item();
        terrainTile.item = mockItem;
        terrainTile.removeItem();
        expect(terrainTile.item).toBeNull();
    });
});
