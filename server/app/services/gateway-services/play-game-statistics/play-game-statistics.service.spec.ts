import { GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { ItemType } from '@common/enums/item-type';
import { TileType } from '@common/enums/tile-type';
import { GameBoardParameters } from '@common/interfaces/game-board-parameters';
import { GameRoom } from '@common/interfaces/game-room';
import { GameStatistics } from '@common/interfaces/game-statistics';
import { TileShared } from '@common/interfaces/tile-shared';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayerNumberStatisticType, PlayGameStatisticsService } from './play-game-statistics.service';

describe('PlayGameStatisticsService', () => {
    let service: PlayGameStatisticsService;
    let gameSocketRoomService: jest.Mocked<GameSocketRoomService>;
    const mockPlayer = new PlayerCharacter('player1');
    mockPlayer.socketId = 'player1';

    beforeEach(async () => {
        jest.useFakeTimers();
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
        gameSocketRoomService.gameStatisticsRooms.clear();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should increase totalGameTime when secondPassed is called and isGameOn is true', () => {
        const gameStatistics = { isGameOn: true, totalGameTime: 0 } as GameStatistics;
        gameSocketRoomService.gameStatisticsRooms.set(1, gameStatistics);

        jest.advanceTimersByTime(1000);

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
        const room = { players: [mockPlayer] } as GameRoom;
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

    it('should return player statistics by id', () => {
        const accessCode = 1;
        const gameStatistics = { players: [mockPlayer] } as GameStatistics;

        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        const result = service.getPlayerStatisticsById(accessCode, mockPlayer.socketId);

        expect(result).toEqual(gameStatistics.players[0]);
    });

    it('should return undefined if player is not found by id', () => {
        const accessCode = 1;
        const player2 = new PlayerCharacter('player2');
        player2.socketId = 'player2';
        const gameStatistics = { players: [player2] } as GameStatistics;

        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        const result = service.getPlayerStatisticsById(accessCode, mockPlayer.socketId);

        expect(result).toBeUndefined();
    });

    it('should log an error if room is not found during getPlayerStatisticsById', () => {
        const accessCode = 1;
        const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation(jest.fn());

        const result = service.getPlayerStatisticsById(accessCode, mockPlayer.socketId);

        expect(loggerSpy).toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('should increase player statistic if player is found and statistic is a number', () => {
        const accessCode = 1;
        const statistic = PlayerNumberStatisticType.TotalCombats;
        const gameStatistics = { players: [mockPlayer] } as GameStatistics;

        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.increasePlayerStatistic(accessCode, mockPlayer.socketId, statistic);

        expect(mockPlayer[statistic]).toBe(1);
    });

    it('should log an error if player is not found during increasePlayerStatistic', () => {
        const accessCode = 1;
        const statistic = PlayerNumberStatisticType.TotalCombats;
        const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation(jest.fn());

        service.increasePlayerStatistic(accessCode, mockPlayer.socketId, statistic);

        expect(loggerSpy).toHaveBeenCalledWith(`Player pas trouve pour id: ${mockPlayer.socketId}`);
    });

    it('should log an error if statistic is not a number during increasePlayerStatistic', () => {
        const accessCode = 1;
        const player = { socketId: 'player1' } as PlayerCharacter;
        const statistic = PlayerNumberStatisticType.TotalCombats;
        const gameStatistics = { players: [player] } as GameStatistics;
        const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation(jest.fn());

        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.increasePlayerStatistic(accessCode, player.socketId, statistic);

        expect(loggerSpy).toHaveBeenCalledWith(`Statistic ${statistic} is not a number for player id: ${player.socketId}`);
    });

    it('should add different item grabbed by player', () => {
        const accessCode = 1;
        const itemType = ItemType.Sword;
        const gameStatistics = { players: [mockPlayer] } as GameStatistics;

        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.addPlayerDifferentItemGrabbed(accessCode, mockPlayer.socketId, itemType);

        expect(mockPlayer.differentItemsGrabbed).toContain(itemType);
    });

    it('should not add item if player already grabbed it', () => {
        const accessCode = 1;
        const itemType = ItemType.Sword;
        mockPlayer.differentItemsGrabbed = [itemType];
        const gameStatistics = { players: [mockPlayer] } as GameStatistics;

        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.addPlayerDifferentItemGrabbed(accessCode, mockPlayer.socketId, itemType);

        expect(mockPlayer.differentItemsGrabbed).toHaveLength(1);
    });

    it('should call addPlayerThatGrabbedFlag if itemType is Flag', () => {
        const accessCode = 1;
        const itemType = ItemType.Flag;
        mockPlayer.differentItemsGrabbed = [];
        const addPlayerThatGrabbedFlagSpy = jest.spyOn(service, 'addPlayerThatGrabbedFlag');
        const gameStatistics = { players: [mockPlayer], totalPlayersThatGrabbedFlag: [] } as GameStatistics;

        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.addPlayerDifferentItemGrabbed(accessCode, mockPlayer.socketId, itemType);

        expect(addPlayerThatGrabbedFlagSpy).toHaveBeenCalledWith(accessCode, mockPlayer.socketId);
        expect(mockPlayer.differentItemsGrabbed).toContain(itemType);
    });

    it('should log an error if player is not found during addPlayerDifferentItemGrabbed', () => {
        const accessCode = 1;
        const itemType = ItemType.Sword;
        const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation(jest.fn());

        service.addPlayerDifferentItemGrabbed(accessCode, mockPlayer.socketId, itemType);

        expect(loggerSpy).toHaveBeenCalledWith(`Player pas trouve pour id: ${mockPlayer.socketId}`);
    });

    it('should add different terrain tile visited by player', () => {
        const accessCode = 1;
        const tilePosition = { x: 0, y: 0 };
        const gameBoardRoom = { game: { tiles: [[{ type: TileType.Grass }]] } } as GameBoardParameters;
        const gameStatistics = { players: [mockPlayer], totalTerrainTilesVisited: [] } as GameStatistics;

        gameSocketRoomService.gameBoardRooms.set(accessCode, gameBoardRoom);
        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.addDifferentTerrainTileVisited(accessCode, mockPlayer.socketId, tilePosition);

        expect(mockPlayer.differentTerrainTilesVisited).toContainEqual(tilePosition);
    });

    it('should not add terrain tile if player already visited it', () => {
        const accessCode = 1;
        const tilePosition = { x: 0, y: 0 };
        mockPlayer.differentTerrainTilesVisited = [tilePosition];
        const gameBoardRoom = { game: { tiles: [[{ type: TileType.Grass }]] } } as GameBoardParameters;
        const gameStatistics = { players: [mockPlayer], totalTerrainTilesVisited: [] } as GameStatistics;

        gameSocketRoomService.gameBoardRooms.set(accessCode, gameBoardRoom);
        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.addDifferentTerrainTileVisited(accessCode, mockPlayer.socketId, tilePosition);

        expect(mockPlayer.differentTerrainTilesVisited).toHaveLength(1);
    });

    it('should call increaseGameTotalTerrainTilesVisited if new terrain tile is visited', () => {
        const accessCode = 1;
        const tilePosition = { x: 0, y: 0 };
        const gameBoardRoom = { game: { tiles: [[{ type: TileType.Grass } as TileShared]] } } as GameBoardParameters;
        const gameStatistics = { players: [mockPlayer], totalTerrainTilesVisited: [] } as GameStatistics;
        const increaseGameTotalTerrainTilesVisitedSpy = jest.spyOn(service, 'increaseGameTotalTerrainTilesVisited');
        mockPlayer.differentTerrainTilesVisited = [];

        gameSocketRoomService.gameBoardRooms.set(accessCode, gameBoardRoom);
        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.addDifferentTerrainTileVisited(accessCode, mockPlayer.socketId, tilePosition);

        expect(increaseGameTotalTerrainTilesVisitedSpy).toHaveBeenCalledWith(accessCode, tilePosition);
    });

    it('should log an error if player is not found during addDifferentTerrainTileVisited', () => {
        const accessCode = 1;
        const tilePosition = { x: 0, y: 0 };
        const gameBoardRoom = { game: { tiles: [[{ type: TileType.Grass }]] } } as GameBoardParameters;
        const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation(jest.fn());

        gameSocketRoomService.gameBoardRooms.set(accessCode, gameBoardRoom);

        service.addDifferentTerrainTileVisited(accessCode, mockPlayer.socketId, tilePosition);

        expect(loggerSpy).toHaveBeenCalledWith(`Player pas trouve pour id: ${mockPlayer.socketId}`);
    });

    it('should log an error if gameBoardRoom is not found during addDifferentTerrainTileVisited', () => {
        const accessCode = 1;
        const tilePosition = { x: 0, y: 0 };
        const gameStatistics = { players: [mockPlayer] } as GameStatistics;
        const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation(jest.fn());

        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.addDifferentTerrainTileVisited(accessCode, mockPlayer.socketId, tilePosition);

        expect(loggerSpy).toHaveBeenCalledWith(`Player pas trouve pour id: ${mockPlayer.socketId}`);
    });

    it('should increase total player turns', () => {
        const accessCode = 1;
        const gameStatistics = { totalPlayerTurns: 0 } as GameStatistics;

        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.increaseGameTotalPlayerTurns(accessCode);

        expect(gameStatistics.totalPlayerTurns).toBe(1);
    });

    it('should log an error if room is not found during increaseGameTotalPlayerTurns', () => {
        const accessCode = 1;
        const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation(jest.fn());

        service.increaseGameTotalPlayerTurns(accessCode);

        expect(loggerSpy).toHaveBeenCalledWith(`Room pas trouve pour code: ${accessCode}`);
    });

    it('should increase total terrain tiles visited if new terrain tile is visited', () => {
        const accessCode = 1;
        const tilePosition = { x: 0, y: 0 };
        const gameBoardRoom = { game: { tiles: [[{ type: TileType.Grass } as TileShared]] } } as GameBoardParameters;
        const gameStatistics = { totalTerrainTilesVisited: [] } as GameStatistics;

        gameSocketRoomService.gameBoardRooms.set(accessCode, gameBoardRoom);
        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.increaseGameTotalTerrainTilesVisited(accessCode, tilePosition);

        expect(gameStatistics.totalTerrainTilesVisited).toContainEqual(tilePosition);
    });

    it('should not increase total terrain tiles visited if tile is already visited', () => {
        const accessCode = 1;
        const tilePosition = { x: 0, y: 0 };
        const gameBoardRoom = { game: { tiles: [[{ type: TileType.Grass } as TileShared]] } } as GameBoardParameters;
        const gameStatistics = { totalTerrainTilesVisited: [tilePosition] } as GameStatistics;

        gameSocketRoomService.gameBoardRooms.set(accessCode, gameBoardRoom);
        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.increaseGameTotalTerrainTilesVisited(accessCode, tilePosition);

        expect(gameStatistics.totalTerrainTilesVisited).toHaveLength(1);
    });

    it('should log an error if room is not found during increaseGameTotalTerrainTilesVisited', () => {
        const accessCode = 1;
        const tilePosition = { x: 0, y: 0 };
        const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation(jest.fn());

        service.increaseGameTotalTerrainTilesVisited(accessCode, tilePosition);

        expect(loggerSpy).toHaveBeenCalledWith(`Room pas trouve pour code: ${accessCode}`);
    });

    it('should log an error if gameStatisticsRoom is not found during increaseGameTotalTerrainTilesVisited', () => {
        const accessCode = 1;
        const tilePosition = { x: 0, y: 0 };
        const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation(jest.fn());

        service.increaseGameTotalTerrainTilesVisited(accessCode, tilePosition);

        expect(loggerSpy).toHaveBeenCalledWith(`Room pas trouve pour code: ${accessCode}`);
    });

    it('should increase total doors interacted if new door is interacted', () => {
        const accessCode = 1;
        const tilePosition = { x: 0, y: 0 };
        const gameStatistics = { totalDoorsInteracted: [] } as GameStatistics;

        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.increaseGameTotalDoorsInteracted(accessCode, tilePosition);

        expect(gameStatistics.totalDoorsInteracted).toContainEqual(tilePosition);
    });

    it('should not increase total doors interacted if door is already interacted', () => {
        const accessCode = 1;
        const tilePosition = { x: 0, y: 0 };
        const gameStatistics = { totalDoorsInteracted: [tilePosition] } as GameStatistics;

        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.increaseGameTotalDoorsInteracted(accessCode, tilePosition);

        expect(gameStatistics.totalDoorsInteracted).toHaveLength(1);
    });

    it('should log an error if room is not found during increaseGameTotalDoorsInteracted', () => {
        const accessCode = 1;
        const tilePosition = { x: 0, y: 0 };
        const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation(jest.fn());

        service.increaseGameTotalDoorsInteracted(accessCode, tilePosition);

        expect(loggerSpy).toHaveBeenCalledWith(`Room pas trouve pour code: ${accessCode}`);
    });

    it('should add player that grabbed flag', () => {
        const accessCode = 1;
        const gameStatistics = { totalPlayersThatGrabbedFlag: [] } as GameStatistics;

        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.addPlayerThatGrabbedFlag(accessCode, mockPlayer.socketId);

        expect(gameStatistics.totalPlayersThatGrabbedFlag).toContain(mockPlayer.socketId);
    });

    it('should not add player that grabbed flag if already added', () => {
        const accessCode = 1;
        const gameStatistics = { totalPlayersThatGrabbedFlag: [mockPlayer.socketId] } as GameStatistics;

        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        service.addPlayerThatGrabbedFlag(accessCode, mockPlayer.socketId);

        expect(gameStatistics.totalPlayersThatGrabbedFlag).toHaveLength(1);
    });

    it('should log an error if room is not found during addPlayerThatGrabbedFlag', () => {
        const accessCode = 1;
        const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation(jest.fn());

        service.addPlayerThatGrabbedFlag(accessCode, mockPlayer.socketId);

        expect(loggerSpy).toHaveBeenCalledWith(`Room pas trouve pour code: ${accessCode}`);
    });

    it('should end game statistics and return game statistics room', () => {
        const accessCode = 1;
        const gameStatistics = { isGameOn: true } as GameStatistics;

        gameSocketRoomService.gameStatisticsRooms.set(accessCode, gameStatistics);

        const result = service.endGameStatistics(accessCode);

        expect(result).toEqual(gameStatistics);
        expect(gameStatistics.isGameOn).toBe(false);
    });

    it('should log an error if room is not found during endGameStatistics', () => {
        const accessCode = 1;
        const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation(jest.fn());

        const result = service.endGameStatistics(accessCode);

        expect(loggerSpy).toHaveBeenCalledWith(`Room pas trouve pour code: ${accessCode}`);
        expect(result).toBeUndefined();
    });
});
