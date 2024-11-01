import { GameService } from '@app/services/game/game.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameSocketRoomService } from '../game-socket-room/game-socket-room.service';
import { PlayGameBoardSocketService } from './play-game-board-socket.service';

describe('PlayGameBoardSocketService', () => {
    let service: PlayGameBoardSocketService;
    let gameService: Partial<GameService>;
    let gameSocketRoomService: Partial<GameSocketRoomService>;

    beforeEach(async () => {
        gameService = {
            getGame: jest.fn(),
        };

        gameSocketRoomService = {
            getRoomByAccessCode: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayGameBoardSocketService,
                { provide: GameService, useValue: gameService },
                { provide: GameSocketRoomService, useValue: gameSocketRoomService },
            ],
        }).compile();

        service = module.get<PlayGameBoardSocketService>(PlayGameBoardSocketService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
