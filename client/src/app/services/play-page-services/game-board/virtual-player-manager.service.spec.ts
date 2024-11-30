import { TestBed } from '@angular/core/testing';

import { VirtualPlayerManagerService } from './virtual-player-manager.service';

describe('VirtualPlayerManagerService', () => {
    let service: VirtualPlayerManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VirtualPlayerManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
