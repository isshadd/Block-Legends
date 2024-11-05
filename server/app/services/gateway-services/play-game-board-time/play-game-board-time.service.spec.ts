import { GameService } from '@app/services/game/game.service';
import { GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayGameBoardTimeService } from './play-game-board-time.service';

// Création de mocks pour les services dépendants
const mockGameService = jest.fn(() => ({
    getGame: jest.fn(),
}));
const mockGameSocketRoomService = jest.fn(() => ({
    signalPlayerLeftRoom$: jest.fn(),
}));

describe('PlayGameBoardTimeService', () => {
    let service: PlayGameBoardTimeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayGameBoardTimeService,
                { provide: GameService, useValue: mockGameService },
                { provide: GameSocketRoomService, useValue: mockGameSocketRoomService },
            ],
        }).compile();

        service = module.get<PlayGameBoardTimeService>(PlayGameBoardTimeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
