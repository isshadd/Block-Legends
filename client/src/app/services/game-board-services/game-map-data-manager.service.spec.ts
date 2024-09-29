import { TestBed } from '@angular/core/testing';

import { GameMapDataManagerService } from './game-map-data-manager.service';

describe('GameMapDataManagerService', () => {
  let service: GameMapDataManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameMapDataManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
