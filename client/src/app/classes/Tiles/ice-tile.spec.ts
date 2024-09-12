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
});
