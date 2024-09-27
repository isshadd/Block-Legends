import { TestBed } from '@angular/core/testing';

import { Spawn } from './spawn';

describe('Spawn', () => {
    let service: Spawn;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(Spawn);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
