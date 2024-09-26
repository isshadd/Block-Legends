import { TestBed } from '@angular/core/testing';

import { Elytra } from './elytra';

describe('Elytra', () => {
    let service: Elytra;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(Elytra);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
