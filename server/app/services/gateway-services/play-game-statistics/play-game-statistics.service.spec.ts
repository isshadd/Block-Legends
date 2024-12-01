import { Test, TestingModule } from '@nestjs/testing';
import { PlayGameStatisticsService } from './play-game-statistics.service';

describe('PlayGameStatisticsService', () => {
  let service: PlayGameStatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayGameStatisticsService],
    }).compile();

    service = module.get<PlayGameStatisticsService>(PlayGameStatisticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
