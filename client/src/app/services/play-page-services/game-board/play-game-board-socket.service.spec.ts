import { TestBed } from '@angular/core/testing';

import { PlayGameBoardSocketService } from './play-game-board-socket.service';

describe('PlayGameBoardSocketService', () => {
    let service: PlayGameBoardSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayGameBoardSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
