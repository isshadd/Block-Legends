import { TestBed } from '@angular/core/testing';

import { EnchantedBook } from './enchanted-book';

describe('EnchantedBook', () => {
    let service: EnchantedBook;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(EnchantedBook);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
