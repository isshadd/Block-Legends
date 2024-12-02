import { Game } from '@app/model/database/game';
import { GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { PlayGameStatisticsService } from '@app/services/gateway-services/play-game-statistics/play-game-statistics.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameBoardParameters } from '@common/interfaces/game-board-parameters';
import { GameRoom } from '@common/interfaces/game-room';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayGameBoardSocketService } from './play-game-board-socket.service';

describe('PlayGameBoardSocketService', () => {
    let service: PlayGameBoardSocketService;
    let gameSocketRoomService: jest.Mocked<GameSocketRoomService>;
    let playGameStatisticsService: jest.Mocked<PlayGameStatisticsService>;
    let loggerLogSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    const mockRoom: GameRoom = {
        id: 'room1',
        accessCode: 123,
        players: [
            {
                socketId: 'player1',
                attributes: {
                    speed: 10,
                    life: 100,
                    attack: 0,
                    defense: 0,
                },
                avatar: undefined,
                name: 'player1',
            } as PlayerCharacter,
            {
                socketId: 'player2',
                attributes: {
                    speed: 15,
                    life: 100,
                    attack: 0,
                    defense: 0,
                },
                avatar: undefined,
                name: 'player2',
            } as PlayerCharacter,
        ],
        organizer: 'player1',
        isLocked: false,
        maxPlayers: 2,
        currentPlayerTurn: 'player1',
    };

    const mockGame: Game = {
        name: '',
        description: '',
        size: MapSize.SMALL,
        mode: GameMode.Classique,
        imageUrl: '',
        isVisible: false,
        tiles: [],
    };

    const mockGameBoardRoom: GameBoardParameters = {
        game: mockGame,
        spawnPlaces: [],
        turnOrder: ['player1', 'player2'],
    };

    beforeEach(async () => {
        const mockGameSocketRoomService = {
            gameBoardRooms: new Map<number, any>(),
            getRoomByAccessCode: jest.fn(),
            setCurrentPlayerTurn: jest.fn(),
            setSpawnCounter: jest.fn(),
        };

        const mockPlayGameStatisticsService = {
            initGameStatistics: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayGameBoardSocketService,
                { provide: GameSocketRoomService, useValue: mockGameSocketRoomService },
                { provide: PlayGameStatisticsService, useValue: mockPlayGameStatisticsService },
            ],
        }).compile();

        service = module.get<PlayGameBoardSocketService>(PlayGameBoardSocketService);
        gameSocketRoomService = module.get<GameSocketRoomService>(GameSocketRoomService) as jest.Mocked<GameSocketRoomService>;
        playGameStatisticsService = module.get<PlayGameStatisticsService>(PlayGameStatisticsService) as jest.Mocked<PlayGameStatisticsService>;

        loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(jest.fn());
        loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('initRoomGameBoard', () => {
        it('should initialize game board when room exists', () => {
            const accessCode = 1234;

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
            jest.spyOn(gameSocketRoomService.gameBoardRooms, 'get').mockReturnValue(mockGameBoardRoom);
            jest.spyOn(service, 'setupSpawnPoints').mockReturnValue([]);
            jest.spyOn(service, 'setupTurnOrder').mockReturnValue(mockGameBoardRoom.turnOrder);
            jest.spyOn(gameSocketRoomService, 'setCurrentPlayerTurn').mockImplementation(jest.fn());
            jest.spyOn(gameSocketRoomService.gameBoardRooms, 'set').mockImplementation((key, value) => new Map().set(key, value));
            playGameStatisticsService.initGameStatistics.mockImplementation(jest.fn());

            service.initRoomGameBoard(accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(gameSocketRoomService.gameBoardRooms.get).toHaveBeenCalledWith(accessCode);
            expect(service.setupSpawnPoints).toHaveBeenCalledWith(mockRoom, mockGame);
            expect(service.setupTurnOrder).toHaveBeenCalledWith(mockRoom);
            expect(gameSocketRoomService.setCurrentPlayerTurn).toHaveBeenCalledWith(accessCode, mockRoom.currentPlayerTurn);
            expect(playGameStatisticsService.initGameStatistics).toHaveBeenCalledWith(mockRoom.accessCode);
            expect(loggerLogSpy).toHaveBeenCalledWith(`GameBoard setup fait pour room: ${mockRoom.accessCode}`);
        });

        it('should log error when room does not exist', () => {
            const accessCode = 5678;
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(undefined);

            service.initRoomGameBoard(accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(loggerErrorSpy).toHaveBeenCalledWith(`Room pas trouve pour code: ${accessCode}`);
        });
    });

    describe('setupSpawnPoints', () => {
        it('should assign unique spawn points to each player', () => {
            gameSocketRoomService.setSpawnCounter.mockReturnValue(10);

            jest.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.2);

            const spawnPoints = service.setupSpawnPoints(mockRoom, mockGame);

            expect(spawnPoints).toEqual([
                [1, 'player1'],
                [2, 'player2'],
            ]);

            const uniqueIndices = new Set(spawnPoints.map(([index]) => index));
            expect(uniqueIndices.size).toBe(spawnPoints.length);

            (Math.random as jest.Mock).mockRestore();
        });
    });

    describe('setupTurnOrder', () => {
        it('should order players by speed descending with random tie-breakers', () => {
            jest.spyOn(Math, 'random').mockReturnValueOnce(0.6).mockReturnValueOnce(0.4);
            const turnOrder = service.setupTurnOrder(mockRoom);
            expect(turnOrder).toEqual(['player2', 'player1']);
            (Math.random as jest.Mock).mockRestore();
        });
    });

    describe('changeTurn', () => {
        it('should change current player turn to the next player in turnOrder', () => {
            const accessCode = 4567;
            jest.spyOn(gameSocketRoomService.gameBoardRooms, 'get').mockReturnValue(mockGameBoardRoom);
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
            gameSocketRoomService.setCurrentPlayerTurn.mockClear();

            service.changeTurn(accessCode);
            expect(gameSocketRoomService.setCurrentPlayerTurn).toHaveBeenCalledWith(accessCode, 'player2');
        });

        it('should do nothing if gameBoardRoom does not exist', () => {
            const accessCode = 123;
            gameSocketRoomService.gameBoardRooms.set(accessCode, undefined);

            expect(() => service.changeTurn(accessCode)).not.toThrow();
            expect(gameSocketRoomService.setCurrentPlayerTurn).not.toHaveBeenCalled();
        });
    });
});
