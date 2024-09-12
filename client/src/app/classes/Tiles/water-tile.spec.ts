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
});
