import { GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { GameBoardParameters } from '@common/interfaces/game-board-parameters';
import { GameRoom } from '@common/interfaces/game-room';
import { GameStatistics } from '@common/interfaces/game-statistics';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayGameStatisticsService } from './play-game-statistics.service';

describe('PlayGameStatisticsService', () => {
    let service: PlayGameStatisticsService;
    let gameSocketRoomService: jest.Mocked<GameSocketRoomService>;

    beforeEach(async () => {
        const mockGameSocketRoomService = {
            gameStatisticsRooms: new Map<number, GameStatistics>(),
            getRoomByAccessCode: jest.fn(),
            gameBoardRooms: new Map<number, GameBoardParameters>(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayGameStatisticsService, { provide: GameSocketRoomService, useValue: mockGameSocketRoomService }],
        }).compile();

        service = module.get<PlayGameStatisticsService>(PlayGameStatisticsService);
        gameSocketRoomService = module.get(GameSocketRoomService);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should increase totalGameTime when secondPassed is called and isGameOn is true', () => {
        const gameStatistics = { isGameOn: true, totalGameTime: 0 } as GameStatistics;
        gameSocketRoomService.gameStatisticsRooms.set(1, gameStatistics);

        service.secondPassed();

        expect(gameStatistics.totalGameTime).toBe(1);
    });

    it('should not increase totalGameTime when secondPassed is called and isGameOn is false', () => {
        const gameStatistics = { isGameOn: false, totalGameTime: 0 } as GameStatistics;
        gameSocketRoomService.gameStatisticsRooms.set(1, gameStatistics);

        service.secondPassed();

        expect(gameStatistics.totalGameTime).toBe(0);
    });

    it('should initialize game statistics correctly', () => {
        const accessCode = 1;
        const room = { players: [{ socketId: 'player1' }] } as GameRoom;
        const gameStatistics = { players: [], isGameOn: false, totalGameTime: 0 } as GameStatistics;

        gameSocketRoomService.getRoomByAccessCode.mockReturnValue(room);
        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.initGameStatistics(accessCode);

        expect(gameStatistics.players).toEqual(room.players);
        expect(gameStatistics.isGameOn).toBe(true);
        expect(gameStatistics.totalGameTime).toBe(0);
    });

    it('should log an error if room is not found during initGameStatistics', () => {
        const accessCode = 1;
        const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation(jest.fn());

        service.initGameStatistics(accessCode);

        expect(loggerSpy).toHaveBeenCalled();
    });
});
