import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/interfaces/vec2';
import { GrassTile } from './grass-tile';

describe('BaseTile', () => {
    let baseTile: GrassTile;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        baseTile = TestBed.inject(GrassTile);
    });

    it('should be created', () => {
        expect(baseTile).toBeTruthy();
    });
    it('should have default name as "BaseTile"', () => {
        expect(baseTile.name).toBe('BaseTile');
    });

    it('should have default description as "BaseTile"', () => {
        expect(baseTile.description).toBe('BaseTile');
    });

    it('should have default imageUrl as "assets/images/tiles/grass.png"', () => {
        expect(baseTile.imageUrl).toBe('assets/images/tiles/grass.png');
    });

    it('should have default coordinates of { x: -1, y: -1 }', () => {
        const expectedCoordinates: Vec2 = { x: -1, y: -1 };
        expect(baseTile.coordinates).toEqual(expectedCoordinates);
    });
});
