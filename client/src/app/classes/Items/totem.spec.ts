import { TestBed } from '@angular/core/testing';

import { Totem } from './totem';

describe('Totem', () => {
    let service: Totem;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(Totem);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
