import { TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { WalkableTile } from '@app/classes/Tiles/walkable-tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { GameBoardParameters, WebSocketService } from '@app/services/SocketService/websocket.service';
import { TileType } from '@common/enums/tile-type';
import { GameShared } from '@common/interfaces/game-shared';
import { Vec2 } from '@common/interfaces/vec2';
import { BattleManagerService } from './battle-manager.service';
import { PlayGameBoardManagerService } from './play-game-board-manager.service';

describe('PlayGameBoardManagerService - Subjects and Observables', () => {
    let service: PlayGameBoardManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: {} },
                { provide: WebSocketService, useValue: {} },
                { provide: TileFactoryService, useValue: {} },
                { provide: BattleManagerService, useValue: {} },
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
    });

    it('should emit and subscribe to signalManagerFinishedInit$', (done) => {
        service.signalManagerFinishedInit$.subscribe(() => {
            expect(true).toBeTrue();
            done();
        });
        service.signalManagerFinishedInit.next();
    });

    it('should emit and subscribe to signalUserMoved$', (done) => {
        const movementData = { fromTile: { x: 0, y: 0 }, toTile: { x: 1, y: 1 } } as { fromTile: Vec2; toTile: Vec2 };
        service.signalUserMoved$.subscribe((data) => {
            expect(data).toEqual(movementData);
            done();
        });
        service.signalUserMoved.next(movementData);
    });

    it('should emit and subscribe to signalUserRespawned$', (done) => {
        const respawnData = { fromTile: { x: 2, y: 2 }, toTile: { x: 3, y: 3 } } as { fromTile: Vec2; toTile: Vec2 };
        service.signalUserRespawned$.subscribe((data) => {
            expect(data).toEqual(respawnData);
            done();
        });
        service.signalUserRespawned.next(respawnData);
    });

    it('should emit and subscribe to signalUserStartedMoving$', (done) => {
        service.signalUserStartedMoving$.subscribe(() => {
            expect(true).toBeTrue();
            done();
        });
        service.signalUserStartedMoving.next();
    });

    it('should emit and subscribe to signalUserFinishedMoving$', (done) => {
        service.signalUserFinishedMoving$.subscribe(() => {
            expect(true).toBeTrue();
            done();
        });
        service.signalUserFinishedMoving.next();
    });

    it('should emit and subscribe to signalUserGotTurnEnded$', (done) => {
        service.signalUserGotTurnEnded$.subscribe(() => {
            expect(true).toBeTrue();
            done();
        });
        service.signalUserGotTurnEnded.next();
    });

    it('should emit and subscribe to signalUserDidDoorAction$', (done) => {
        const doorActionPosition = { x: 5, y: 5 } as Vec2;
        service.signalUserDidDoorAction$.subscribe((data) => {
            expect(data).toEqual(doorActionPosition);
            done();
        });
        service.signalUserDidDoorAction.next(doorActionPosition);
    });

    it('should emit and subscribe to signalUserDidBattleAction$', (done) => {
        const battleActionData = 'opponentId';
        service.signalUserDidBattleAction$.subscribe((data) => {
            expect(data).toBe(battleActionData);
            done();
        });
        service.signalUserDidBattleAction.next(battleActionData);
    });

    it('should emit and subscribe to signalUserWon$', (done) => {
        service.signalUserWon$.subscribe(() => {
            expect(true).toBeTrue();
            done();
        });
        service.signalUserWon.next();
    });
});

describe('PlayGameBoardManagerService - init', () => {
    let service: PlayGameBoardManagerService;
    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;

    beforeEach(() => {
        gameMapDataManagerServiceSpy = jasmine.createSpyObj('GameMapDataManagerService', ['initGameBoard']);

        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: gameMapDataManagerServiceSpy },
                { provide: TileFactoryService, useValue: {} }, // Directly provide an empty object
                { provide: WebSocketService, useValue: {} }, // Directly provide an empty object
                { provide: BattleManagerService, useValue: {} }, // Directly provide an empty object
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
    });

    it('should initialize game board, characters, set turnOrder, and emit signalManagerFinishedInit', (done) => {
        const mockGame = {} as GameShared;
        const mockSpawnPlaces: [number, string][] = [[0, '0']];
        const mockTurnOrder = ['player1', 'player2'];

        const gameBoardParameters: GameBoardParameters = {
            game: mockGame,
            spawnPlaces: mockSpawnPlaces,
            turnOrder: mockTurnOrder,
        };

        spyOn(service, 'initGameBoard');
        spyOn(service, 'initCharacters');

        service.signalManagerFinishedInit$.subscribe(() => {
            expect(service.initGameBoard).toHaveBeenCalledWith(mockGame);
            expect(service.initCharacters).toHaveBeenCalledWith(mockSpawnPlaces);
            expect(service.turnOrder).toEqual(mockTurnOrder);
            done();
        });

        service.init(gameBoardParameters);
    });
});

describe('PlayGameBoardManagerService - initGameBoard', () => {
    let service: PlayGameBoardManagerService;
    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;

    beforeEach(() => {
        gameMapDataManagerServiceSpy = jasmine.createSpyObj('GameMapDataManagerService', ['init']);

        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: gameMapDataManagerServiceSpy },
                { provide: TileFactoryService, useValue: {} },
                { provide: WebSocketService, useValue: {} },
                { provide: BattleManagerService, useValue: {} },
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
    });

    it('should call gameMapDataManagerService.init with the provided game', () => {
        const mockGame = {} as GameShared;

        service.initGameBoard(mockGame);

        expect(gameMapDataManagerServiceSpy.init).toHaveBeenCalledWith(mockGame);
    });
});

describe('PlayGameBoardManagerService - initCharacters', () => {
    let service: PlayGameBoardManagerService;
    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;

    beforeEach(() => {
        gameMapDataManagerServiceSpy = jasmine.createSpyObj('GameMapDataManagerService', ['getTilesWithSpawn']);
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['getRoomInfo']);

        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: gameMapDataManagerServiceSpy },
                { provide: TileFactoryService, useValue: {} },
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: BattleManagerService, useValue: {} },
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
    });

    it('should assign players to specified spawn tiles and clear items from remaining tiles', () => {
        const tile1 = new TerrainTile();
        const tile2 = new TerrainTile();
        tile1.coordinates = { x: 0, y: 0 } as Vec2;
        tile2.coordinates = { x: 1, y: 1 } as Vec2;

        gameMapDataManagerServiceSpy.getTilesWithSpawn.and.returnValue([tile1, tile2]);

        const mockPlayer = {
            socketId: 'player1',
            avatar: { headImage: 'avatar.png' },
            mapEntity: null,
        } as unknown as PlayerCharacter;

        webSocketServiceSpy.getRoomInfo.and.returnValue({
            players: [mockPlayer],
            roomId: '',
            accessCode: 0,
            isLocked: false,
            maxPlayers: 0,
            currentPlayerTurn: '',
        });

        const spawnPlaces: [number, string][] = [[0, 'player1']];

        service.initCharacters(spawnPlaces);

        expect(mockPlayer.mapEntity).toBeTruthy();
        expect(mockPlayer.mapEntity?.spawnCoordinates).toEqual(tile1.coordinates);
        expect(tile1.player).toBe(mockPlayer.mapEntity);
        expect(tile2.item).toBeNull();
    });
});

describe('PlayGameBoardManagerService - startTurn', () => {
    let service: PlayGameBoardManagerService;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', [], {
            socket: { id: 'userSocketId' },
        });

        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: {} },
                { provide: TileFactoryService, useValue: {} },
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: BattleManagerService, useValue: {} },
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
    });

    it('should set move points, action points, and call setupPossibleMoves if it is the user’s turn and player is found', () => {
        const mockPlayerCharacter = {
            attributes: { speed: 3 },
        } as PlayerCharacter;

        service.isUserTurn = true;
        spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockPlayerCharacter);
        spyOn(service, 'setupPossibleMoves');

        service.startTurn();

        expect(service.userCurrentMovePoints).toBe(3);
        expect(service.userCurrentActionPoints).toBe(1);
        expect(service.setupPossibleMoves).toHaveBeenCalledWith(mockPlayerCharacter);
    });

    it('should not set move points, action points, or call setupPossibleMoves if it is not the user’s turn', () => {
        service.isUserTurn = false;
        spyOn(service, 'findPlayerFromSocketId');
        spyOn(service, 'setupPossibleMoves');

        service.startTurn();

        expect(service.userCurrentMovePoints).toBe(0);
        expect(service.userCurrentActionPoints).toBe(0);
        expect(service.setupPossibleMoves).not.toHaveBeenCalled();
    });

    it('should not set move points, action points, or call setupPossibleMoves if player is not found', () => {
        service.isUserTurn = true;
        spyOn(service, 'findPlayerFromSocketId').and.returnValue(null);
        spyOn(service, 'setupPossibleMoves');

        service.startTurn();

        expect(service.userCurrentMovePoints).toBe(0);
        expect(service.userCurrentActionPoints).toBe(0);
        expect(service.setupPossibleMoves).not.toHaveBeenCalled();
    });
});

describe('PlayGameBoardManagerService - setupPossibleMoves', () => {
    let service: PlayGameBoardManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: {} },
                { provide: TileFactoryService, useValue: {} },
                { provide: WebSocketService, useValue: {} },
                { provide: BattleManagerService, useValue: {} },
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
    });

    it('should call setPossibleMoves and showPossibleMoves if move points are available and it is user’s turn', () => {
        const mockPlayerCharacter = {} as PlayerCharacter;

        service.userCurrentMovePoints = 2;
        service.isUserTurn = true;
        spyOn(service, 'setPossibleMoves');
        spyOn(service, 'showPossibleMoves');

        service.setupPossibleMoves(mockPlayerCharacter);

        expect(service.setPossibleMoves).toHaveBeenCalledWith(mockPlayerCharacter);
        expect(service.showPossibleMoves).toHaveBeenCalled();
    });

    it('should not call setPossibleMoves or showPossibleMoves if userCurrentMovePoints is 0', () => {
        const mockPlayerCharacter = {} as PlayerCharacter;

        service.userCurrentMovePoints = 0;
        service.isUserTurn = true;
        spyOn(service, 'setPossibleMoves');
        spyOn(service, 'showPossibleMoves');

        service.setupPossibleMoves(mockPlayerCharacter);

        expect(service.setPossibleMoves).not.toHaveBeenCalled();
        expect(service.showPossibleMoves).not.toHaveBeenCalled();
    });

    it('should not call setPossibleMoves or showPossibleMoves if it is not the user’s turn', () => {
        const mockPlayerCharacter = {} as PlayerCharacter;

        service.userCurrentMovePoints = 2;
        service.isUserTurn = false;
        spyOn(service, 'setPossibleMoves');
        spyOn(service, 'showPossibleMoves');

        service.setupPossibleMoves(mockPlayerCharacter);

        expect(service.setPossibleMoves).not.toHaveBeenCalled();
        expect(service.showPossibleMoves).not.toHaveBeenCalled();
    });
});

describe('PlayGameBoardManagerService - setPossibleMoves', () => {
    let service: PlayGameBoardManagerService;
    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;

    beforeEach(() => {
        gameMapDataManagerServiceSpy = jasmine.createSpyObj('GameMapDataManagerService', ['getPossibleMovementTiles']);

        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: gameMapDataManagerServiceSpy },
                { provide: TileFactoryService, useValue: {} },
                { provide: WebSocketService, useValue: {} },
                { provide: BattleManagerService, useValue: {} },
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
    });

    it('should call getPossibleMovementTiles with the correct coordinates and move points, and set userCurrentPossibleMoves', () => {
        const playerCoordinates: Vec2 = { x: 1, y: 2 };
        const mockPlayerCharacter = {
            mapEntity: { coordinates: playerCoordinates },
        } as PlayerCharacter;

        const mockPossibleMoves = new Map<Tile, Tile[]>();
        gameMapDataManagerServiceSpy.getPossibleMovementTiles.and.returnValue(mockPossibleMoves);

        service.userCurrentMovePoints = 3;

        service.setPossibleMoves(mockPlayerCharacter);

        expect(gameMapDataManagerServiceSpy.getPossibleMovementTiles).toHaveBeenCalledWith(playerCoordinates, service.userCurrentMovePoints);
        expect(service.userCurrentPossibleMoves).toBe(mockPossibleMoves);
    });
});

describe('PlayGameBoardManagerService - showPossibleMoves', () => {
    let service: PlayGameBoardManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: {} },
                { provide: TileFactoryService, useValue: {} },
                { provide: WebSocketService, useValue: {} },
                { provide: BattleManagerService, useValue: {} },
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
    });

    it('should set visibleState of each tile in userCurrentPossibleMoves to Valid', () => {
        const tile1 = new Tile();
        const tile2 = new Tile();

        service.userCurrentPossibleMoves = new Map([
            [tile1, [tile1]],
            [tile2, [tile2]],
        ]);

        service.showPossibleMoves();

        expect(tile1.visibleState).toBe(VisibleState.Valid);
        expect(tile2.visibleState).toBe(VisibleState.Valid);
    });
});

describe('PlayGameBoardManagerService - endTurn', () => {
    let service: PlayGameBoardManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: {} },
                { provide: TileFactoryService, useValue: {} },
                { provide: WebSocketService, useValue: {} },
                { provide: BattleManagerService, useValue: {} },
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
    });

    it('should set userCurrentMovePoints to 0 and call hidePossibleMoves if it is the user’s turn and player is found', () => {
        const mockPlayerCharacter = {} as PlayerCharacter;

        service.isUserTurn = true;
        spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
        spyOn(service, 'hidePossibleMoves');

        service.endTurn();

        expect(service.userCurrentMovePoints).toBe(0);
        expect(service.hidePossibleMoves).toHaveBeenCalled();
    });

    it('should not set userCurrentMovePoints or call hidePossibleMoves if it is not the user’s turn', () => {
        service.isUserTurn = false;
        spyOn(service, 'getCurrentPlayerCharacter');
        spyOn(service, 'hidePossibleMoves');

        service.endTurn();

        expect(service.userCurrentMovePoints).toBe(0);
        expect(service.hidePossibleMoves).not.toHaveBeenCalled();
    });

    it('should not set userCurrentMovePoints or call hidePossibleMoves if player is not found', () => {
        service.isUserTurn = true;
        spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(null);
        spyOn(service, 'hidePossibleMoves');

        service.endTurn();

        expect(service.userCurrentMovePoints).toBe(0);
        expect(service.hidePossibleMoves).not.toHaveBeenCalled();
    });
});

describe('PlayGameBoardManagerService - hidePossibleMoves', () => {
    let service: PlayGameBoardManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: {} },
                { provide: TileFactoryService, useValue: {} },
                { provide: WebSocketService, useValue: {} },
                { provide: BattleManagerService, useValue: {} },
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
    });

    it('should set visibleState of each tile in userCurrentPossibleMoves to NotSelected and clear userCurrentPossibleMoves', () => {
        const tile1 = new Tile();
        const tile2 = new Tile();

        service.userCurrentPossibleMoves = new Map([
            [tile1, [tile1]],
            [tile2, [tile2]],
        ]);

        service.hidePossibleMoves();

        expect(tile1.visibleState).toBe(VisibleState.NotSelected);
        expect(tile2.visibleState).toBe(VisibleState.NotSelected);
        expect(service.userCurrentPossibleMoves.size).toBe(0);
    });
});

describe('PlayGameBoardManagerService - moveUserPlayer', () => {
    let service: PlayGameBoardManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: {} },
                { provide: TileFactoryService, useValue: {} },
                { provide: WebSocketService, useValue: {} },
                { provide: BattleManagerService, useValue: {} },
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
        spyOn(service, 'waitInterval').and.returnValue(Promise.resolve()); // Mock waitInterval to skip delays
    });

    it('should move the user along the path without tripping and call setupPossibleMoves at the end', async () => {
        const mockPlayerCharacter = {} as any;
        const tile1 = new WalkableTile();
        const tile2 = new WalkableTile();
        tile1.coordinates = { x: 0, y: 0 };
        tile2.coordinates = { x: 1, y: 1 };
        tile1.moveCost = 1;
        tile2.moveCost = 1;

        spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
        spyOn(service, 'hidePossibleMoves');
        spyOn(service.signalUserStartedMoving, 'next');
        spyOn(service.signalUserMoved, 'next');
        spyOn(service.signalUserFinishedMoving, 'next');
        spyOn(service, 'checkIfPLayerDidEverything');
        spyOn(service, 'setupPossibleMoves');

        service.userCurrentMovePoints = 3;
        service.isUserTurn = true;
        service.userCurrentPossibleMoves = new Map([[tile2, [tile1, tile2]]]);

        await service.moveUserPlayer(tile2);

        expect(service.hidePossibleMoves).toHaveBeenCalled();
        expect(service.signalUserStartedMoving.next).toHaveBeenCalled();
        expect(service.signalUserMoved.next).toHaveBeenCalledWith({ fromTile: tile1.coordinates, toTile: tile2.coordinates });
        expect(service.signalUserFinishedMoving.next).toHaveBeenCalled();
        expect(service.checkIfPLayerDidEverything).toHaveBeenCalled();
        expect(service.setupPossibleMoves).toHaveBeenCalledWith(mockPlayerCharacter);
        expect(service.userCurrentMovePoints).toBe(2);
    });

    it('should end the turn if the player trips on an ice tile', async () => {
        const mockPlayerCharacter = {} as any;
        const tile1 = new WalkableTile();
        const tile2 = new WalkableTile();
        tile1.coordinates = { x: 0, y: 0 };
        tile2.coordinates = { x: 1, y: 1 };
        tile1.moveCost = 1;
        tile2.moveCost = 1;
        tile2.type = TileType.Ice;

        spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
        spyOn(service, 'hidePossibleMoves');
        spyOn(service.signalUserStartedMoving, 'next');
        spyOn(service.signalUserMoved, 'next');
        spyOn(service.signalUserGotTurnEnded, 'next');
        spyOn(service.signalUserFinishedMoving, 'next');
        spyOn(service, 'setupPossibleMoves');

        service.userCurrentMovePoints = 3;
        service.isUserTurn = true;
        service.userCurrentPossibleMoves = new Map([[tile2, [tile1, tile2]]]);

        spyOn(Math, 'random').and.returnValue(0.05);

        await service.moveUserPlayer(tile2);

        expect(service.hidePossibleMoves).toHaveBeenCalled();
        expect(service.signalUserStartedMoving.next).toHaveBeenCalled();
        expect(service.signalUserMoved.next).toHaveBeenCalledWith({ fromTile: tile1.coordinates, toTile: tile2.coordinates });
        expect(service.signalUserFinishedMoving.next).toHaveBeenCalled();
        expect(service.signalUserGotTurnEnded.next).toHaveBeenCalled();
        expect(service.setupPossibleMoves).not.toHaveBeenCalled();
    });
});

describe('PlayGameBoardManagerService - movePlayer', () => {
    let service: PlayGameBoardManagerService;
    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;

    beforeEach(() => {
        gameMapDataManagerServiceSpy = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt']);

        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: gameMapDataManagerServiceSpy },
                { provide: TileFactoryService, useValue: {} },
                { provide: WebSocketService, useValue: {} },
                { provide: BattleManagerService, useValue: {} },
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
    });

    it('should move player from one tile to another if player is found', () => {
        const playerId = 'player1';
        const fromTileCoordinates: Vec2 = { x: 0, y: 0 };
        const toTileCoordinates: Vec2 = { x: 1, y: 1 };

        const mockPlayerCharacter = {
            mapEntity: { id: 'entity1' },
        } as unknown as PlayerCharacter;

        const fromTileInstance = new WalkableTile();
        const toTileInstance = new WalkableTile();

        spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockPlayerCharacter);
        gameMapDataManagerServiceSpy.getTileAt.and.callFake((coordinates: Vec2) => {
            if (coordinates === fromTileCoordinates) return fromTileInstance;
            if (coordinates === toTileCoordinates) return toTileInstance;
            return null;
        });
        spyOn(fromTileInstance, 'removePlayer');
        spyOn(toTileInstance, 'setPlayer');

        service.movePlayer(playerId, fromTileCoordinates, toTileCoordinates);

        expect(service.findPlayerFromSocketId).toHaveBeenCalledWith(playerId);
        expect(fromTileInstance.removePlayer).toHaveBeenCalled();
        expect(toTileInstance.setPlayer).toHaveBeenCalledWith(mockPlayerCharacter.mapEntity);
    });

    it('should do nothing if player is not found', () => {
        const playerId = 'player1';
        const fromTileCoordinates: Vec2 = { x: 0, y: 0 };
        const toTileCoordinates: Vec2 = { x: 1, y: 1 };

        spyOn(service, 'findPlayerFromSocketId').and.returnValue(null);

        service.movePlayer(playerId, fromTileCoordinates, toTileCoordinates);

        expect(service.findPlayerFromSocketId).toHaveBeenCalledWith(playerId);
        expect(gameMapDataManagerServiceSpy.getTileAt).not.toHaveBeenCalled();
    });
});
