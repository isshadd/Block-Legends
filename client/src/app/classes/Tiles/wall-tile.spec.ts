import { TestBed } from '@angular/core/testing';

import { WallTile } from './wall-tile';

describe('WallTile', () => {
    let service: WallTile;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(WallTile);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have default name as "WallTile"', () => {
        expect(service.name).toBe('WallTile');
    });

    it('should have default description as "WallTile"', () => {
        expect(service.description).toBe('WallTile');
    });

    it('should have default imageUrl as "assets/images/tiles/brickwall.jpg"', () => {
        expect(service.imageUrl).toBe('assets/images/tiles/brickwall.jpg');
    });

    it('should have default coordinates of { x: -1, y: -1 }', () => {
        expect(service.coordinates).toEqual({ x: -1, y: -1 });
    });
});
