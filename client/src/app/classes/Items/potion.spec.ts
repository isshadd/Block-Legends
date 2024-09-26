import { TestBed } from '@angular/core/testing';

import { Potion } from './potion';

describe('Potion', () => {
    let service: Potion;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(Potion);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
