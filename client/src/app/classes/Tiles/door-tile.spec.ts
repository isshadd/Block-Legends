import { TestBed } from '@angular/core/testing';
import { DoorTile } from './door-tile';

describe('DoorTile', () => {
    let service: DoorTile;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DoorTile);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have default name as "DoorTile"', () => {
        expect(service.name).toBe('DoorTile');
    });

    it('should have default description as "DoorTile"', () => {
        expect(service.description).toBe('DoorTile');
    });

    it('should have default imageUrl as "assets/images/tiles/door.jpg"', () => {
        expect(service.imageUrl).toBe('assets/images/tiles/door.jpg');
    });

    it('should have default coordinates of { x: -1, y: -1 }', () => {
        expect(service.coordinates).toEqual({ x: -1, y: -1 });
    });
});
