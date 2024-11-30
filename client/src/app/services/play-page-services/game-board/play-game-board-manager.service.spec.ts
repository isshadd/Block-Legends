/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { PlayerMapEntity } from '@common/classes/Player/player-map-entity';
import { GrassTile } from '@common/classes/Tiles/grass-tile';
import { IceTile } from '@common/classes/Tiles/ice-tile';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { TileType } from '@common/enums/tile-type';
import { GameBoardParameters } from '@common/interfaces/game-board-parameters';
import { GameShared } from '@common/interfaces/game-shared';
import { VisibleState } from '@common/interfaces/placeable-entity';
import { Vec2 } from '@common/interfaces/vec2';
import { BattleManagerService } from './battle-manager.service';
import { PlayGameBoardManagerService } from './play-game-board-manager.service';

describe('PlayGameBoardManagerService', () => {
    let mockPlayerCharacter = new PlayerCharacter('player1');
    mockPlayerCharacter.socketId = 'player1';
    mockPlayerCharacter.name = 'player1';
    mockPlayerCharacter.avatar = AvatarEnum.Steve;
    mockPlayerCharacter.attributes = { life: 3, speed: 3, attack: 3, defense: 3 };
    mockPlayerCharacter.mapEntity = new PlayerMapEntity('avatar.png');

    describe('Subjects and Observables', () => {
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
            const movementData = { fromTile: { x: 0, y: 0 }, toTile: { x: 1, y: 1 }, playerTurnId: mockPlayerCharacter.socketId } as {
                fromTile: Vec2;
                toTile: Vec2;
                playerTurnId: string;
            };
            service.signalUserMoved$.subscribe((data) => {
                expect(data).toEqual(movementData);
                done();
            });
            service.signalUserMoved.next(movementData);
        });

        it('should emit and subscribe to signalUserRespawned$', (done) => {
            const respawnData = { fromTile: { x: 2, y: 2 }, toTile: { x: 3, y: 3 }, playerTurnId: mockPlayerCharacter.socketId } as {
                fromTile: Vec2;
                toTile: Vec2;
                playerTurnId: string;
            };
            service.signalUserRespawned$.subscribe((data) => {
                expect(data).toEqual(respawnData);
                done();
            });
            service.signalUserRespawned.next(respawnData);
        });

        it('should emit and subscribe to signalUserStartedMoving$', (done) => {
            service.signalUserStartedMoving$.subscribe((data) => {
                expect(data).toEqual(mockPlayerCharacter.socketId);
                done();
            });
            service.signalUserStartedMoving.next(mockPlayerCharacter.socketId);
        });

        it('should emit and subscribe to signalUserFinishedMoving$', (done) => {
            service.signalUserFinishedMoving$.subscribe((data) => {
                expect(data).toEqual(mockPlayerCharacter.socketId);
                done();
            });
            service.signalUserFinishedMoving.next(mockPlayerCharacter.socketId);
        });

        it('should emit and subscribe to signalUserGotTurnEnded$', (done) => {
            service.signalUserGotTurnEnded$.subscribe((data) => {
                expect(data).toEqual(mockPlayerCharacter.socketId);
                done();
            });
            service.signalUserGotTurnEnded.next(mockPlayerCharacter.socketId);
        });

        it('should emit and subscribe to signalUserDidDoorAction$', (done) => {
            const doorActionData = { tileCoordinate: { x: 5, y: 5 } as Vec2, playerTurnId: mockPlayerCharacter.socketId };
            service.signalUserDidDoorAction$.subscribe((data) => {
                expect(data).toEqual(doorActionData);
                done();
            });
            service.signalUserDidDoorAction.next(doorActionData);
        });

        it('should emit and subscribe to signalUserDidBattleAction$', (done) => {
            const battleActionData = { playerTurnId: mockPlayerCharacter.socketId, enemyPlayerId: 'opponentId' };
            service.signalUserDidBattleAction$.subscribe((data) => {
                expect(data).toBe(battleActionData);
                done();
            });
            service.signalUserDidBattleAction.next(battleActionData);
        });

        it('should emit and subscribe to signalUserWon$', (done) => {
            service.signalUserWon$.subscribe((data) => {
                expect(data).toEqual(mockPlayerCharacter.socketId);
                done();
            });
            service.signalUserWon.next(mockPlayerCharacter.socketId);
        });
    });

    describe('init', () => {
        let service: PlayGameBoardManagerService;
        // let gameBoardParameters: GameBoardParameters;

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

    describe('initGameBoard', () => {
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

    describe('initCharacters', () => {
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
                id: '',
                accessCode: 0,
                isLocked: false,
                maxPlayers: 0,
                currentPlayerTurn: '',
                organizer: '',
            });

            const spawnPlaces: [number, string][] = [[0, 'player1']];

            service.initCharacters(spawnPlaces);

            expect(mockPlayer.mapEntity).toBeTruthy();
            expect(mockPlayer.mapEntity?.spawnCoordinates).toEqual(tile1.coordinates);
            expect(tile1.player).toBe(mockPlayer.mapEntity);
            expect(tile2.item).toBeNull();
        });
    });

    describe('startTurn', () => {
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

            const result = 3;
            expect(mockPlayerCharacter.currentMovePoints).toBe(result);
            expect(mockPlayerCharacter.currentActionPoints).toBe(1);
            expect(service.setupPossibleMoves).toHaveBeenCalledWith(mockPlayerCharacter);
        });

        it('should not call setupPossibleMoves if it is not the user’s turn', () => {
            const mockPlayerCharacter = {
                attributes: { speed: 3 },
            } as PlayerCharacter;

            service.isUserTurn = false;
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockPlayerCharacter);
            spyOn(service, 'setupPossibleMoves');

            service.startTurn();

            const result = 3;
            expect(mockPlayerCharacter.currentMovePoints).toBe(result);
            expect(mockPlayerCharacter.currentActionPoints).toBe(1);
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });

        it('should not set move points, action points, or call setupPossibleMoves if player is not found', () => {
            service.isUserTurn = true;
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(null);
            spyOn(service, 'setupPossibleMoves');

            service.startTurn();

            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });
    });

    describe('setupPossibleMoves', () => {
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
            const mockPlayerCharacter = new PlayerCharacter('player1');
            mockPlayerCharacter.currentMovePoints = 2;

            service.isUserTurn = true;
            spyOn(service, 'setPossibleMoves');
            spyOn(service, 'showPossibleMoves');

            service.setupPossibleMoves(mockPlayerCharacter);

            expect(service.setPossibleMoves).toHaveBeenCalledWith(mockPlayerCharacter);
            expect(service.showPossibleMoves).toHaveBeenCalled();
        });

        it('should not call setPossibleMoves or showPossibleMoves if userCurrentMovePoints is 0', () => {
            const mockPlayerCharacter = new PlayerCharacter('player1');
            mockPlayerCharacter.currentMovePoints = 0;

            service.isUserTurn = true;
            spyOn(service, 'setPossibleMoves');
            spyOn(service, 'showPossibleMoves');

            service.setupPossibleMoves(mockPlayerCharacter);

            expect(service.setPossibleMoves).not.toHaveBeenCalled();
            expect(service.showPossibleMoves).not.toHaveBeenCalled();
        });

        it('should not call setPossibleMoves or showPossibleMoves if it is not the user’s turn', () => {
            const mockPlayerCharacter = new PlayerCharacter('player1');
            mockPlayerCharacter.currentMovePoints = 2;

            service.isUserTurn = false;
            spyOn(service, 'setPossibleMoves');
            spyOn(service, 'showPossibleMoves');

            service.setupPossibleMoves(mockPlayerCharacter);

            expect(service.setPossibleMoves).not.toHaveBeenCalled();
            expect(service.showPossibleMoves).not.toHaveBeenCalled();
        });
    });

    describe('setPossibleMoves', () => {
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
            mockPlayerCharacter.currentMovePoints = 3;

            const mockPossibleMoves = new Map<Tile, Tile[]>();
            gameMapDataManagerServiceSpy.getPossibleMovementTiles.and.returnValue(mockPossibleMoves);

            service.setPossibleMoves(mockPlayerCharacter);

            expect(gameMapDataManagerServiceSpy.getPossibleMovementTiles).toHaveBeenCalledWith(
                playerCoordinates,
                mockPlayerCharacter.currentMovePoints,
            );
            expect(service.userCurrentPossibleMoves).toBe(mockPossibleMoves);
        });
    });

    describe('showPossibleMoves', () => {
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

    describe('endTurn', () => {
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
            const mockPlayerCharacter = new PlayerCharacter('player1');

            service.isUserTurn = true;
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockPlayerCharacter);
            spyOn(service, 'hidePossibleMoves');

            service.endTurn();

            expect(mockPlayerCharacter.currentMovePoints).toBe(0);
            expect(mockPlayerCharacter.currentActionPoints).toBe(0);
            expect(service.hidePossibleMoves).toHaveBeenCalled();
        });

        it('should  call hidePossibleMoves if it is not the user’s turn', () => {
            const mockPlayerCharacter = new PlayerCharacter('player1');
            service.isUserTurn = false;
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockPlayerCharacter);
            spyOn(service, 'hidePossibleMoves');

            service.endTurn();

            expect(mockPlayerCharacter.currentMovePoints).toBe(0);
            expect(service.hidePossibleMoves).not.toHaveBeenCalled();
        });

        it('should not set userCurrentMovePoints or call hidePossibleMoves if player is not found', () => {
            service.isUserTurn = true;
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(null);
            spyOn(service, 'hidePossibleMoves');

            service.endTurn();

            expect(service.hidePossibleMoves).not.toHaveBeenCalled();
        });
    });

    describe('hidePossibleMoves', () => {
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

    describe('moveUserPlayer', () => {
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
            const tile1 = new GrassTile();
            const tile2 = new GrassTile();
            tile1.coordinates = { x: 0, y: 0 };
            tile2.coordinates = { x: 1, y: 1 };

            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
            spyOn(service, 'hidePossibleMoves');
            spyOn(service.signalUserStartedMoving, 'next');
            spyOn(service.signalUserMoved, 'next');
            spyOn(service.signalUserFinishedMoving, 'next');
            spyOn(service, 'checkIfPLayerDidEverything');
            spyOn(service, 'setupPossibleMoves');

            service.isUserTurn = true;
            service.userCurrentPossibleMoves = new Map([[tile2, [tile1, tile2]]]);

            await service.moveUserPlayer(tile2);

            expect(service.hidePossibleMoves).toHaveBeenCalled();
            expect(service.signalUserStartedMoving.next).toHaveBeenCalled();
            expect(service.signalUserMoved.next).toHaveBeenCalledWith({
                fromTile: tile1.coordinates,
                toTile: tile2.coordinates,
                playerTurnId: mockPlayerCharacter.socketId,
            });
            expect(service.signalUserFinishedMoving.next).toHaveBeenCalled();
            expect(service.checkIfPLayerDidEverything).toHaveBeenCalled();
            expect(service.setupPossibleMoves).toHaveBeenCalledWith(mockPlayerCharacter);
        });

        it('should end the turn if the player trips on an ice tile', async () => {
            const tile1 = new GrassTile();
            const tile2 = new IceTile();
            tile1.coordinates = { x: 0, y: 0 };
            tile2.coordinates = { x: 1, y: 1 };

            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
            spyOn(service, 'hidePossibleMoves');
            spyOn(service.signalUserStartedMoving, 'next');
            spyOn(service.signalUserMoved, 'next');
            spyOn(service.signalUserGotTurnEnded, 'next');
            spyOn(service.signalUserFinishedMoving, 'next');
            spyOn(service, 'setupPossibleMoves');

            service.isUserTurn = true;
            service.userCurrentPossibleMoves = new Map([[tile2, [tile1, tile2]]]);

            const value = 0.05;
            spyOn(Math, 'random').and.returnValue(value);

            await service.moveUserPlayer(tile2);

            expect(service.hidePossibleMoves).toHaveBeenCalled();
            expect(service.signalUserStartedMoving.next).toHaveBeenCalled();
            expect(service.signalUserMoved.next).toHaveBeenCalledWith({
                fromTile: tile1.coordinates,
                toTile: tile2.coordinates,
                playerTurnId: mockPlayerCharacter.socketId,
            });
            expect(service.signalUserFinishedMoving.next).toHaveBeenCalled();
            expect(service.signalUserGotTurnEnded.next).toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });
    });

    describe('movePlayer', () => {
        let service: PlayGameBoardManagerService;
        let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;

        beforeEach(() => {
            gameMapDataManagerServiceSpy = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt', 'isGameModeCTF']);

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
            spyOn(service, 'doesPlayerHaveItem').and.returnValue(false);
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
            gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(false);

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
            gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(false);

            service.movePlayer(playerId, fromTileCoordinates, toTileCoordinates);

            expect(service.findPlayerFromSocketId).toHaveBeenCalledWith(playerId);
            expect(gameMapDataManagerServiceSpy.getTileAt).not.toHaveBeenCalled();
        });
    });

    describe('waitInterval', () => {
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
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('should resolve after the specified delay', async () => {
            const delay = 500;
            const promise = service.waitInterval(delay);

            let isResolved = false;
            promise.then(() => {
                isResolved = true;
            });

            expect(isResolved).toBeFalse();

            jasmine.clock().tick(delay);

            await promise;

            expect(isResolved).toBeTrue();
        });
    });

    describe('handlePlayerAction', () => {
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

        it('should handle battle action when user has action points and it is user’s turn', () => {
            const mockTile = new WalkableTile();
            const mockActionPlayer = new PlayerCharacter('player1');
            mockActionPlayer.currentActionPoints = 1;
            const mockPlayerCharacter = new PlayerCharacter('player2');
            mockPlayerCharacter.socketId = 'player2';
            mockTile.player = new PlayerMapEntity('avatar.png'); // Ensure player is defined
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockActionPlayer);
            spyOn(service, 'findPlayerFromPlayerMapEntity').and.returnValue(mockPlayerCharacter);
            spyOn(service.signalUserDidBattleAction, 'next');
            spyOn(service, 'hidePossibleMoves');

            service.isUserTurn = true;
            mockTile.hasPlayer = () => true;

            service.handlePlayerAction(mockTile);

            expect(service.findPlayerFromPlayerMapEntity).toHaveBeenCalledWith(mockTile.player);
            expect(service.signalUserDidBattleAction.next).toHaveBeenCalledWith({ playerTurnId: 'player1', enemyPlayerId: 'player2' });
            expect(service.hidePossibleMoves).toHaveBeenCalled();
        });
    });
    describe('checkIfPLayerDidEverything', () => {
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

            const mockTile = new Tile();
            gameMapDataManagerServiceSpy.getTileAt.and.returnValue(mockTile);
        });

        it('should emit signalUserGotTurnEnded if no move points and no action points are available', () => {
            spyOn(service.signalUserGotTurnEnded, 'next');

            service.checkIfPLayerDidEverything(mockPlayerCharacter);

            expect(service.signalUserGotTurnEnded.next).toHaveBeenCalled();
        });

        it('should emit signalUserGotTurnEnded if no move points and no adjacent action tiles are available', () => {
            mockPlayerCharacter.currentActionPoints = 1;

            const mockTile = new Tile();
            spyOn(service, 'getPlayerTile').and.returnValue(mockTile);
            spyOn(service, 'getAdjacentActionTiles').and.returnValue([]);
            spyOn(service.signalUserGotTurnEnded, 'next');

            service.checkIfPLayerDidEverything(mockPlayerCharacter);

            expect(service.signalUserGotTurnEnded.next).toHaveBeenCalled();
        });

        it('should not emit signalUserGotTurnEnded if move points are available', () => {
            mockPlayerCharacter.currentMovePoints = 1;
            mockPlayerCharacter.currentActionPoints = 1;

            spyOn(service.signalUserGotTurnEnded, 'next');

            service.checkIfPLayerDidEverything(mockPlayerCharacter);

            expect(service.signalUserGotTurnEnded.next).not.toHaveBeenCalled();
        });

        it('should not emit signalUserGotTurnEnded if there are adjacent action tiles available', () => {
            mockPlayerCharacter.currentActionPoints = 1;

            const mockTile = new Tile();
            spyOn(service, 'getPlayerTile').and.returnValue(mockTile);
            spyOn(service, 'getAdjacentActionTiles').and.returnValue([mockTile]);
            spyOn(service.signalUserGotTurnEnded, 'next');

            service.checkIfPLayerDidEverything(mockPlayerCharacter);

            expect(service.signalUserGotTurnEnded.next).not.toHaveBeenCalled();
        });
    });

    describe('toggleDoor', () => {
        let service: PlayGameBoardManagerService;
        let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;
        let tileFactoryServiceSpy: jasmine.SpyObj<TileFactoryService>;

        beforeEach(() => {
            gameMapDataManagerServiceSpy = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt', 'setTileAt']);
            tileFactoryServiceSpy = jasmine.createSpyObj('TileFactoryService', ['createTile']);

            TestBed.configureTestingModule({
                providers: [
                    PlayGameBoardManagerService,
                    { provide: GameMapDataManagerService, useValue: gameMapDataManagerServiceSpy },
                    { provide: TileFactoryService, useValue: tileFactoryServiceSpy },
                    { provide: WebSocketService, useValue: {} },
                    { provide: BattleManagerService, useValue: {} },
                ],
            });

            service = TestBed.inject(PlayGameBoardManagerService);

            // Mock the player character with required properties
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue({
                id: 'player1',
                mapEntity: { coordinates: { x: 1, y: 1 } },
            } as unknown as PlayerCharacter);
        });

        it('should replace Door with OpenDoor and call setTileAt', () => {
            const tileCoordinate: Vec2 = { x: 1, y: 1 };
            const mockDoorTile = new Tile();
            mockDoorTile.type = TileType.Door;
            mockDoorTile.coordinates = tileCoordinate;
            mockDoorTile.isDoor = () => true;

            const openDoorTile = new Tile();
            openDoorTile.type = TileType.OpenDoor;

            tileFactoryServiceSpy.createTile.and.callFake((type: TileType) => {
                const newTile = new Tile();
                newTile.type = type;
                newTile.coordinates = tileCoordinate; // Mock the coordinates
                return newTile;
            });

            gameMapDataManagerServiceSpy.getTileAt.and.returnValue(mockDoorTile);

            service.toggleDoor(tileCoordinate);

            expect(tileFactoryServiceSpy.createTile).toHaveBeenCalledWith(TileType.OpenDoor);
            expect(gameMapDataManagerServiceSpy.setTileAt).toHaveBeenCalledWith(
                tileCoordinate,
                jasmine.objectContaining({ type: TileType.OpenDoor, coordinates: tileCoordinate }),
            );
        });

        it('should replace OpenDoor with Door and call setTileAt', () => {
            const tileCoordinate: Vec2 = { x: 1, y: 1 };
            const mockOpenDoorTile = new Tile();
            mockOpenDoorTile.type = TileType.OpenDoor;
            mockOpenDoorTile.coordinates = tileCoordinate;
            mockOpenDoorTile.isDoor = () => true;

            const doorTile = new Tile();
            doorTile.type = TileType.Door;

            tileFactoryServiceSpy.createTile.and.callFake((type: TileType) => {
                const newTile = new Tile();
                newTile.type = type;
                newTile.coordinates = tileCoordinate; // Mock the coordinates
                return newTile;
            });

            gameMapDataManagerServiceSpy.getTileAt.and.returnValue(mockOpenDoorTile);

            service.toggleDoor(tileCoordinate);

            expect(tileFactoryServiceSpy.createTile).toHaveBeenCalledWith(TileType.Door);
            expect(gameMapDataManagerServiceSpy.setTileAt).toHaveBeenCalledWith(
                tileCoordinate,
                jasmine.objectContaining({ type: TileType.Door, coordinates: tileCoordinate }),
            );
        });
    });

    describe('startBattle', () => {
        let service: PlayGameBoardManagerService;
        let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
        let battleManagerServiceSpy: jasmine.SpyObj<BattleManagerService>;

        beforeEach(() => {
            webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', [], {
                socket: { id: 'userSocketId' },
            });
            battleManagerServiceSpy = jasmine.createSpyObj('BattleManagerService', ['init']);

            TestBed.configureTestingModule({
                providers: [
                    PlayGameBoardManagerService,
                    { provide: GameMapDataManagerService, useValue: {} },
                    { provide: TileFactoryService, useValue: {} },
                    { provide: WebSocketService, useValue: webSocketServiceSpy },
                    { provide: BattleManagerService, useValue: battleManagerServiceSpy },
                ],
            });

            service = TestBed.inject(PlayGameBoardManagerService);
        });

        // it('should set areOtherPlayersInBattle to true if user is not involved in battle', () => {
        //     service.areOtherPlayersInBattle = false;

        //     service.startBattle('player1', 'player2'); // User is neither player1 nor player2

        //     expect(service.areOtherPlayersInBattle).toBeTrue();
        //     expect(battleManagerServiceSpy.init).not.toHaveBeenCalled();
        // });

        it('should initialize battle if user is the playerId', () => {
            const mockCurrentPlayer = { socketId: 'userSocketId' } as PlayerCharacter;
            const mockOpponent = { socketId: 'enemySocketId' } as PlayerCharacter;

            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockCurrentPlayer);
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockOpponent);

            service.startBattle('userSocketId', 'enemySocketId');

            expect(service.getCurrentPlayerCharacter).toHaveBeenCalled();
            expect(service.findPlayerFromSocketId).toHaveBeenCalledWith('enemySocketId');
            expect(battleManagerServiceSpy.init).toHaveBeenCalledWith(mockCurrentPlayer, mockOpponent);
        });

        it('should initialize battle if user is the enemyPlayerId', () => {
            const mockCurrentPlayer = { socketId: 'userSocketId' } as PlayerCharacter;
            const mockOpponent = { socketId: 'playerSocketId' } as PlayerCharacter;

            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockCurrentPlayer);
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockOpponent);

            service.startBattle('playerSocketId', 'userSocketId');

            expect(service.getCurrentPlayerCharacter).toHaveBeenCalled();
            expect(service.findPlayerFromSocketId).toHaveBeenCalledWith('playerSocketId');
            expect(battleManagerServiceSpy.init).toHaveBeenCalledWith(mockCurrentPlayer, mockOpponent);
        });

        it('should not initialize battle if opponent player is not found', () => {
            const mockCurrentPlayer = { socketId: 'userSocketId' } as PlayerCharacter;

            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockCurrentPlayer);
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(null); // Opponent not found

            service.startBattle('userSocketId', 'enemySocketId');

            expect(service.getCurrentPlayerCharacter).toHaveBeenCalled();
            expect(service.findPlayerFromSocketId).toHaveBeenCalledWith('enemySocketId');
            expect(battleManagerServiceSpy.init).not.toHaveBeenCalled();
        });
    });

    describe('continueTurn', () => {
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

            // Mock getCurrentPlayerCharacter in every test
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue({ id: 'player1' } as unknown as PlayerCharacter);
        });

        it('should not call checkIfPLayerDidEverything or setupPossibleMoves if it is not user’s turn', () => {
            service.isUserTurn = false;
            spyOn(service, 'checkIfPLayerDidEverything');
            spyOn(service, 'setupPossibleMoves');

            service.continueTurn();

            expect(service.checkIfPLayerDidEverything).not.toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });

        it('should not call checkIfPLayerDidEverything or setupPossibleMoves if player character is not found', () => {
            service.isUserTurn = true;
            (service.getCurrentPlayerCharacter as jasmine.Spy).and.returnValue(null);
            spyOn(service, 'checkIfPLayerDidEverything');
            spyOn(service, 'setupPossibleMoves');

            service.continueTurn();

            expect(service.checkIfPLayerDidEverything).not.toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });
    });

    describe('endBattleByDeath', () => {
        let service: PlayGameBoardManagerService;
        let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;

        beforeEach(() => {
            gameMapDataManagerServiceSpy = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt', 'getClosestWalkableTileWithoutPlayerAt']);

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

        it('should increment fightWins, call checkIfPlayerWonGame, and emit signalUserRespawned if loser is the current player', () => {
            const winnerPlayer = new PlayerCharacter('winner');
            const loserPlayer = new PlayerCharacter('loser');
            loserPlayer.mapEntity = { coordinates: { x: 1, y: 1 } } as PlayerMapEntity;
            loserPlayer.socketId = 'loser';

            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 1, y: 1 };

            const spawnTile = new WalkableTile();
            spawnTile.coordinates = { x: 2, y: 2 };

            spyOn(service, 'findPlayerFromSocketId').and.callFake((id) => {
                if (id === 'winner') return winnerPlayer;
                if (id === 'loser') return loserPlayer;
                return null;
            });

            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(loserPlayer);
            spyOn(service, 'checkIfPlayerWonClassicGame');
            spyOn(service.signalUserRespawned, 'next');

            gameMapDataManagerServiceSpy.getTileAt.and.returnValue(currentTile);
            gameMapDataManagerServiceSpy.getClosestWalkableTileWithoutPlayerAt.and.returnValue(spawnTile);

            service.endBattleByDeath('winner', 'loser');

            expect(winnerPlayer.fightWins).toBe(1);
            expect(service.checkIfPlayerWonClassicGame).toHaveBeenCalledWith(winnerPlayer);
            expect(service.signalUserRespawned.next).toHaveBeenCalledWith({
                fromTile: currentTile.coordinates,
                toTile: spawnTile.coordinates,
                playerTurnId: loserPlayer.socketId,
            });
        });

        it('should not emit signalUserRespawned if loser is not the current player', () => {
            const winnerPlayer = new PlayerCharacter('winner');
            const loserPlayer = new PlayerCharacter('loser');
            loserPlayer.mapEntity = { coordinates: { x: 1, y: 1 } } as PlayerMapEntity;

            spyOn(service, 'findPlayerFromSocketId').and.callFake((id) => {
                if (id === 'winner') return winnerPlayer;
                if (id === 'loser') return loserPlayer;
                return null;
            });

            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(new PlayerCharacter('anotherPlayer'));
            spyOn(service, 'checkIfPlayerWonClassicGame');
            spyOn(service.signalUserRespawned, 'next');

            service.endBattleByDeath('winner', 'loser');

            expect(winnerPlayer.fightWins).toBe(1);
            expect(service.checkIfPlayerWonClassicGame).toHaveBeenCalledWith(winnerPlayer);
            expect(service.signalUserRespawned.next).not.toHaveBeenCalled();
        });

        it('should do nothing if winnerPlayerCharacter is not found', () => {
            const loserPlayer = new PlayerCharacter('loser');

            spyOn(service, 'findPlayerFromSocketId').and.callFake((id) => {
                if (id === 'loser') return loserPlayer;
                return null;
            });

            spyOn(service.signalUserRespawned, 'next');
            spyOn(service, 'checkIfPlayerWonClassicGame');

            service.endBattleByDeath('winner', 'loser');

            expect(service.checkIfPlayerWonClassicGame).not.toHaveBeenCalled();
            expect(service.signalUserRespawned.next).not.toHaveBeenCalled();
        });

        it('should do nothing if loserPlayerCharacter is not found', () => {
            const winnerPlayer = new PlayerCharacter('winner');

            spyOn(service, 'findPlayerFromSocketId').and.callFake((id) => {
                if (id === 'winner') return winnerPlayer;
                return null;
            });

            spyOn(service.signalUserRespawned, 'next');
            spyOn(service, 'checkIfPlayerWonClassicGame');

            service.endBattleByDeath('winner', 'loser');

            expect(service.checkIfPlayerWonClassicGame).not.toHaveBeenCalled();
            expect(service.signalUserRespawned.next).not.toHaveBeenCalled();
        });
    });

    describe('checkIfPlayerWonClassicGame', () => {
        let service: PlayGameBoardManagerService;
        let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;

        beforeEach(() => {
            gameMapDataManagerServiceSpy = jasmine.createSpyObj('GameMapDataManagerService', [
                'getTileAt',
                'getClosestWalkableTileWithoutPlayerAt',
                'isGameModeCTF',
            ]);

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
            gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(false);
        });

        it('should emit signalUserWon if playerCharacter is current player and has fightWins >= 3', () => {
            const mockPlayerCharacter = new PlayerCharacter('player1');
            mockPlayerCharacter.fightWins = 3;

            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
            spyOn(service.signalUserWon, 'next');

            service.checkIfPlayerWonClassicGame(mockPlayerCharacter);

            expect(service.signalUserWon.next).toHaveBeenCalled();
        });

        it('should not emit signalUserWon if playerCharacter has fightWins < 3', () => {
            const mockPlayerCharacter = new PlayerCharacter('player1');
            mockPlayerCharacter.fightWins = 2;

            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
            spyOn(service.signalUserWon, 'next');

            service.checkIfPlayerWonClassicGame(mockPlayerCharacter);

            expect(service.signalUserWon.next).not.toHaveBeenCalled();
        });

        it('should not emit signalUserWon if playerCharacter is not the current player', () => {
            const mockPlayerCharacter = new PlayerCharacter('player1');
            mockPlayerCharacter.fightWins = 3;
            const differentPlayer = new PlayerCharacter('player2');

            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(differentPlayer);
            spyOn(service.signalUserWon, 'next');
            gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(false);

            service.checkIfPlayerWonClassicGame(mockPlayerCharacter);

            expect(service.signalUserWon.next).not.toHaveBeenCalled();
        });
    });

    describe('endGame', () => {
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

        it('should set winnerPlayer to the found player', () => {
            const mockPlayer = new PlayerCharacter('player1');
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockPlayer);

            service.endGame('player1');

            expect(service.findPlayerFromSocketId).toHaveBeenCalledWith('player1');
            expect(service.winnerPlayer).toBe(mockPlayer);
        });

        it('should set winnerPlayer to null if player is not found', () => {
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(null);

            service.endGame('player1');

            expect(service.findPlayerFromSocketId).toHaveBeenCalledWith('player1');
            expect(service.winnerPlayer).toBeNull();
        });
    });
    describe('getWinnerPlayer', () => {
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

        it('should return winnerPlayer if it is set', () => {
            const mockWinner = new PlayerCharacter('winnerPlayer');
            service.winnerPlayer = mockWinner;

            const result = service.getWinnerPlayer();

            expect(result).toBe(mockWinner);
        });

        it('should return null if winnerPlayer is not set', () => {
            service.winnerPlayer = null;

            const result = service.getWinnerPlayer();

            expect(result).toBeNull();
        });
    });
    describe('removePlayerFromMap', () => {
        let service: PlayGameBoardManagerService;
        let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;
        let battleManagerServiceSpy: jasmine.SpyObj<BattleManagerService>;

        beforeEach(() => {
            gameMapDataManagerServiceSpy = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt']);
            battleManagerServiceSpy = jasmine.createSpyObj('BattleManagerService', ['init']);

            TestBed.configureTestingModule({
                providers: [
                    PlayGameBoardManagerService,
                    { provide: GameMapDataManagerService, useValue: gameMapDataManagerServiceSpy },
                    { provide: TileFactoryService, useValue: {} },
                    { provide: WebSocketService, useValue: {} },
                    { provide: BattleManagerService, useValue: battleManagerServiceSpy },
                ],
            });

            service = TestBed.inject(PlayGameBoardManagerService);
        });

        it('should remove player from map and call continueTurn if isBattleOn is false', () => {
            const mockPlayerCharacter = new PlayerCharacter('player1');
            mockPlayerCharacter.mapEntity = {
                coordinates: { x: 1, y: 1 },
                spawnCoordinates: { x: 2, y: 2 },
            } as PlayerMapEntity;

            const mockCurrentTile = new TerrainTile();
            const mockSpawnTile = new TerrainTile();
            spyOn(mockCurrentTile, 'removePlayer');
            spyOn(mockSpawnTile, 'removeItem');

            spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockPlayerCharacter);
            spyOn(service, 'continueTurn');

            // Directly set the isBattleOn property instead of using spyOnProperty
            battleManagerServiceSpy.isBattleOn = false;

            gameMapDataManagerServiceSpy.getTileAt.and.callFake((coordinates: Vec2) => {
                if (coordinates.x === 1 && coordinates.y === 1) return mockCurrentTile;
                if (coordinates.x === 2 && coordinates.y === 2) return mockSpawnTile;
                return null;
            });

            service.removePlayerFromMap('player1');

            expect(mockCurrentTile.removePlayer).toHaveBeenCalled();
            expect(mockSpawnTile.removeItem).toHaveBeenCalled();
            expect(service.continueTurn).toHaveBeenCalled();
        });

        it('should remove player from map but not call continueTurn if isBattleOn is true', () => {
            const mockPlayerCharacter = new PlayerCharacter('player1');
            mockPlayerCharacter.mapEntity = {
                coordinates: { x: 1, y: 1 },
                spawnCoordinates: { x: 2, y: 2 },
            } as PlayerMapEntity;

            const mockCurrentTile = new TerrainTile();
            const mockSpawnTile = new TerrainTile();
            spyOn(mockCurrentTile, 'removePlayer');
            spyOn(mockSpawnTile, 'removeItem');

            spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockPlayerCharacter);
            spyOn(service, 'continueTurn');

            // Set isBattleOn to true
            battleManagerServiceSpy.isBattleOn = true;

            gameMapDataManagerServiceSpy.getTileAt.and.callFake((coordinates: Vec2) => {
                if (coordinates.x === 1 && coordinates.y === 1) return mockCurrentTile;
                if (coordinates.x === 2 && coordinates.y === 2) return mockSpawnTile;
                return null;
            });

            service.removePlayerFromMap('player1');

            expect(mockCurrentTile.removePlayer).toHaveBeenCalled();
            expect(mockSpawnTile.removeItem).toHaveBeenCalled();
            expect(service.continueTurn).not.toHaveBeenCalled();
        });
    });

    describe('getCurrentGrid', () => {
        let service: PlayGameBoardManagerService;
        let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;

        beforeEach(() => {
            gameMapDataManagerServiceSpy = jasmine.createSpyObj('GameMapDataManagerService', ['getCurrentGrid']);

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

        it('should return the current grid from gameMapDataManagerService', () => {
            const mockGrid: Tile[][] = [
                [new Tile(), new Tile()],
                [new Tile(), new Tile()],
            ];

            gameMapDataManagerServiceSpy.getCurrentGrid.and.returnValue(mockGrid);

            const result = service.getCurrentGrid();

            expect(gameMapDataManagerServiceSpy.getCurrentGrid).toHaveBeenCalled();
            expect(result).toBe(mockGrid);
        });
    });

    describe('getPlayerTile', () => {
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

        it('should return the tile at the player’s coordinates if player is found', () => {
            const mockPlayer = new PlayerCharacter('player1');
            const playerCoordinates: Vec2 = { x: 1, y: 1 };
            mockPlayer.mapEntity = { coordinates: playerCoordinates } as PlayerMapEntity;

            const mockTile = new Tile();
            gameMapDataManagerServiceSpy.getTileAt.and.returnValue(mockTile);

            const result = service.getPlayerTile(mockPlayer);

            expect(gameMapDataManagerServiceSpy.getTileAt).toHaveBeenCalledWith(playerCoordinates);
            expect(result).toBe(mockTile);
        });

        it('should return null if no player is found', () => {
            const result = service.getPlayerTile(mockPlayerCharacter);

            expect(gameMapDataManagerServiceSpy.getTileAt).toHaveBeenCalledWith(mockPlayerCharacter.mapEntity.coordinates);
            expect(result).toBeNull();
        });
    });

    describe('getAdjacentActionTiles', () => {
        let service: PlayGameBoardManagerService;
        let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;

        beforeEach(() => {
            gameMapDataManagerServiceSpy = jasmine.createSpyObj('GameMapDataManagerService', ['getNeighbours']);

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

        it('should return adjacent tiles that are walkable with a player or are doors', () => {
            const tile = new Tile();

            const walkableTileWithPlayer = new WalkableTile();
            spyOn(walkableTileWithPlayer, 'hasPlayer').and.returnValue(true);

            const doorTile = new Tile();
            spyOn(doorTile, 'isDoor').and.returnValue(true);

            const emptyWalkableTile = new WalkableTile();
            spyOn(emptyWalkableTile, 'hasPlayer').and.returnValue(false);

            gameMapDataManagerServiceSpy.getNeighbours.and.returnValue([walkableTileWithPlayer, doorTile, emptyWalkableTile]);

            const result = service.getAdjacentActionTiles(tile);

            expect(gameMapDataManagerServiceSpy.getNeighbours).toHaveBeenCalledWith(tile);
            expect(result).toContain(walkableTileWithPlayer);
            expect(result).toContain(doorTile);
            expect(result).not.toContain(emptyWalkableTile);
        });

        it('should return an empty array if no adjacent tiles meet the criteria', () => {
            const tile = new Tile();

            const emptyWalkableTile = new WalkableTile();
            spyOn(emptyWalkableTile, 'hasPlayer').and.returnValue(false);

            const regularTile = new Tile();
            spyOn(regularTile, 'isDoor').and.returnValue(false);

            gameMapDataManagerServiceSpy.getNeighbours.and.returnValue([emptyWalkableTile, regularTile]);

            const result = service.getAdjacentActionTiles(tile);

            expect(gameMapDataManagerServiceSpy.getNeighbours).toHaveBeenCalledWith(tile);
            expect(result).toEqual([]);
        });

        it('should return an empty array if there are no adjacent tiles', () => {
            const tile = new Tile();
            gameMapDataManagerServiceSpy.getNeighbours.and.returnValue([]);

            const result = service.getAdjacentActionTiles(tile);

            expect(gameMapDataManagerServiceSpy.getNeighbours).toHaveBeenCalledWith(tile);
            expect(result).toEqual([]);
        });
    });

    describe('findPlayerFromPlayerMapEntity', () => {
        let service: PlayGameBoardManagerService;
        let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;

        beforeEach(() => {
            webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['getRoomInfo']);

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

        it('should return the player if a matching playerMapEntity is found', () => {
            const playerMapEntity = new PlayerMapEntity('avatar');
            const mockPlayer = new PlayerCharacter('player1');
            mockPlayer.mapEntity = playerMapEntity;

            webSocketServiceSpy.getRoomInfo.and.returnValue({
                players: [mockPlayer],
                id: '',
                accessCode: 0,
                isLocked: false,
                maxPlayers: 0,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.findPlayerFromPlayerMapEntity(playerMapEntity);

            expect(webSocketServiceSpy.getRoomInfo).toHaveBeenCalled();
            expect(result).toBe(mockPlayer);
        });

        it('should return null if no matching playerMapEntity is found', () => {
            const playerMapEntity = new PlayerMapEntity('avatar');
            const otherPlayer = new PlayerCharacter('player2');
            otherPlayer.mapEntity = new PlayerMapEntity('differentAvatar');

            webSocketServiceSpy.getRoomInfo.and.returnValue({
                players: [otherPlayer],
                id: '',
                accessCode: 0,
                isLocked: false,
                maxPlayers: 0,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.findPlayerFromPlayerMapEntity(playerMapEntity);

            expect(webSocketServiceSpy.getRoomInfo).toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe('findPlayerFromName', () => {
        let service: PlayGameBoardManagerService;
        let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;

        beforeEach(() => {
            webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['getRoomInfo']);

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

        it('should return the player if a matching name is found', () => {
            const playerName = 'player1';
            const mockPlayer = new PlayerCharacter(playerName);

            webSocketServiceSpy.getRoomInfo.and.returnValue({
                players: [mockPlayer],
                id: '',
                accessCode: 0,
                isLocked: false,
                maxPlayers: 0,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.findPlayerFromName(playerName);

            expect(webSocketServiceSpy.getRoomInfo).toHaveBeenCalled();
            expect(result).toBe(mockPlayer);
        });

        it('should return null if no matching name is found', () => {
            const playerName = 'player1';
            const otherPlayer = new PlayerCharacter('player2');

            webSocketServiceSpy.getRoomInfo.and.returnValue({
                players: [otherPlayer],
                id: '',
                accessCode: 0,
                isLocked: false,
                maxPlayers: 0,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.findPlayerFromName(playerName);

            expect(webSocketServiceSpy.getRoomInfo).toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe('findPlayerFromSocketId', () => {
        let service: PlayGameBoardManagerService;
        let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;

        beforeEach(() => {
            webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['getRoomInfo']);

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

        it('should return null if socketId is undefined', () => {
            const result = service.findPlayerFromSocketId(undefined);

            expect(webSocketServiceSpy.getRoomInfo).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('should return the player if a matching socketId is found', () => {
            const socketId = 'socket123';
            const mockPlayer = new PlayerCharacter('player1');
            mockPlayer.socketId = socketId;

            webSocketServiceSpy.getRoomInfo.and.returnValue({
                players: [mockPlayer],
                id: '',
                accessCode: 0,
                isLocked: false,
                maxPlayers: 0,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.findPlayerFromSocketId(socketId);

            expect(webSocketServiceSpy.getRoomInfo).toHaveBeenCalled();
            expect(result).toBe(mockPlayer);
        });

        it('should return null if no matching socketId is found', () => {
            const socketId = 'socket123';
            const otherPlayer = new PlayerCharacter('player2');
            otherPlayer.socketId = 'socket456';

            webSocketServiceSpy.getRoomInfo.and.returnValue({
                players: [otherPlayer],
                id: '',
                accessCode: 0,
                isLocked: false,
                maxPlayers: 0,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.findPlayerFromSocketId(socketId);

            expect(webSocketServiceSpy.getRoomInfo).toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe('getCurrentPlayerTurnName', () => {
        let service: PlayGameBoardManagerService;
        let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;

        beforeEach(() => {
            webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['getRoomInfo']);

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

        it('should return the name of the player with the currentPlayerIdTurn', () => {
            const currentPlayerIdTurn = 'socket123';
            service.currentPlayerIdTurn = currentPlayerIdTurn;

            const mockPlayer = new PlayerCharacter('player1');
            mockPlayer.socketId = currentPlayerIdTurn;
            mockPlayer.name = 'Player One';

            webSocketServiceSpy.getRoomInfo.and.returnValue({
                players: [mockPlayer],
                id: '',
                accessCode: 0,
                isLocked: false,
                maxPlayers: 0,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.getCurrentPlayerTurnName();

            expect(webSocketServiceSpy.getRoomInfo).toHaveBeenCalled();
            expect(result).toBe('Player One');
        });

        it('should return an empty string if no player with the currentPlayerIdTurn is found', () => {
            service.currentPlayerIdTurn = 'socket123';

            const otherPlayer = new PlayerCharacter('player2');
            otherPlayer.socketId = 'socket456';
            otherPlayer.name = 'Player Two';

            webSocketServiceSpy.getRoomInfo.and.returnValue({
                players: [otherPlayer],
                id: '',
                accessCode: 0,
                isLocked: false,
                maxPlayers: 0,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.getCurrentPlayerTurnName();

            expect(webSocketServiceSpy.getRoomInfo).toHaveBeenCalled();
            expect(result).toBe('');
        });
    });

    describe('getCurrentPlayerCharacter', () => {
        let service: PlayGameBoardManagerService;
        let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;

        beforeEach(() => {
            webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', [], {
                socket: { id: 'socket123' },
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

        it('should return the current player character if a matching player is found', () => {
            const mockPlayer = new PlayerCharacter('player1');
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockPlayer);

            const result = service.getCurrentPlayerCharacter();

            expect(service.findPlayerFromSocketId).toHaveBeenCalledWith('socket123');
            expect(result).toBe(mockPlayer);
        });

        it('should return null if no matching player is found', () => {
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(null);

            const result = service.getCurrentPlayerCharacter();

            expect(service.findPlayerFromSocketId).toHaveBeenCalledWith('socket123');
            expect(result).toBeNull();
        });
    });

    describe('resetManager', () => {
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

        it('should reset all manager properties to their initial values', () => {
            // Set properties to non-default values to verify reset
            service.currentTime = 100;
            service.areOtherPlayersInBattle = true;
            service.currentPlayerIdTurn = 'player1';
            service.isUserTurn = true;
            service.userCurrentPossibleMoves.set(new GrassTile(), []);
            service.turnOrder = ['player1', 'player2'];
            service.winnerPlayer = { name: 'Winner' } as PlayerCharacter;

            service.resetManager();

            expect(service.currentTime).toBe(0);
            expect(service.areOtherPlayersInBattle).toBe(false);
            expect(service.currentPlayerIdTurn).toBe('');
            expect(service.isUserTurn).toBe(false);
            expect(service.userCurrentPossibleMoves.size).toBe(0);
            expect(service.winnerPlayer).toBeNull();
        });
    });

    describe('continueTurn', () => {
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

        it('should call checkIfPLayerDidEverything and setupPossibleMoves if it is user’s turn and player character is present', () => {
            const mockPlayerCharacter = {} as PlayerCharacter;

            service.isUserTurn = true;
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
            spyOn(service, 'checkIfPLayerDidEverything');
            spyOn(service, 'setupPossibleMoves');

            service.continueTurn();

            expect(service.checkIfPLayerDidEverything).toHaveBeenCalled();
            expect(service.setupPossibleMoves).toHaveBeenCalledWith(mockPlayerCharacter);
        });

        it('should not call checkIfPLayerDidEverything or setupPossibleMoves if player character is not found', () => {
            service.isUserTurn = true;
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(null);
            spyOn(service, 'checkIfPLayerDidEverything');
            spyOn(service, 'setupPossibleMoves');

            service.continueTurn();

            expect(service.checkIfPLayerDidEverything).not.toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });
    });
});
