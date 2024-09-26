import { TestBed } from '@angular/core/testing';

import { Chestplate } from './chestplate';

describe('Chestplate', () => {
    let service: Chestplate;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(Chestplate);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
