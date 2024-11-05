import { Test, TestingModule } from '@nestjs/testing';
import { PlayGameBoardBattleService } from './play-game-board-battle.service';

describe('PlayGameBoardBattleTimeService', () => {
    let service: PlayGameBoardBattleService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayGameBoardBattleService],
        }).compile();

        service = module.get<PlayGameBoardBattleService>(PlayGameBoardBattleService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
