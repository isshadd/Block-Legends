import { TestBed } from '@angular/core/testing';

import { GameServerCommunicationService } from './game-server-communication.service';

describe('GameServerCommunicationService', () => {
    let service: GameServerCommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameServerCommunicationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
