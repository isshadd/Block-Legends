import { TestBed } from '@angular/core/testing';

import { PlayGameBoardManagerService } from './play-game-board-manager.service';

describe('PlayGameBoardManagerService', () => {
  let service: PlayGameBoardManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayGameBoardManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
