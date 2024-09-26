import { TestBed } from '@angular/core/testing';

import { Flag } from './flag';

describe('Flag', () => {
    let service: Flag;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(Flag);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
