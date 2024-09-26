import { TestBed } from '@angular/core/testing';

import { DiamondSword } from './diamond-sword';

describe('DiamondSword', () => {
    let service: DiamondSword;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DiamondSword);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
