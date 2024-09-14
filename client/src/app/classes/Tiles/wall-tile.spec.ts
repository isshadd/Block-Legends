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
});
