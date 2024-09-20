import { TestBed } from '@angular/core/testing';
import { IceTile } from './ice-tile';

describe('IceTile', () => {
    let service: IceTile;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(IceTile);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have default name as "IceTile"', () => {
        expect(service.name).toBe('IceTile');
    });

    it('should have default description as "IceTile"', () => {
        expect(service.description).toBe('IceTile');
    });

    it('should have default imageUrl as "assets/images/tiles/ice.jpg"', () => {
        expect(service.imageUrl).toBe('assets/images/tiles/ice.jpg');
    });

    it('should have default coordinates of { x: -1, y: -1 }', () => {
        expect(service.coordinates).toEqual({ x: -1, y: -1 });
    });
});
