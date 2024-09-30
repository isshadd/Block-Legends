import { TestBed } from '@angular/core/testing';

import { OpenDoor } from './open-door';

describe('OpenDoor', () => {
    let service: OpenDoor;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OpenDoor);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
