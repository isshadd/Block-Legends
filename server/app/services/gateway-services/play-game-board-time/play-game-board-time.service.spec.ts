import { GameService } from '@app/services/game/game.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayGameBoardTimeService } from './play-game-board-time.service';

describe('PlayGameBoardTimeService', () => {
    let service: PlayGameBoardTimeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [],
            providers: [PlayGameBoardTimeService, GameService],
        }).compile();

        service = module.get<PlayGameBoardTimeService>(PlayGameBoardTimeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
