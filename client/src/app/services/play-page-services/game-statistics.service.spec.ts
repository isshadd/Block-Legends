import { TestBed } from '@angular/core/testing';

import { GameStatisticsService } from './game-statistics.service';

describe('GameStatisticsService', () => {
  let service: GameStatisticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
