import { TestBed } from '@angular/core/testing';

import { WaterTile } from './water-tile';

describe('WaterTile', () => {
    let service: WaterTile;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(WaterTile);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have default name as "WaterTile"', () => {
        expect(service.name).toBe('WaterTile');
    });

    it('should have default description as "WaterTile"', () => {
        expect(service.description).toBe('WaterTile');
    });

    it('should have default imageUrl as "assets/images/tiles/water.jpg"', () => {
        expect(service.imageUrl).toBe('assets/images/tiles/water.jpg');
    });

    it('should have default coordinates of { x: -1, y: -1 }', () => {
        expect(service.coordinates).toEqual({ x: -1, y: -1 });
    });
});
