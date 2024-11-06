import { TestBed } from '@angular/core/testing';

import { SocketStateService } from './socket-state.service';

describe('SocketStateService', () => {
    let service: SocketStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
