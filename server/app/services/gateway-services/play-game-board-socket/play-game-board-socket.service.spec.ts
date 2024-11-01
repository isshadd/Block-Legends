import { Test, TestingModule } from '@nestjs/testing';
import { PlayGameBoardSocketService } from './play-game-board-socket.service';

describe('PlayGameBoardSocketService', () => {
    let service: PlayGameBoardSocketService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayGameBoardSocketService],
        }).compile();

        service = module.get<PlayGameBoardSocketService>(PlayGameBoardSocketService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
