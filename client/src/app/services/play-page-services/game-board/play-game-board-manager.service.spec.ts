/* eslint-disable max-lines */ // impossible to test this file, which is a manager file so it is expected to be long, without using less than this many tests so it can not be refactored
/* eslint-disable @typescript-eslint/no-shadow */ // for the tests, the mockPlayer is reassigned
import { TestBed } from '@angular/core/testing';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { Chestplate } from '@common/classes/Items/chestplate';
import { DiamondSword } from '@common/classes/Items/diamond-sword';
import { Elytra } from '@common/classes/Items/elytra';
import { EmptyItem } from '@common/classes/Items/empty-item';
import { Item } from '@common/classes/Items/item';
import { Totem } from '@common/classes/Items/totem';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { PlayerMapEntity } from '@common/classes/Player/player-map-entity';
import { DoorTile } from '@common/classes/Tiles/door-tile';
import { GrassTile } from '@common/classes/Tiles/grass-tile';
import { IceTile } from '@common/classes/Tiles/ice-tile';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';
import { WallTile } from '@common/classes/Tiles/wall-tile';
import { ItemType } from '@common/enums/item-type';
import { TileType } from '@common/enums/tile-type';
import { GameBoardParameters } from '@common/interfaces/game-board-parameters';
import { GameShared } from '@common/interfaces/game-shared';
import { VisibleState } from '@common/interfaces/placeable-entity';
import { Vec2 } from '@common/interfaces/vec2';
import { BattleManagerService } from './battle-manager.service';
import { PlayGameBoardManagerService } from './play-game-board-manager.service';

describe('PlayGameBoardManagerService', () => {
    const mockPlayerCharacter = new PlayerCharacter('player1');
    mockPlayerCharacter.socketId = 'player1';
    mockPlayerCharacter.name = 'player1';
    mockPlayerCharacter.avatar = {
        name: 'Steve',
        headImage: 'assets/images/avatar/Steve_head.png',
        fullImage: 'assets/images/avatar/Steve.png',
        mineshaftImage: 'assets/images/Skins/STeve/steve_mineshaft.jpg',
        standing: 'assets/images/Skins/STeve/standing.jpg',
        dogPetting: 'assets/images/Skins/Steve/dog_petting.jpg',
        lost: 'assets/images/Skins/Steve/lost.jpg',
        fight: 'assets/images/Skins/Steve/fight.jpg',
    };
    mockPlayerCharacter.attributes = { life: 3, speed: 3, attack: 3, defense: 3 };
    mockPlayerCharacter.mapEntity = new PlayerMapEntity('avatar.png');
    mockPlayerCharacter.mapEntity.coordinates = { x: 0, y: 0 } as Vec2;
    mockPlayerCharacter.currentActionPoints = 0;
    mockPlayerCharacter.currentMovePoints = 0;

    let service: PlayGameBoardManagerService;
    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let tileFactoryServiceSpy: jasmine.SpyObj<TileFactoryService>;
    let battleManagerServiceSpy: jasmine.SpyObj<BattleManagerService>;

    beforeEach(() => {
        gameMapDataManagerServiceSpy = jasmine.createSpyObj('GameMapDataManagerService', [
            'initGameBoard',
            'init',
            'getTilesWithSpawn',
            'getPossibleMovementTiles',
            'getTileAt',
            'isGameModeCTF',
            'setTileAt',
            'getClosestWalkableTileWithoutPlayerAt',
            'getClosestTerrainTileWithoutItemAt',
            'getCurrentGrid',
            'getNeighbours',
        ]);
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['getRoomInfo'], {
            socket: { id: 'userSocketId' },
        });
        tileFactoryServiceSpy = jasmine.createSpyObj('TileFactoryService', ['createTile']);
        battleManagerServiceSpy = jasmine.createSpyObj('BattleManagerService', ['init']);

        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: gameMapDataManagerServiceSpy },
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: TileFactoryService, useValue: tileFactoryServiceSpy },
                { provide: BattleManagerService, useValue: battleManagerServiceSpy },
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
    });

    describe('Subjects and Observables', () => {
        it('should emit and subscribe to signalManagerFinishedInit$', (done) => {
            service.signalManagerFinishedInit$.subscribe(() => {
                expect(true).toBeTrue();
                done();
            });
            service.signalManagerFinishedInit.next();
        });

        it('should emit and subscribe to signalUserMoved$', (done) => {
            const movementData = {
                fromTile: { x: 0, y: 0 },
                toTile: { x: 1, y: 1 },
                playerTurnId: mockPlayerCharacter.socketId,
                isTeleport: false,
            } as {
                fromTile: Vec2;
                toTile: Vec2;
                playerTurnId: string;
                isTeleport: boolean;
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
        it('should call gameMapDataManagerService.init with the provided game', () => {
            const mockGame = {} as GameShared;

            service.initGameBoard(mockGame);

            expect(gameMapDataManagerServiceSpy.init).toHaveBeenCalledWith(mockGame);
        });
    });

    describe('initCharacters', () => {
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
        beforeEach(() => {
            spyOn(service, 'waitInterval').and.returnValue(Promise.resolve());
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
                isTeleport: false,
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
                isTeleport: false,
            });
            expect(service.signalUserFinishedMoving.next).toHaveBeenCalled();
            expect(service.signalUserGotTurnEnded.next).toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });

        it('should signal userFinishedMoving if possibleItems is not empty', async () => {
            const tile1 = new GrassTile();
            const tile2 = new GrassTile();
            tile1.coordinates = { x: 0, y: 0 };
            tile2.coordinates = { x: 1, y: 1 };
            service.possibleItems = [new DiamondSword()];

            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
            spyOn(service, 'hidePossibleMoves');
            spyOn(service.signalUserStartedMoving, 'next');
            spyOn(service.signalUserMoved, 'next');
            spyOn(service.signalUserFinishedMoving, 'next');
            spyOn(service, 'checkIfPLayerDidEverything');
            spyOn(service, 'setupPossibleMoves');
            spyOn(service, 'handleTileItem').and.returnValue(true);

            service.isUserTurn = true;
            service.userCurrentPossibleMoves = new Map([[tile2, [tile1, tile2]]]);

            await service.moveUserPlayer(tile2);

            expect(service.hidePossibleMoves).toHaveBeenCalled();
            expect(service.signalUserStartedMoving.next).toHaveBeenCalled();
            expect(service.signalUserMoved.next).toHaveBeenCalledWith({
                fromTile: tile1.coordinates,
                toTile: tile2.coordinates,
                playerTurnId: mockPlayerCharacter.socketId,
                isTeleport: false,
            });
            expect(service.signalUserFinishedMoving.next).toHaveBeenCalled();
            expect(service.checkIfPLayerDidEverything).not.toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });

        it('should not move the user if it is not the user’s turn', async () => {
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

            service.isUserTurn = false;
            service.userCurrentPossibleMoves = new Map([[tile2, [tile1, tile2]]]);

            await service.moveUserPlayer(tile2);

            expect(service.hidePossibleMoves).not.toHaveBeenCalled();
            expect(service.signalUserStartedMoving.next).not.toHaveBeenCalled();
            expect(service.signalUserMoved.next).not.toHaveBeenCalled();
            expect(service.signalUserFinishedMoving.next).not.toHaveBeenCalled();
            expect(service.checkIfPLayerDidEverything).not.toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });
    });

    describe('teleportPlayer', () => {
        let mockTile: WalkableTile;
        let mockUserPlayerCharacter: PlayerCharacter;
        let mockLastTile: WalkableTile;

        beforeEach(() => {
            mockTile = new GrassTile();
            mockTile.coordinates = { x: 2, y: 2 } as Vec2;

            mockUserPlayerCharacter = new PlayerCharacter('player1');
            mockUserPlayerCharacter.socketId = 'player1';
            mockUserPlayerCharacter.mapEntity = new PlayerMapEntity('avatar.png');
            mockUserPlayerCharacter.mapEntity.coordinates = { x: 1, y: 1 } as Vec2;

            mockLastTile = new WalkableTile();
            mockLastTile.coordinates = { x: 1, y: 1 } as Vec2;

            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockUserPlayerCharacter);
            spyOn(service, 'getPlayerTile').and.returnValue(mockLastTile);
            spyOn(service, 'hidePossibleMoves');
            spyOn(service.signalUserMoved, 'next');
            spyOn(service, 'waitInterval').and.returnValue(Promise.resolve());
            spyOn(service, 'setupPossibleMoves');
        });

        it('should do nothing if userPlayerCharacter is not found', async () => {
            (service.getCurrentPlayerCharacter as jasmine.Spy).and.returnValue(null);

            await service.teleportPlayer(mockTile);

            expect(service.hidePossibleMoves).not.toHaveBeenCalled();
            expect(service.signalUserMoved.next).not.toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });

        it('should do nothing if it is not user’s turn', async () => {
            service.isUserTurn = false;

            await service.teleportPlayer(mockTile);

            expect(service.hidePossibleMoves).not.toHaveBeenCalled();
            expect(service.signalUserMoved.next).not.toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });

        it('should do nothing if lastTile is not found', async () => {
            (service.getPlayerTile as jasmine.Spy).and.returnValue(null);

            await service.teleportPlayer(mockTile);

            expect(service.hidePossibleMoves).not.toHaveBeenCalled();
            expect(service.signalUserMoved.next).not.toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });

        it('should do nothing if toTile is not walkable', async () => {
            mockTile.isWalkable = () => false;

            await service.teleportPlayer(mockTile);

            expect(service.hidePossibleMoves).not.toHaveBeenCalled();
            expect(service.signalUserMoved.next).not.toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });

        it('should do nothing if toTile has a player', async () => {
            mockTile.hasPlayer = () => true;

            await service.teleportPlayer(mockTile);

            expect(service.hidePossibleMoves).not.toHaveBeenCalled();
            expect(service.signalUserMoved.next).not.toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });

        it('should do nothing if toTile is terrain and item is grabbable', async () => {
            const terrainTile = new GrassTile();
            terrainTile.coordinates = { x: 2, y: 2 } as Vec2;
            terrainTile.item = new DiamondSword();

            await service.teleportPlayer(terrainTile);

            expect(service.hidePossibleMoves).not.toHaveBeenCalled();
            expect(service.signalUserMoved.next).not.toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });

        it('should hide possible moves, emit signalUserMoved, wait for interval, and setup possible moves if all conditions are met', async () => {
            service.isUserTurn = true;

            await service.teleportPlayer(mockTile);

            expect(service.hidePossibleMoves).toHaveBeenCalled();
            expect(service.signalUserMoved.next).toHaveBeenCalledWith({
                fromTile: mockLastTile.coordinates,
                toTile: mockTile.coordinates,
                playerTurnId: mockUserPlayerCharacter.socketId,
                isTeleport: true,
            });
            expect(service.waitInterval).toHaveBeenCalledWith(service.movingTimeInterval);
            expect(service.setupPossibleMoves).toHaveBeenCalledWith(mockUserPlayerCharacter);
        });
    });

    describe('movePlayer', () => {
        it('should move player from one tile to another if player is found', () => {
            const playerId = 'player1';
            const fromTileCoordinates: Vec2 = { x: 0, y: 0 };
            const toTileCoordinates: Vec2 = { x: 1, y: 1 };

            const mockPlayerCharacter = {
                mapEntity: { id: 'entity1' },
            } as unknown as PlayerCharacter;

            const fromTileInstance = new WalkableTile();
            const toTileInstance = new WalkableTile();

            spyOn(service, 'doesPlayerHaveItem').and.returnValue(true);
            spyOn(service, 'convertTileToIce').and.callThrough();
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockPlayerCharacter);
            gameMapDataManagerServiceSpy.getTileAt.and.callFake((coordinates: Vec2) => {
                if (coordinates === fromTileCoordinates) return fromTileInstance;
                if (coordinates === toTileCoordinates) return toTileInstance;
                return null;
            });
            spyOn(fromTileInstance, 'removePlayer');
            spyOn(toTileInstance, 'setPlayer');
            gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(false);

            service.movePlayer(playerId, fromTileCoordinates, toTileCoordinates, false);

            expect(service.convertTileToIce).toHaveBeenCalledWith(fromTileInstance);
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

            service.movePlayer(playerId, fromTileCoordinates, toTileCoordinates, false);

            expect(service.findPlayerFromSocketId).toHaveBeenCalledWith(playerId);
            expect(gameMapDataManagerServiceSpy.getTileAt).not.toHaveBeenCalled();
        });
    });

    describe('convertTileToIce', () => {
        it('should convert a terrain tile to an ice tile and retain the item', () => {
            const mockTerrainTile = new TerrainTile();
            mockTerrainTile.coordinates = { x: 1, y: 1 } as Vec2;
            const mockItem = new Item();
            mockTerrainTile.item = mockItem;

            const mockIceTile = new IceTile();
            tileFactoryServiceSpy.createTile.and.returnValue(mockIceTile);

            service.convertTileToIce(mockTerrainTile);

            expect(tileFactoryServiceSpy.createTile).toHaveBeenCalledWith(TileType.Ice);
            expect(mockIceTile.coordinates).toEqual(mockTerrainTile.coordinates);
            expect(mockIceTile.item).toBe(mockItem);
            expect(gameMapDataManagerServiceSpy.setTileAt).toHaveBeenCalledWith(mockTerrainTile.coordinates, mockIceTile);
        });

        it('should not convert a non-terrain tile', () => {
            const mockNonTerrainTile = new Tile();
            mockNonTerrainTile.coordinates = { x: 1, y: 1 } as Vec2;

            service.convertTileToIce(mockNonTerrainTile);

            expect(tileFactoryServiceSpy.createTile).not.toHaveBeenCalled();
            expect(gameMapDataManagerServiceSpy.setTileAt).not.toHaveBeenCalled();
        });
    });

    describe('handleTileItem', () => {
        let mockPlayer: PlayerCharacter;
        let mockTile: TerrainTile;
        let mockItem: Item;

        beforeEach(() => {
            mockPlayer = new PlayerCharacter('player1');
            mockPlayer.inventory = [new EmptyItem(), new Chestplate(), new EmptyItem()];
            mockTile = new TerrainTile();
            mockTile.coordinates = { x: 1, y: 1 } as Vec2;
            mockItem = new DiamondSword();
            mockTile.item = mockItem;

            spyOn(service.signalUserGrabbedItem, 'next');
            spyOn(service.eventJournal, 'broadcastEvent');
        });

        it('should return false if tile is not terrain', () => {
            const nonTerrainTile = new WallTile();

            const result = service.handleTileItem(nonTerrainTile, mockPlayer, []);

            expect(result).toBeFalse();
        });

        it('should return true and emit signalUserGrabbedItem if item is grabbable and player has empty slot', () => {
            spyOn(mockItem, 'isGrabbable').and.returnValue(true);

            const result = service.handleTileItem(mockTile, mockPlayer, []);

            expect(result).toBeTrue();
            expect(service.signalUserGrabbedItem.next).toHaveBeenCalledWith({
                itemType: mockItem.type,
                tileCoordinates: mockTile.coordinates,
                playerTurnId: mockPlayer.socketId,
            });
            expect(service.eventJournal.broadcastEvent).toHaveBeenCalledWith(`${mockPlayer.name} a ramassé l'objet ${mockItem.type}`, [mockPlayer]);
        });

        it('should return true and add item to possibleItems if item is grabbable and player has no empty slot', () => {
            mockPlayer.inventory = [new DiamondSword(), new Chestplate(), new Totem()];
            spyOn(mockItem, 'isGrabbable').and.returnValue(true);

            const possibleItems: Item[] = [];
            const result = service.handleTileItem(mockTile, mockPlayer, possibleItems);

            expect(result).toBeTrue();
            expect(possibleItems).toContain(mockItem);
            expect(service.signalUserGrabbedItem.next).not.toHaveBeenCalled();
            expect(service.eventJournal.broadcastEvent).not.toHaveBeenCalled();
        });

        it('should return false if item is not grabbable', () => {
            spyOn(mockItem, 'isGrabbable').and.returnValue(false);

            const result = service.handleTileItem(mockTile, mockPlayer, []);

            expect(result).toBeFalse();
            expect(service.signalUserGrabbedItem.next).not.toHaveBeenCalled();
            expect(service.eventJournal.broadcastEvent).not.toHaveBeenCalled();
        });

        it('should return false if there is no item on the tile', () => {
            mockTile.item = null;

            const result = service.handleTileItem(mockTile, mockPlayer, []);

            expect(result).toBeFalse();
            expect(service.signalUserGrabbedItem.next).not.toHaveBeenCalled();
            expect(service.eventJournal.broadcastEvent).not.toHaveBeenCalled();
        });
    });

    describe('grabItem', () => {
        let mockPlayer: PlayerCharacter;
        let mockTile: GrassTile;
        let mockItem: Item;

        beforeEach(() => {
            mockPlayer = new PlayerCharacter('player1');
            mockPlayer.inventory = [new EmptyItem(), new Chestplate(), new EmptyItem()];
            mockTile = new GrassTile();
            mockTile.coordinates = { x: 1, y: 1 } as Vec2;
            mockItem = new DiamondSword();

            spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockPlayer);
            spyOn(service, 'addItemEffect');
            spyOn(service.itemFactoryService, 'createItem').and.callFake((type: ItemType) => {
                if (type === ItemType.EmptyItem) {
                    return new EmptyItem();
                }
                return mockItem;
            });
            gameMapDataManagerServiceSpy.getTileAt.and.returnValue(mockTile);
        });

        it('should do nothing if player is not found', () => {
            (service.findPlayerFromSocketId as jasmine.Spy).and.returnValue(null);

            service.grabItem('player1', ItemType.Sword, { x: 1, y: 1 });

            expect(service.addItemEffect).not.toHaveBeenCalled();
            expect(service.itemFactoryService.createItem).not.toHaveBeenCalled();
            expect(gameMapDataManagerServiceSpy.getTileAt).not.toHaveBeenCalled();
        });

        it('should add item to inventory, apply item effect, and remove item from tile if empty slot is found', () => {
            mockTile.item = mockItem;
            spyOn(mockTile, 'removeItem');
            service.grabItem('player1', ItemType.Sword, { x: 1, y: 1 });

            expect(service.itemFactoryService.createItem).toHaveBeenCalledWith(ItemType.Sword);
            expect(mockPlayer.inventory[0].type).toBe(ItemType.Sword);
            expect(service.addItemEffect).toHaveBeenCalledWith(mockPlayer, mockItem);
            expect(gameMapDataManagerServiceSpy.getTileAt).toHaveBeenCalledWith({ x: 1, y: 1 });
            expect(mockTile.removeItem).toHaveBeenCalled();
        });

        it('should not add item to inventory or apply item effect if no empty slot is found', () => {
            mockPlayer.inventory = [new DiamondSword(), new Chestplate(), new Totem()];

            service.grabItem('player1', ItemType.Sword, { x: 1, y: 1 });

            expect(service.itemFactoryService.createItem).not.toHaveBeenCalled();
            expect(service.addItemEffect).not.toHaveBeenCalled();
            expect(gameMapDataManagerServiceSpy.getTileAt).not.toHaveBeenCalled();
        });

        it('should not remove item from tile if tile is not terrain or item type does not match', () => {
            const wallTile = new WallTile();
            gameMapDataManagerServiceSpy.getTileAt.and.returnValue(wallTile);

            service.grabItem('player1', ItemType.Sword, { x: 1, y: 1 });

            expect(service.itemFactoryService.createItem).toHaveBeenCalledWith(ItemType.Sword);
            expect(mockPlayer.inventory[0].type).toBe(ItemType.Sword);
            expect(service.addItemEffect).toHaveBeenCalledWith(mockPlayer, mockItem);
        });
    });

    describe('throwItem', () => {
        let mockPlayer: PlayerCharacter;
        let mockTile: TerrainTile;
        let mockItem: Item;

        beforeEach(() => {
            mockPlayer = new PlayerCharacter('player1');
            mockPlayer.inventory = [new DiamondSword(), new Chestplate(), new EmptyItem()];
            mockTile = new TerrainTile();
            mockTile.coordinates = { x: 1, y: 1 } as Vec2;
            mockItem = new DiamondSword();

            spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockPlayer);
            spyOn(service, 'removeItemEffect');
            spyOn(service.itemFactoryService, 'createItem').and.callFake((type: ItemType) => {
                if (type === ItemType.EmptyItem) {
                    return new EmptyItem();
                }
                return mockItem;
            });
            gameMapDataManagerServiceSpy.getTileAt.and.returnValue(mockTile);
        });

        it('should do nothing if player is not found', () => {
            (service.findPlayerFromSocketId as jasmine.Spy).and.returnValue(null);

            service.throwItem('player1', ItemType.Sword, { x: 1, y: 1 });

            expect(service.removeItemEffect).not.toHaveBeenCalled();
            expect(service.itemFactoryService.createItem).not.toHaveBeenCalled();
            expect(gameMapDataManagerServiceSpy.getTileAt).not.toHaveBeenCalled();
        });

        it('should remove item effect, replace item with EmptyItem in inventory, and place item on tile if item is found in inventory', () => {
            service.throwItem('player1', ItemType.Sword, { x: 1, y: 1 });

            expect(service.itemFactoryService.createItem).toHaveBeenCalledWith(ItemType.EmptyItem);
            expect(mockPlayer.inventory[0].type).toBe(ItemType.EmptyItem);
            expect(gameMapDataManagerServiceSpy.getTileAt).toHaveBeenCalledWith({ x: 1, y: 1 });
            expect(mockTile.item?.type).toBe(ItemType.Sword);
        });

        it('should do nothing if item is not found in inventory', () => {
            service.throwItem('player1', ItemType.Totem, { x: 1, y: 1 });

            expect(service.removeItemEffect).not.toHaveBeenCalled();
            expect(service.itemFactoryService.createItem).not.toHaveBeenCalledWith(ItemType.EmptyItem);
            expect(gameMapDataManagerServiceSpy.getTileAt).not.toHaveBeenCalled();
        });

        it('should do nothing if tile is not terrain', () => {
            gameMapDataManagerServiceSpy.getTileAt.and.returnValue(new WallTile());

            service.throwItem('player1', ItemType.Sword, { x: 1, y: 1 });

            expect(service.itemFactoryService.createItem).toHaveBeenCalledWith(ItemType.EmptyItem);
            expect(mockPlayer.inventory[0].type).toBe(ItemType.EmptyItem);
            expect(gameMapDataManagerServiceSpy.getTileAt).toHaveBeenCalledWith({ x: 1, y: 1 });
            expect((gameMapDataManagerServiceSpy.getTileAt({ x: 1, y: 1 }) as TerrainTile).item).toBeUndefined();
        });
    });

    describe('userThrewItem', () => {
        let mockItem: Item;
        let mockTerrainTile: TerrainTile;

        beforeEach(() => {
            mockItem = new DiamondSword();
            mockTerrainTile = new TerrainTile();
            mockTerrainTile.coordinates = { x: 1, y: 1 } as Vec2;
            mockTerrainTile.type = TileType.Grass;

            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
            gameMapDataManagerServiceSpy.getTileAt.and.returnValue(mockTerrainTile);
            spyOn(service.signalUserThrewItem, 'next');
            spyOn(service.signalUserGrabbedItem, 'next');
            spyOn(service.eventJournal, 'broadcastEvent');
            spyOn(service, 'didPlayerTripped').and.returnValue(false);
            spyOn(service, 'checkIfPLayerDidEverything');
            spyOn(service, 'setupPossibleMoves');
        });

        it('should do nothing if currentPlayer is not found', () => {
            (service.getCurrentPlayerCharacter as jasmine.Spy).and.returnValue(null);

            service.userThrewItem(mockItem);

            expect(service.signalUserThrewItem.next).not.toHaveBeenCalled();
            expect(service.signalUserGrabbedItem.next).not.toHaveBeenCalled();
            expect(service.eventJournal.broadcastEvent).not.toHaveBeenCalled();
            expect(service.checkIfPLayerDidEverything).not.toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });

        it('should emit signalUserThrewItem and signalUserGrabbedItem if item is not the last item in possibleItems', () => {
            const grabbedItem = new Elytra();
            mockTerrainTile.item = grabbedItem;
            service.possibleItems = [new Chestplate(), mockItem, grabbedItem];

            service.userThrewItem(mockItem);

            expect(service.signalUserThrewItem.next).toHaveBeenCalledWith({
                itemType: mockItem.type,
                tileCoordinates: mockTerrainTile.coordinates,
                playerTurnId: mockPlayerCharacter.socketId,
            });
            expect(service.signalUserGrabbedItem.next).toHaveBeenCalledWith({
                itemType: grabbedItem.type,
                tileCoordinates: mockTerrainTile.coordinates,
                playerTurnId: mockPlayerCharacter.socketId,
            });
            expect(service.eventJournal.broadcastEvent).toHaveBeenCalledWith(`${mockPlayerCharacter.name} a ramassé l'objet ${grabbedItem.type}`, [
                mockPlayerCharacter,
            ]);
        });

        it('should not emit signalUserThrewItem if item is the last item in possibleItems', () => {
            service.possibleItems = [mockItem];

            service.userThrewItem(mockItem);

            expect(service.signalUserThrewItem.next).not.toHaveBeenCalled();
            expect(service.signalUserGrabbedItem.next).not.toHaveBeenCalled();
            expect(service.eventJournal.broadcastEvent).not.toHaveBeenCalled();
        });

        it('should clear possibleItems after processing', () => {
            service.possibleItems = [new Chestplate(), mockItem];

            service.userThrewItem(mockItem);

            expect(service.possibleItems.length).toBe(0);
        });

        it('should emit signalUserGotTurnEnded if player trips', () => {
            (service.didPlayerTripped as jasmine.Spy).and.returnValue(true);
            spyOn(service.signalUserGotTurnEnded, 'next');

            service.userThrewItem(mockItem);

            expect(service.signalUserGotTurnEnded.next).toHaveBeenCalledWith(mockPlayerCharacter.socketId);
            expect(service.checkIfPLayerDidEverything).not.toHaveBeenCalled();
            expect(service.setupPossibleMoves).not.toHaveBeenCalled();
        });

        it('should call checkIfPLayerDidEverything and setupPossibleMoves if player does not trip', () => {
            service.userThrewItem(mockItem);

            expect(service.checkIfPLayerDidEverything).toHaveBeenCalledWith(mockPlayerCharacter);
            expect(service.setupPossibleMoves).toHaveBeenCalledWith(mockPlayerCharacter);
        });
    });

    describe('addItemEffect', () => {
        it('should increase attack by 2 and decrease defense by 1 when item is Sword', () => {
            const mockPlayer = new PlayerCharacter('player1');
            mockPlayer.attributes = { attack: 5, defense: 3, speed: 2, life: 10 };
            const sword = new DiamondSword();

            service.addItemEffect(mockPlayer, sword);

            expect(mockPlayer.attributes.attack).toBe(7);
            expect(mockPlayer.attributes.defense).toBe(2);
        });

        it('should increase defense by 2 and decrease speed by 1 when item is Chestplate', () => {
            const mockPlayer = new PlayerCharacter('player1');
            mockPlayer.attributes = { attack: 5, defense: 3, speed: 2, life: 10 };
            const chestplate = new Chestplate();

            service.addItemEffect(mockPlayer, chestplate);

            expect(mockPlayer.attributes.defense).toBe(5);
            expect(mockPlayer.attributes.speed).toBe(1);
        });

        it('should decrease defense by 2 when item is Totem', () => {
            const mockPlayer = new PlayerCharacter('player1');
            mockPlayer.attributes = { attack: 5, defense: 3, speed: 2, life: 10 };
            const totem = new Totem();

            service.addItemEffect(mockPlayer, totem);

            expect(mockPlayer.attributes.defense).toBe(1);
        });

        it('should increase speed by 1 when item is Elytra', () => {
            const mockPlayer = new PlayerCharacter('player1');
            mockPlayer.attributes = { attack: 5, defense: 3, speed: 2, life: 10 };
            const elytra = new Elytra();

            service.addItemEffect(mockPlayer, elytra);

            expect(mockPlayer.attributes.speed).toBe(3);
        });

        it('should not change attributes when item type is not recognized', () => {
            const mockPlayer = new PlayerCharacter('player1');
            mockPlayer.attributes = { attack: 5, defense: 3, speed: 2, life: 10 };
            const unknownItem = new EmptyItem();

            service.addItemEffect(mockPlayer, unknownItem);

            expect(mockPlayer.attributes.attack).toBe(5);
            expect(mockPlayer.attributes.defense).toBe(3);
            expect(mockPlayer.attributes.speed).toBe(2);
        });
    });

    describe('removeItemEffect', () => {
        it('should decrease attack by 2 and increase defense by 1 when item is Sword', () => {
            const mockPlayer = new PlayerCharacter('player1');
            mockPlayer.attributes = { attack: 5, defense: 3, speed: 2, life: 10 };
            const sword = new DiamondSword();

            service.removeItemEffect(mockPlayer, sword);

            expect(mockPlayer.attributes.attack).toBe(3);
            expect(mockPlayer.attributes.defense).toBe(4);
        });

        it('should decrease defense by 2 and increase speed by 1 when item is Chestplate', () => {
            const mockPlayer = new PlayerCharacter('player1');
            mockPlayer.attributes = { attack: 5, defense: 3, speed: 2, life: 10 };
            const chestplate = new Chestplate();

            service.removeItemEffect(mockPlayer, chestplate);

            expect(mockPlayer.attributes.defense).toBe(1);
            expect(mockPlayer.attributes.speed).toBe(3);
        });

        it('should increase defense by 2 when item is Totem', () => {
            const mockPlayer = new PlayerCharacter('player1');
            mockPlayer.attributes = { attack: 5, defense: 3, speed: 2, life: 10 };
            const totem = new Totem();

            service.removeItemEffect(mockPlayer, totem);

            expect(mockPlayer.attributes.defense).toBe(5);
        });

        it('should decrease speed by 1 when item is Elytra', () => {
            const mockPlayer = new PlayerCharacter('player1');
            mockPlayer.attributes = { attack: 5, defense: 3, speed: 2, life: 10 };
            const elytra = new Elytra();

            service.removeItemEffect(mockPlayer, elytra);

            expect(mockPlayer.attributes.speed).toBe(1);
        });

        it('should not change attributes when item type is not recognized', () => {
            const mockPlayer = new PlayerCharacter('player1');
            mockPlayer.attributes = { attack: 5, defense: 3, speed: 2, life: 10 };
            const unknownItem = new EmptyItem();

            service.removeItemEffect(mockPlayer, unknownItem);

            expect(mockPlayer.attributes.attack).toBe(5);
            expect(mockPlayer.attributes.defense).toBe(3);
            expect(mockPlayer.attributes.speed).toBe(2);
        });
    });

    describe('didPlayerTripped', () => {
        it('should return false if player has Elytra item', () => {
            spyOn(service, 'doesPlayerHaveItem').and.returnValue(true);

            const result = service.didPlayerTripped(TileType.Ice, mockPlayerCharacter);

            expect(service.doesPlayerHaveItem).toHaveBeenCalledWith(mockPlayerCharacter, ItemType.Elytra);
            expect(result).toBeFalse();
        });

        it('should return false if debug mode is enabled', () => {
            spyOn(service, 'doesPlayerHaveItem').and.returnValue(false);
            service.debugService.isDebugMode = true;

            const result = service.didPlayerTripped(TileType.Ice, mockPlayerCharacter);

            expect(result).toBeFalse();
        });

        it('should return true if tile type is Ice and random value is less than ICE_FALL_POSSIBILTY', () => {
            spyOn(service, 'doesPlayerHaveItem').and.returnValue(false);
            service.debugService.isDebugMode = false;
            spyOn(Math, 'random').and.returnValue(0.05);
            spyOn(service.eventJournal, 'broadcastEvent');

            const result = service.didPlayerTripped(TileType.Ice, mockPlayerCharacter);

            expect(service.eventJournal.broadcastEvent).toHaveBeenCalledWith('glissement', [service.eventJournal.player]);
            expect(result).toBeTrue();
        });

        it('should return false if tile type is Ice and random value is greater than or equal to ICE_FALL_POSSIBILTY', () => {
            spyOn(service, 'doesPlayerHaveItem').and.returnValue(false);
            service.debugService.isDebugMode = false;
            spyOn(Math, 'random').and.returnValue(0.2);

            const result = service.didPlayerTripped(TileType.Ice, mockPlayerCharacter);

            expect(result).toBeFalse();
        });

        it('should return false if tile type is not Ice', () => {
            spyOn(service, 'doesPlayerHaveItem').and.returnValue(false);
            service.debugService.isDebugMode = false;

            const result = service.didPlayerTripped(TileType.Grass, mockPlayerCharacter);

            expect(result).toBeFalse();
        });
    });

    describe('waitInterval', () => {
        beforeEach(() => {
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
        it('should handle battle action when user has action points and it is user’s turn', () => {
            const mockTile = new WalkableTile();
            const mockActionPlayer = new PlayerCharacter('player1');
            mockActionPlayer.socketId = 'player1';
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

        it('should handle door action when user has action points and it is user’s turn', () => {
            const mockTile = new DoorTile();
            const mockActionPlayer = new PlayerCharacter('player1');
            mockActionPlayer.socketId = 'player1';
            mockActionPlayer.currentActionPoints = 1;
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockActionPlayer);
            spyOn(service.signalUserDidDoorAction, 'next');
            spyOn(service, 'hidePossibleMoves');
            spyOn(service, 'checkIfPLayerDidEverything').and.callFake(() => {});

            service.isUserTurn = true;

            service.handlePlayerAction(mockTile);

            expect(service.signalUserDidDoorAction.next).toHaveBeenCalledWith({ tileCoordinate: mockTile.coordinates, playerTurnId: 'player1' });
            expect(service.hidePossibleMoves).toHaveBeenCalled();
            expect(service.checkIfPLayerDidEverything).toHaveBeenCalledWith(mockActionPlayer);
        });

        it('should not handle action if user does not have action points', () => {
            const mockTile = new WalkableTile();
            const mockActionPlayer = new PlayerCharacter('player1');
            mockActionPlayer.socketId = 'player1';
            mockActionPlayer.currentActionPoints = 0;
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockActionPlayer);
            spyOn(service.signalUserDidDoorAction, 'next');
            spyOn(service, 'hidePossibleMoves');

            service.isUserTurn = true;

            service.handlePlayerAction(mockTile);

            expect(service.signalUserDidDoorAction.next).not.toHaveBeenCalled();
            expect(service.hidePossibleMoves).not.toHaveBeenCalled();
        });
    });

    describe('checkIfPLayerDidEverything', () => {
        beforeEach(() => {
            const mockTile = new Tile();
            gameMapDataManagerServiceSpy.getTileAt.and.returnValue(mockTile);
        });

        it('should emit signalUserGotTurnEnded if no move points and no action points are available', () => {
            mockPlayerCharacter.currentMovePoints = 0;
            mockPlayerCharacter.currentActionPoints = 0;
            spyOn(service.signalUserGotTurnEnded, 'next');

            service.checkIfPLayerDidEverything(mockPlayerCharacter);

            expect(service.signalUserGotTurnEnded.next).toHaveBeenCalledWith(mockPlayerCharacter.socketId);
        });

        it('should emit signalUserGotTurnEnded if no move points and no adjacent action tiles are available', () => {
            mockPlayerCharacter.currentMovePoints = 0;
            mockPlayerCharacter.currentActionPoints = 1;

            const mockTile = new Tile();
            spyOn(service, 'getPlayerTile').and.returnValue(mockTile);
            spyOn(service, 'getAdjacentActionTiles').and.returnValue([]);
            spyOn(service.signalUserGotTurnEnded, 'next');

            service.checkIfPLayerDidEverything(mockPlayerCharacter);

            expect(service.signalUserGotTurnEnded.next).toHaveBeenCalledWith(mockPlayerCharacter.socketId);
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
        beforeEach(() => {
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
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
                newTile.coordinates = tileCoordinate;
                return newTile;
            });

            service.isUserTurn = true;
            spyOn(service, 'setupPossibleMoves').and.callFake(() => {});
            gameMapDataManagerServiceSpy.getTileAt.and.returnValue(mockDoorTile);

            service.toggleDoor(tileCoordinate);

            expect(tileFactoryServiceSpy.createTile).toHaveBeenCalledWith(TileType.OpenDoor);
            expect(gameMapDataManagerServiceSpy.setTileAt).toHaveBeenCalledWith(
                tileCoordinate,
                jasmine.objectContaining({ type: TileType.OpenDoor, coordinates: tileCoordinate }),
            );
            expect(service.setupPossibleMoves).toHaveBeenCalledWith(mockPlayerCharacter);
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

        it('should set areOtherPlayersInBattle to true if currentPlayer is not one of them', () => {
            const playerId = 'player10';
            const enemyPlayerId = 'player20';
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);

            service.startBattle(playerId, enemyPlayerId);

            expect(service.areOtherPlayersInBattle).toBeTrue();
            expect(battleManagerServiceSpy.init).not.toHaveBeenCalled();
        });

        it('should return if currentPlayer is not found', () => {
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(null);

            service.startBattle('player1', 'player2');

            expect(battleManagerServiceSpy.init).not.toHaveBeenCalled();
        });
    });

    describe('playerUsedAction', () => {
        it('should decrement player action points', () => {
            mockPlayerCharacter.currentActionPoints = 1;
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockPlayerCharacter);

            service.playerUsedAction(mockPlayerCharacter.socketId);

            expect(mockPlayerCharacter.currentActionPoints).toBe(0);
        });

        it('should not decrement player action points if player is not found', () => {
            mockPlayerCharacter.currentActionPoints = 1;
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(null);

            service.playerUsedAction(mockPlayerCharacter.socketId);

            expect(mockPlayerCharacter.currentActionPoints).toBe(1);
        });
    });

    describe('continueTurn', () => {
        beforeEach(() => {
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

    describe('userDropAllItems', () => {
        it('should call trowItem for each item in the player inventory that is not emptyItem', () => {
            const startTile = new GrassTile();
            startTile.coordinates = { x: 1, y: 1 };
            mockPlayerCharacter.inventory = [new DiamondSword(), new Chestplate(), new EmptyItem()];

            gameMapDataManagerServiceSpy.getClosestTerrainTileWithoutItemAt.and.returnValue(startTile);
            spyOn(service, 'throwItem').and.callFake(() => {});

            service.userDropAllItems(startTile, mockPlayerCharacter);

            expect(service.throwItem).toHaveBeenCalledTimes(2);
        });
    });

    describe('checkIfPlayerWonClassicGame', () => {
        beforeEach(() => {
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

        it('should not emit signalUserWon if is CTF mode', () => {
            const mockPlayerCharacter = new PlayerCharacter('player1');
            mockPlayerCharacter.fightWins = 3;

            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
            spyOn(service.signalUserWon, 'next');
            gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(true);

            service.checkIfPlayerWonClassicGame(mockPlayerCharacter);

            expect(service.signalUserWon.next).not.toHaveBeenCalled();
        });
    });

    describe('checkIfPlayerWonCTFGame', () => {
        it('should emit signalUserWon if playerCharacter is current player and has captured the flag and is on spawn', () => {
            gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(true);
            spyOn(mockPlayerCharacter.mapEntity, 'isOnSpawn').and.returnValue(true);
            spyOn(service, 'doesPlayerHaveItem').and.returnValue(true);
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
            spyOn(service.signalUserWon, 'next');

            service.checkIfPlayerWonCTFGame(mockPlayerCharacter);

            expect(service.signalUserWon.next).toHaveBeenCalledWith(mockPlayerCharacter.socketId);
        });

        it('should not emit signalUserWon if playerCharacter is not on spawn', () => {
            gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(true);
            spyOn(mockPlayerCharacter.mapEntity, 'isOnSpawn').and.returnValue(false);
            spyOn(service, 'doesPlayerHaveItem').and.returnValue(true);
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
            spyOn(service.signalUserWon, 'next');

            service.checkIfPlayerWonCTFGame(mockPlayerCharacter);

            expect(service.signalUserWon.next).not.toHaveBeenCalled();
        });

        it('should not emit signalUserWon if playerCharacter does not have the flag', () => {
            gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(true);
            spyOn(mockPlayerCharacter.mapEntity, 'isOnSpawn').and.returnValue(true);
            spyOn(service, 'doesPlayerHaveItem').and.returnValue(false);
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
            spyOn(service.signalUserWon, 'next');

            service.checkIfPlayerWonCTFGame(mockPlayerCharacter);

            expect(service.signalUserWon.next).not.toHaveBeenCalled();
        });

        it('should not emit signalUserWon if playerCharacter is not the current player', () => {
            gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(true);
            spyOn(mockPlayerCharacter.mapEntity, 'isOnSpawn').and.returnValue(true);
            spyOn(service, 'doesPlayerHaveItem').and.returnValue(true);
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(new PlayerCharacter('anotherPlayer'));
            spyOn(service.signalUserWon, 'next');

            service.checkIfPlayerWonCTFGame(mockPlayerCharacter);

            expect(service.signalUserWon.next).not.toHaveBeenCalled();
        });

        it('should not emit signalUserWon if is not CTF mode', () => {
            gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(false);
            spyOn(mockPlayerCharacter.mapEntity, 'isOnSpawn').and.returnValue(true);
            spyOn(service, 'doesPlayerHaveItem').and.returnValue(true);
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
            spyOn(service.signalUserWon, 'next');

            service.checkIfPlayerWonCTFGame(mockPlayerCharacter);

            expect(service.signalUserWon.next).not.toHaveBeenCalled();
        });
    });

    describe('endGame', () => {
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
            gameMapDataManagerServiceSpy.getTileAt.and.returnValue(null);
            const result = service.getPlayerTile(mockPlayerCharacter);

            expect(gameMapDataManagerServiceSpy.getTileAt).toHaveBeenCalledWith(mockPlayerCharacter.mapEntity.coordinates);
            expect(result).toBeNull();
        });
    });

    describe('getAdjacentActionTiles', () => {
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

    describe('canPlayerDoAction', () => {
        it('should return true if player exists and has adjacent actions tiles', () => {
            const playerTile = new GrassTile();
            spyOn(service, 'getPlayerTile').and.returnValue(playerTile);
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
            spyOn(service, 'getAdjacentActionTiles').and.returnValue([new Tile()]);

            const result = service.canPlayerDoAction();

            expect(result).toBeTrue();
        });

        it('should return false if player exists but has no adjacent action tiles', () => {
            const playerTile = new GrassTile();
            spyOn(service, 'getPlayerTile').and.returnValue(playerTile);
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);
            spyOn(service, 'getAdjacentActionTiles').and.returnValue([]);

            const result = service.canPlayerDoAction();

            expect(result).toBeFalse();
        });

        it('should return false if playerTile does not exists', () => {
            spyOn(service, 'getPlayerTile').and.returnValue(null);
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(mockPlayerCharacter);

            const result = service.canPlayerDoAction();

            expect(result).toBeFalse();
        });

        it('should return false if player does not exists', () => {
            spyOn(service, 'getPlayerTile').and.returnValue(new GrassTile());
            spyOn(service, 'getCurrentPlayerCharacter').and.returnValue(null);

            const result = service.canPlayerDoAction();

            expect(result).toBeFalse();
        });
    });

    describe('findPlayerFromPlayerMapEntity', () => {
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
        it('should return the current player character if a matching player is found', () => {
            const mockPlayer = new PlayerCharacter('player1');
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(mockPlayer);

            const result = service.getCurrentPlayerCharacter();

            expect(service.findPlayerFromSocketId).toHaveBeenCalledWith('userSocketId');
            expect(result).toBe(mockPlayer);
        });

        it('should return null if no matching player is found', () => {
            spyOn(service, 'findPlayerFromSocketId').and.returnValue(null);

            const result = service.getCurrentPlayerCharacter();

            expect(service.findPlayerFromSocketId).toHaveBeenCalledWith('userSocketId');
            expect(result).toBeNull();
        });
    });

    describe('resetManager', () => {
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
