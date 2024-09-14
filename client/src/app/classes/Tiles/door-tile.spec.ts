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
});
