// this is a test file for the virtual player manager service, which is a service that manages the virtual players in the game, so it is a very long ts file and its test file is expected to be very long
/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager/game-map-data-manager.service';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager/play-game-board-manager.service';
import { WebSocketService } from '@app/services/socket-service/websocket-service/websocket.service';
import { EmptyItem } from '@common/classes/Items/empty-item';
import { Item } from '@common/classes/Items/item';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { PlayerMapEntity } from '@common/classes/Player/player-map-entity';
import { DoorTile } from '@common/classes/Tiles/door-tile';
import { OpenDoor } from '@common/classes/Tiles/open-door';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';
import { ItemType } from '@common/enums/item-type';
import { ProfileEnum } from '@common/enums/profile';
import { TileType } from '@common/enums/tile-type';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject } from 'rxjs';
import { VirtualPlayerManagerService } from './virtual-player-manager.service';

describe('VirtualPlayerManagerService', () => {
    let service: VirtualPlayerManagerService;
    let mockPlayGameBoardManagerService: jasmine.SpyObj<PlayGameBoardManagerService>;
    let mockGameMapDataManagerService: jasmine.SpyObj<GameMapDataManagerService>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;

    beforeEach(() => {
        mockPlayGameBoardManagerService = jasmine.createSpyObj(
            'PlayGameBoardManagerService',
            [
                'findPlayerFromSocketId',
                'getAdjacentActionTiles',
                'signalUserDidBattleAction',
                'signalUserDidDoorAction',
                'checkIfPLayerDidEverything',
                'signalUserStartedMoving',
                'findPlayerFromPlayerMapEntity',
                'doesPlayerHaveItem',
            ],
            {
                signalUserDidBattleAction: jasmine.createSpyObj('signalUserDidBattleAction', ['next']),
                signalUserDidDoorAction: jasmine.createSpyObj('signalUserDidDoorAction', ['next']),
            },
        );

        mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', [
            'getPossibleMovementTiles',
            'getTileAt',
            'getNeighbours',
            'isGameModeCTF',
            'getClosestWalkableTileWithoutPlayerAt',
        ]);

        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['getRoomInfo']);

        TestBed.configureTestingModule({
            providers: [
                VirtualPlayerManagerService,
                { provide: PlayGameBoardManagerService, useValue: mockPlayGameBoardManagerService },
                { provide: GameMapDataManagerService, useValue: mockGameMapDataManagerService },
                { provide: WebSocketService, useValue: mockWebSocketService },
            ],
        });

        service = TestBed.inject(VirtualPlayerManagerService);
    });
    describe('startTurn', () => {
        beforeEach(() => {
            spyOn(service, 'setPossibleMoves');
            spyOn(service, 'handleVirtualPlayerTurn');
            spyOn(service, 'handleAgressiveComportment');
            spyOn(service, 'handleDefensiveComportment');
        });
        it('should call handleVirtualPlayerTurn if a virtual player is found', () => {
            const socketId = 'player123';
            const mockPlayer: PlayerCharacter = { socketId } as PlayerCharacter;
            mockPlayGameBoardManagerService.findPlayerFromSocketId.and.returnValue(mockPlayer);

            service.startTurn('player123');

            expect(mockPlayGameBoardManagerService.findPlayerFromSocketId).toHaveBeenCalledWith('player123');
            expect(service.handleVirtualPlayerTurn).toHaveBeenCalledWith(mockPlayer, true);
        });

        it('should not call handleVirtualPlayerTurn if no virtual player is found', () => {
            mockPlayGameBoardManagerService.findPlayerFromSocketId.and.returnValue(null);

            service.startTurn('player123');

            expect(mockPlayGameBoardManagerService.findPlayerFromSocketId).toHaveBeenCalledWith('player123');
            expect(service.handleVirtualPlayerTurn).not.toHaveBeenCalled();
        });
    });
    describe('continueTurn', () => {
        it('should call handleVirtualPlayerTurn with false if a virtual player is found', () => {
            const socketId = 'player123';
            const mockPlayer: PlayerCharacter = { socketId } as PlayerCharacter;
            mockPlayGameBoardManagerService.findPlayerFromSocketId.and.returnValue(mockPlayer);
            spyOn(service, 'handleVirtualPlayerTurn');

            service.continueTurn('player123');

            expect(mockPlayGameBoardManagerService.findPlayerFromSocketId).toHaveBeenCalledWith('player123');
            expect(service.handleVirtualPlayerTurn).toHaveBeenCalledWith(mockPlayer, false);
        });

        it('should not call handleVirtualPlayerTurn if no virtual player is found', () => {
            mockPlayGameBoardManagerService.findPlayerFromSocketId.and.returnValue(null);
            spyOn(service, 'handleVirtualPlayerTurn');

            service.continueTurn('player123');

            expect(mockPlayGameBoardManagerService.findPlayerFromSocketId).toHaveBeenCalledWith('player123');
            expect(service.handleVirtualPlayerTurn).not.toHaveBeenCalled();
        });
    });
    describe('setPossibleMoves', () => {
        const POSSIBLE_MOVES = 5;
        it('should call getPossibleMovementTiles with the correct arguments and return the result', () => {
            const mockPlayerEntity = new PlayerMapEntity('avatar.png');
            const mockPlayer = {
                socketId: 'player1',
                mapEntity: mockPlayerEntity,
                currentMovePoints: 3,
            } as PlayerCharacter;

            mockPlayerEntity.coordinates = { x: 0, y: 0 } as Vec2;

            const mockPossibleMoves = new Map<Tile, Tile[]>();

            mockGameMapDataManagerService.getPossibleMovementTiles.and.returnValue(mockPossibleMoves);

            const result = service.setPossibleMoves(mockPlayer);

            expect(mockGameMapDataManagerService.getPossibleMovementTiles).toHaveBeenCalledWith(
                mockPlayerEntity.coordinates,
                mockPlayer.currentMovePoints,
            );
            expect(result).toBe(mockPossibleMoves);
        });

        it('should handle player with no move points', () => {
            const mockPlayerEntity = new PlayerMapEntity('avatar.png');
            const mockPlayer = {
                socketId: 'player1',
                mapEntity: mockPlayerEntity,
                currentMovePoints: 0,
            } as PlayerCharacter;

            mockPlayerEntity.coordinates = { x: 0, y: 0 } as Vec2;

            const mockPossibleMoves = new Map<Tile, Tile[]>();
            mockGameMapDataManagerService.getPossibleMovementTiles.and.returnValue(mockPossibleMoves);

            const result = service.setPossibleMoves(mockPlayer);

            expect(mockGameMapDataManagerService.getPossibleMovementTiles).toHaveBeenCalledWith(mockPlayerEntity.coordinates, 0);
            expect(result).toBe(mockPossibleMoves);
        });

        it('should handle player at different coordinates', () => {
            const mockPlayerEntity = new PlayerMapEntity('avatar.png');
            const mockPlayer = {
                socketId: 'player1',
                mapEntity: mockPlayerEntity,
                currentMovePoints: 5,
            } as PlayerCharacter;

            mockPlayerEntity.coordinates = { x: 3, y: 4 } as Vec2;

            const mockPossibleMoves = new Map<Tile, Tile[]>();
            mockGameMapDataManagerService.getPossibleMovementTiles.and.returnValue(mockPossibleMoves);

            const result = service.setPossibleMoves(mockPlayer);

            expect(mockGameMapDataManagerService.getPossibleMovementTiles).toHaveBeenCalledWith({ x: 3, y: 4 }, POSSIBLE_MOVES);
            expect(result).toBe(mockPossibleMoves);
        });

        it('should return empty map when getPossibleMovementTiles returns empty', () => {
            const mockPlayerEntity = new PlayerMapEntity('avatar.png');
            const mockPlayer = {
                socketId: 'player1',
                mapEntity: mockPlayerEntity,
                currentMovePoints: 1,
            } as PlayerCharacter;

            mockPlayerEntity.coordinates = { x: 0, y: 0 } as Vec2;

            const emptyMap = new Map<Tile, Tile[]>();
            mockGameMapDataManagerService.getPossibleMovementTiles.and.returnValue(emptyMap);

            const result = service.setPossibleMoves(mockPlayer);

            expect(result).toEqual(new Map<Tile, Tile[]>());
            expect(result.size).toBe(0);
        });
    });

    describe('handleVirtualPlayerTurn', () => {
        beforeEach(() => {
            spyOn(service, 'handleAgressiveComportment').and.stub();
            spyOn(service, 'handleDefensiveComportment').and.stub();
        });

        it('should do nothing if the player is not virtual', () => {
            const mockPlayer: PlayerCharacter = {
                isVirtual: true,
                comportement: null,
            } as PlayerCharacter;
            mockPlayer.isVirtual = false;

            service.handleVirtualPlayerTurn(mockPlayer, true);

            expect(service.handleAgressiveComportment).not.toHaveBeenCalled();
            expect(service.handleDefensiveComportment).not.toHaveBeenCalled();
        });

        it('should call handleAgressiveComportment for aggressive players', () => {
            const mockPlayer: PlayerCharacter = {
                isVirtual: true,
                comportement: null,
            } as PlayerCharacter;
            mockPlayer.comportement = ProfileEnum.Agressive;

            service.handleVirtualPlayerTurn(mockPlayer, true);

            expect(service.handleAgressiveComportment).toHaveBeenCalledWith(mockPlayer, true);
            expect(service.handleDefensiveComportment).not.toHaveBeenCalled();
        });

        it('should call handleDefensiveComportment for defensive players', () => {
            const mockPlayer: PlayerCharacter = {
                isVirtual: true,
                comportement: null,
            } as PlayerCharacter;
            mockPlayer.comportement = ProfileEnum.Defensive;

            service.handleVirtualPlayerTurn(mockPlayer, true);

            expect(service.handleDefensiveComportment).toHaveBeenCalledWith(mockPlayer, true);
            expect(service.handleAgressiveComportment).not.toHaveBeenCalled();
        });

        it('should do nothing for players with unrecognized profiles', () => {
            const mockPlayer: PlayerCharacter = {
                isVirtual: true,
                comportement: null,
            } as PlayerCharacter;
            mockPlayer.comportement = null;

            service.handleVirtualPlayerTurn(mockPlayer, true);

            expect(service.handleAgressiveComportment).not.toHaveBeenCalled();
            expect(service.handleDefensiveComportment).not.toHaveBeenCalled();
        });
    });

    describe('handleAgressiveComportment', () => {
        let mockPlayer: jasmine.SpyObj<PlayerCharacter>;

        beforeEach(() => {
            service = TestBed.inject(VirtualPlayerManagerService);
            mockPlayer = jasmine.createSpyObj('PlayerCharacter', ['someMethodIfNeeded']);

            spyOn(service, 'handleAggressiveMovement');
        });

        it('should call handleAggressiveActions and not call handleAggressiveMovement if action is taken', () => {
            spyOn(service, 'handleAggressiveActions').and.returnValue(true);

            service.handleAgressiveComportment(mockPlayer, true);

            expect(service.handleAggressiveActions).toHaveBeenCalledWith(mockPlayer);
            expect(service.handleAggressiveMovement).not.toHaveBeenCalled();
        });

        it('should call handleAggressiveActions and then handleAggressiveMovement if no action is taken', () => {
            spyOn(service, 'handleAggressiveActions').and.returnValue(false);

            service.handleAgressiveComportment(mockPlayer, false);

            expect(service.handleAggressiveActions).toHaveBeenCalledWith(mockPlayer);
            expect(service.handleAggressiveMovement).toHaveBeenCalledWith(mockPlayer, false);
        });
    });

    describe('handleAggressiveActions', () => {
        let mockPlayer: jasmine.SpyObj<PlayerCharacter>;

        beforeEach(() => {
            mockPlayer = jasmine.createSpyObj('PlayerCharacter', ['socketId', 'mapEntity', 'currentActionPoints']);
            mockPlayer.currentActionPoints = 10;
        });

        it('should return false if player has no action points', () => {
            mockPlayer.currentActionPoints = 0;

            const result = service.handleAggressiveActions(mockPlayer);

            expect(result).toBeFalse();
        });

        it('should emit battle action and return true for an enemy player on an adjacent tile', () => {
            const mockTile = new WalkableTile();
            mockTile.type = TileType.Grass;
            mockTile.description = 'Mock Walkable Tile';
            mockTile.imageUrl = 'mock-url';
            mockTile.coordinates = { x: 0, y: 0 };
            mockTile.player = new PlayerMapEntity('avatar.png');
            mockTile.player.description = 'enemy123';

            const enemyPlayer = {
                socketId: 'enemy123',
                mapEntity: mockTile.player,
            } as PlayerCharacter;

            mockGameMapDataManagerService.getTileAt.and.returnValue(mockTile);
            mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([mockTile]);
            mockPlayGameBoardManagerService.findPlayerFromPlayerMapEntity.and.returnValue(enemyPlayer);

            const result = service.handleAggressiveActions(mockPlayer);

            expect(result).toBeTrue();
            expect(mockPlayGameBoardManagerService.signalUserDidBattleAction.next).toHaveBeenCalledWith({
                playerTurnId: mockPlayer.socketId,
                enemyPlayerId: enemyPlayer.socketId,
            });
        });

        it('should emit door action if adjacent tile is a door tile', () => {
            const mockDoorTile = new DoorTile();
            mockDoorTile.type = TileType.Door;
            mockDoorTile.description = 'Mock Door Tile';
            mockDoorTile.imageUrl = 'mock-door-url';
            mockDoorTile.coordinates = { x: 0, y: 0 } as Vec2;

            mockGameMapDataManagerService.getTileAt.and.returnValue(mockDoorTile);
            mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([mockDoorTile]);

            const result = service.handleAggressiveActions(mockPlayer);

            expect(result).toBeTrue();
            expect(mockPlayGameBoardManagerService.signalUserDidDoorAction.next).toHaveBeenCalledWith({
                tileCoordinate: mockDoorTile.coordinates,
                playerTurnId: mockPlayer.socketId,
            });
        });

        it('should return false if no valid actions are performed', () => {
            const mockTile = new WalkableTile();
            mockTile.type = TileType.Grass;
            mockTile.description = 'Mock Walkable Tile';
            mockTile.imageUrl = 'mock-tile-url';
            mockTile.coordinates = { x: 0, y: 0 };
            mockTile.player = null;
            mockTile.moveCost = 1;

            mockGameMapDataManagerService.getTileAt.and.returnValue(mockTile);
            mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([mockTile]);

            const result = service.handleAggressiveActions(mockPlayer);

            expect(result).toBeFalse();
        });
    });

    describe('handleAggressiveMovement', () => {
        let mockPlayerEntity: PlayerMapEntity;
        let mockPlayer: PlayerCharacter;

        beforeEach(() => {
            service = TestBed.inject(VirtualPlayerManagerService);

            mockWebSocketService.getRoomInfo.and.returnValue({
                players: [],
                id: '',
                accessCode: 0,
                isLocked: false,
                maxPlayers: 0,
                currentPlayerTurn: '',
                organizer: '',
            });

            mockPlayerEntity = { coordinates: { x: 0, y: 0 } as Vec2 } as PlayerMapEntity;
            mockPlayer = {
                socketId: 'player123',
                mapEntity: mockPlayerEntity,
            } as PlayerCharacter;

            mockPlayGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', ['getAdjacentActionTiles'], {
                signalUserStartedMoving: jasmine.createSpyObj('Subject', ['next']),
            });
            const signalMoveVirtualPlayerSubject = jasmine.createSpyObj('Subject', ['next']);
            const signalVirtualPlayerEndedTurnSubject = jasmine.createSpyObj('Subject', ['next']);

            const signalUserStartedMovingSubject = new Subject<string>();
            spyOn(signalUserStartedMovingSubject, 'next');

            service.signalMoveVirtualPlayer = signalMoveVirtualPlayerSubject;
            service.signalVirtualPlayerEndedTurn = signalVirtualPlayerEndedTurnSubject;
            spyOn(service, 'handleAggressiveMovement').and.callThrough();

            Object.defineProperty(mockPlayGameBoardManagerService, 'signalUserStartedMoving', {
                value: signalUserStartedMovingSubject,
                writable: true,
            });

            service.playGameBoardManagerService = mockPlayGameBoardManagerService;
        });

        it('should end the turn if no targets are found and turn has not started', () => {
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };

            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([]);

            spyOn(service, 'findNearestPossiblePlayer').and.returnValue(null);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(null);
            spyOn(service, 'findNearestClosedDoor').and.returnValue(null);

            const possibleMoves = new Map<Tile, Tile[]>();
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            service.handleAggressiveMovement(mockPlayer, false);

            expect(service.signalVirtualPlayerEndedTurn.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).not.toHaveBeenCalled();
        });

        it('should signal virtual player movement with correct coordinates', () => {
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };
            currentTile.player = mockPlayerEntity;

            const targetTile = new WalkableTile();
            targetTile.coordinates = { x: 1, y: 1 };

            mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', [
                'getTileAt',
                'getAdjacentActionTiles',
                'getNeighbours',
            ]);
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            service.gameMapDataManagerService = mockGameMapDataManagerService;

            const signalUserStartedMovingSubject = new Subject<string>();
            spyOn(signalUserStartedMovingSubject, 'next');

            mockPlayGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', ['getAdjacentActionTiles'], {
                signalUserStartedMoving: signalUserStartedMovingSubject,
            });
            service.playGameBoardManagerService = mockPlayGameBoardManagerService;

            service.signalMoveVirtualPlayer = jasmine.createSpyObj('Subject', ['next']);
            service.signalVirtualPlayerEndedTurn = jasmine.createSpyObj('Subject', ['next']);

            spyOn(service, 'findNearestPossiblePlayer').and.returnValue(targetTile);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(null);
            spyOn(service, 'findNearestClosedDoor').and.returnValue(null);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(targetTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            service.handleAggressiveMovement(mockPlayer, true);

            expect(mockGameMapDataManagerService.getTileAt).toHaveBeenCalledWith(mockPlayerEntity.coordinates);
            expect(service.playGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 1, y: 1 },
                virtualPlayerId: 'player123',
            });
        });

        it('should move towards the nearest player if found', () => {
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };
            currentTile.player = mockPlayerEntity;

            const targetTile = new WalkableTile();
            targetTile.coordinates = { x: 2, y: 2 };

            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            spyOn(service, 'findNearestPossiblePlayer').and.returnValue(targetTile);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(null);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(targetTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            service.handleAggressiveMovement(mockPlayer, true);

            expect(mockPlayGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 2, y: 2 },
                virtualPlayerId: 'player123',
            });
        });
        it('should move towards the nearest item if no player is found but an item is found', () => {
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };
            currentTile.player = mockPlayerEntity;
            currentTile.type = TileType.Grass;

            const mockTargetTile = new TerrainTile();
            mockTargetTile.coordinates = { x: 3, y: 3 };
            mockTargetTile.type = TileType.Grass;
            mockTargetTile.description = 'Mock Target Tile';
            mockTargetTile.imageUrl = 'mock-url';
            mockTargetTile.item = { type: ItemType.Sword, isGrabbable: () => true } as Item;

            mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', [
                'getTileAt',
                'getAdjacentActionTiles',
                'getNeighbours',
            ]);
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);

            mockPlayGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', ['getAdjacentActionTiles'], {
                signalUserStartedMoving: jasmine.createSpyObj('Subject', ['next']),
            });

            service.gameMapDataManagerService = mockGameMapDataManagerService;
            service.playGameBoardManagerService = mockPlayGameBoardManagerService;

            spyOn(service, 'findNearestPossiblePlayer').and.returnValue(null);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(mockTargetTile);
            spyOn(service, 'findNearestClosedDoor').and.returnValue(null);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(mockTargetTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            service.handleAggressiveMovement(mockPlayer, true);

            expect(mockPlayGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 3, y: 3 },
                virtualPlayerId: 'player123',
            });
        });

        it('should move towards the nearest door if no player or item is found but a door is found', () => {
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };
            currentTile.player = mockPlayerEntity;

            const mockDoorTile = new WalkableTile();
            mockDoorTile.coordinates = { x: 4, y: 4 };
            mockDoorTile.type = TileType.Door;

            mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', [
                'getTileAt',
                'getAdjacentActionTiles',
                'getNeighbours',
            ]);
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            service.gameMapDataManagerService = mockGameMapDataManagerService;

            spyOn(service, 'findNearestPossiblePlayer').and.returnValue(null);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(null);
            spyOn(service, 'findNearestClosedDoor').and.returnValue(mockDoorTile);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(mockDoorTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            service.handleAggressiveMovement(mockPlayer, true);

            expect(service.playGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 4, y: 4 },
                virtualPlayerId: 'player123',
            });
        });

        it('should signal user started moving and emit move signal if a target tile is selected', () => {
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };
            currentTile.type = TileType.Grass;
            currentTile.description = 'Current Tile';
            currentTile.imageUrl = 'mock-url';

            const mockTargetTile = new WalkableTile();
            mockTargetTile.coordinates = { x: 5, y: 5 };
            mockTargetTile.type = TileType.Grass;
            mockTargetTile.description = 'Mock Target Tile';
            mockTargetTile.imageUrl = 'mock-url';

            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            spyOn(service, 'findNearestPossiblePlayer').and.returnValue(mockTargetTile);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(mockTargetTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            service.handleAggressiveMovement(mockPlayer, true);

            expect(mockGameMapDataManagerService.getTileAt).toHaveBeenCalled();
            expect(service.playGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 5, y: 5 },
                virtualPlayerId: 'player123',
            });
        });
    });

    describe('handleDefensiveComportment', () => {
        let mockPlayer: jasmine.SpyObj<PlayerCharacter>;

        beforeEach(() => {
            service = TestBed.inject(VirtualPlayerManagerService);
            mockPlayer = jasmine.createSpyObj('PlayerCharacter', ['someMethodIfNeeded']);
            spyOn(service, 'handleDefensiveMovement');
        });

        it('should call handleDefensiveActions and not call handleDefensiveMovement if action is taken', () => {
            spyOn(service, 'handleDefensiveActions').and.returnValue(true);

            service.handleDefensiveComportment(mockPlayer, true);

            expect(service.handleDefensiveActions).toHaveBeenCalledWith(mockPlayer, true);
            expect(service.handleDefensiveMovement).not.toHaveBeenCalled();
        });

        it('should call handleDefensiveActions and then handleDefensiveMovement if no action is taken', () => {
            spyOn(service, 'handleDefensiveActions').and.returnValue(false);

            service.handleDefensiveComportment(mockPlayer, false);

            expect(service.handleDefensiveActions).toHaveBeenCalledWith(mockPlayer, false);
            expect(service.handleDefensiveMovement).toHaveBeenCalledWith(mockPlayer, false);
        });

        it('should handle false didTurnStarted parameter correctly', () => {
            spyOn(service, 'handleDefensiveActions').and.returnValue(false);

            service.handleDefensiveComportment(mockPlayer, false);

            expect(service.handleDefensiveActions).toHaveBeenCalledWith(mockPlayer, false);
            expect(service.handleDefensiveMovement).toHaveBeenCalledWith(mockPlayer, false);
        });

        it('should handle true didTurnStarted parameter correctly', () => {
            spyOn(service, 'handleDefensiveActions').and.returnValue(false);

            service.handleDefensiveComportment(mockPlayer, true);

            expect(service.handleDefensiveActions).toHaveBeenCalledWith(mockPlayer, true);
            expect(service.handleDefensiveMovement).toHaveBeenCalledWith(mockPlayer, true);
        });
    });

    describe('handleDefensiveActions', () => {
        let mockPlayer: jasmine.SpyObj<PlayerCharacter>;
        let mockPlayerEntity: PlayerMapEntity;

        beforeEach(() => {
            mockPlayerEntity = new PlayerMapEntity('avatar.png');
            mockPlayerEntity.coordinates = { x: 0, y: 0 };

            mockPlayer = jasmine.createSpyObj('PlayerCharacter', [], {
                socketId: 'player123',
                mapEntity: mockPlayerEntity,
                currentActionPoints: 1,
            });

            mockPlayGameBoardManagerService = jasmine.createSpyObj(
                'PlayGameBoardManagerService',
                ['getAdjacentActionTiles', 'checkIfPLayerDidEverything'],
                {
                    signalUserDidDoorAction: jasmine.createSpyObj('Subject', ['next']),
                    signalUserStartedMoving: jasmine.createSpyObj('Subject', ['next']),
                },
            );
            mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([]);

            mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt']);

            service.playGameBoardManagerService = mockPlayGameBoardManagerService;
            service.gameMapDataManagerService = mockGameMapDataManagerService;
            service.signalVirtualPlayerContinueTurn = jasmine.createSpyObj('Subject', ['next']);
        });

        it('should return false if player has no action points', () => {
            mockPlayer.currentActionPoints = 0;
            const result = service.handleDefensiveActions(mockPlayer, false);
            expect(result).toBeFalse();
        });

        it('should return false if turn has already started', () => {
            const result = service.handleDefensiveActions(mockPlayer, true);
            expect(result).toBeFalse();
        });

        it('should return false if no action tiles are available', () => {
            const currentTile = new WalkableTile();
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([]);

            const result = service.handleDefensiveActions(mockPlayer, false);

            expect(result).toBeFalse();
            expect(mockGameMapDataManagerService.getTileAt).toHaveBeenCalledWith(mockPlayer.mapEntity.coordinates);
            expect(mockPlayGameBoardManagerService.getAdjacentActionTiles).toHaveBeenCalledWith(currentTile);
        });

        it('should perform door action on adjacent open door and return true', () => {
            const currentTile = new WalkableTile();
            const openDoorTile = new OpenDoor();
            openDoorTile.coordinates = { x: 1, y: 0 };

            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([openDoorTile]);

            const result = service.handleDefensiveActions(mockPlayer, false);

            expect(result).toBeTrue();
            expect(mockPlayGameBoardManagerService.signalUserDidDoorAction.next).toHaveBeenCalledWith({
                tileCoordinate: openDoorTile.coordinates,
                playerTurnId: mockPlayer.socketId,
            });
            expect(mockPlayGameBoardManagerService.checkIfPLayerDidEverything).toHaveBeenCalledWith(mockPlayer);
            expect(service.signalVirtualPlayerContinueTurn.next).toHaveBeenCalledWith(mockPlayer.socketId);
        });

        it('should return false if open door tile has a player on it', () => {
            const currentTile = new WalkableTile();
            const openDoorTile = new OpenDoor();
            openDoorTile.coordinates = { x: 1, y: 0 };
            openDoorTile.player = new PlayerMapEntity('other-player.png');

            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([openDoorTile]);

            const result = service.handleDefensiveActions(mockPlayer, false);

            expect(result).toBeFalse();
        });

        it('should return false if no valid actions are available', () => {
            const currentTile = new WalkableTile();
            const adjacentTile = new WalkableTile();

            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([adjacentTile]);

            const result = service.handleDefensiveActions(mockPlayer, false);

            expect(result).toBeFalse();
        });
    });

    describe('handleDefensiveMovement', () => {
        let mockPlayerEntity: PlayerMapEntity;
        let mockPlayer: PlayerCharacter;

        beforeEach(() => {
            mockPlayerEntity = new PlayerMapEntity('avatar.png');
            mockPlayerEntity.coordinates = { x: 0, y: 0 };
            mockPlayer = {
                socketId: 'player123',
                mapEntity: mockPlayerEntity,
            } as PlayerCharacter;

            mockWebSocketService.getRoomInfo.and.returnValue({
                players: [],
                id: '',
                accessCode: 0,
                isLocked: false,
                maxPlayers: 0,
                currentPlayerTurn: '',
                organizer: '',
            });

            mockPlayGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', ['getAdjacentActionTiles'], {
                signalUserStartedMoving: jasmine.createSpyObj('Subject', ['next']),
            });

            service.signalMoveVirtualPlayer = jasmine.createSpyObj('Subject', ['next']);
            service.signalVirtualPlayerEndedTurn = jasmine.createSpyObj('Subject', ['next']);

            service.playGameBoardManagerService = mockPlayGameBoardManagerService;
            service.gameMapDataManagerService = mockGameMapDataManagerService;
        });

        it('should move towards nearest item if available', () => {
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };

            const itemTile = new TerrainTile();
            itemTile.coordinates = { x: 1, y: 1 };
            itemTile.item = { type: ItemType.MagicShield } as Item;

            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(itemTile);
            spyOn(service, 'findNearestOpenDoor').and.returnValue(null);
            spyOn(service, 'findFurthestTileFromPlayers').and.returnValue(null);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(itemTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            service.handleDefensiveMovement(mockPlayer, true);

            expect(service.playGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 1, y: 1 },
                virtualPlayerId: 'player123',
            });
        });

        it('should move towards nearest open door if no items available', () => {
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };

            const openDoorTile = new OpenDoor();
            openDoorTile.coordinates = { x: 2, y: 2 };

            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(null);
            spyOn(service, 'findNearestOpenDoor').and.returnValue(openDoorTile);
            spyOn(service, 'findFurthestTileFromPlayers').and.returnValue(null);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(openDoorTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            service.handleDefensiveMovement(mockPlayer, true);

            expect(service.playGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 2, y: 2 },
                virtualPlayerId: 'player123',
            });
        });

        it('should move to furthest tile from players if no items or doors available', () => {
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };

            const furthestTile = new WalkableTile();
            furthestTile.coordinates = { x: 3, y: 3 };

            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(null);
            spyOn(service, 'findNearestOpenDoor').and.returnValue(null);
            spyOn(service, 'findFurthestTileFromPlayers').and.returnValue(furthestTile);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(furthestTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            service.handleDefensiveMovement(mockPlayer, true);

            expect(service.playGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 3, y: 3 },
                virtualPlayerId: 'player123',
            });
        });

        it('should end turn if no valid moves available and turn not started', () => {
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };

            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(null);
            spyOn(service, 'findNearestOpenDoor').and.returnValue(null);
            spyOn(service, 'findFurthestTileFromPlayers').and.returnValue(null);

            const possibleMoves = new Map<Tile, Tile[]>();
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            service.handleDefensiveMovement(mockPlayer, false);

            expect(service.signalVirtualPlayerEndedTurn.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).not.toHaveBeenCalled();
        });

        it('should not move if player is already at target tile', () => {
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };

            const targetTile = new TerrainTile();
            targetTile.coordinates = { x: 0, y: 0 };
            targetTile.item = { type: ItemType.MagicShield } as Item;

            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(targetTile);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(targetTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            service.handleDefensiveMovement(mockPlayer, true);

            expect(service.signalVirtualPlayerEndedTurn.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).not.toHaveBeenCalled();
        });
    });

    describe('findFurthestTileFromPlayers', () => {
        let mockPlayer: PlayerCharacter;
        let mockPlayerEntity: PlayerMapEntity;
        let mockInventory: Item[];

        beforeEach(() => {
            mockInventory = [new EmptyItem(), new EmptyItem()];
            mockPlayerEntity = new PlayerMapEntity('avatar.png');
            mockPlayerEntity = { coordinates: { x: 0, y: 0 } as Vec2 } as PlayerMapEntity;
            mockPlayer = {
                socketId: 'player123',
                mapEntity: mockPlayerEntity,
                currentActionPoints: 2,
                comportement: ProfileEnum.Defensive,
                isVirtual: true,
                inventory: mockInventory,
            } as PlayerCharacter;

            mockWebSocketService.getRoomInfo.and.returnValue({
                players: [],
                id: '1',
                accessCode: 1234,
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: '',
                organizer: '',
            });
        });

        it('should return null if no possible moves are available', () => {
            const possibleMoves = new Map<Tile, Tile[]>();
            mockWebSocketService.getRoomInfo.and.returnValue({
                players: [mockPlayer],
                id: '1',
                accessCode: 1234,
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.findFurthestTileFromPlayers(mockPlayer, possibleMoves);

            expect(result).toBeNull();
        });

        it('should find the tile furthest from other players', () => {
            const nearTile = new WalkableTile();
            nearTile.coordinates = { x: 1, y: 1 };

            const farTile = new WalkableTile();
            farTile.coordinates = { x: 5, y: 5 };

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(nearTile, []);
            possibleMoves.set(farTile, []);

            const otherPlayerEntity = new PlayerMapEntity('other.png');
            otherPlayerEntity.coordinates = { x: 0, y: 0 };

            const otherPlayer = new PlayerCharacter('OtherPlayer');
            otherPlayer.socketId = 'player456';
            otherPlayer.mapEntity = otherPlayerEntity;
            otherPlayer.isVirtual = true;
            otherPlayer.comportement = ProfileEnum.Defensive;

            mockGameMapDataManagerService.getTileAt.and.callFake((coords: Vec2) => {
                const tile = new WalkableTile();
                tile.coordinates = coords;
                return tile;
            });

            mockWebSocketService.getRoomInfo.and.returnValue({
                players: [mockPlayer, otherPlayer],
                id: '1',
                accessCode: 1234,
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.findFurthestTileFromPlayers(mockPlayer, possibleMoves);

            expect(result).toBeTruthy();
            expect(result?.coordinates).toEqual({ x: 5, y: 5 });
        });

        it('should handle multiple other players', () => {
            const tile1 = new WalkableTile();
            tile1.coordinates = { x: 1, y: 1 };

            const tile2 = new WalkableTile();
            tile2.coordinates = { x: 3, y: 3 };

            const tile3 = new WalkableTile();
            tile3.coordinates = { x: 5, y: 5 };

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(tile1, []);
            possibleMoves.set(tile2, []);
            possibleMoves.set(tile3, []);

            const otherPlayerEntity1 = new PlayerMapEntity('other1.png');
            otherPlayerEntity1.coordinates = { x: 0, y: 0 };

            const otherPlayerEntity2 = new PlayerMapEntity('other2.png');
            otherPlayerEntity2.coordinates = { x: 1, y: 1 };

            const otherPlayers = [
                {
                    socketId: 'player456',
                    mapEntity: otherPlayerEntity1,
                    isVirtual: true,
                    comportement: ProfileEnum.Defensive,
                } as PlayerCharacter,
                {
                    socketId: 'player789',
                    mapEntity: otherPlayerEntity2,
                    isVirtual: true,
                    comportement: ProfileEnum.Defensive,
                } as PlayerCharacter,
            ];

            mockGameMapDataManagerService.getTileAt.and.callFake((coords: Vec2) => {
                const tile = new WalkableTile();
                tile.coordinates = coords;
                return tile;
            });

            mockWebSocketService.getRoomInfo.and.returnValue({
                players: [mockPlayer, ...otherPlayers],
                id: '1',
                accessCode: 1234,
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.findFurthestTileFromPlayers(mockPlayer, possibleMoves);

            expect(result).toBeTruthy();
            expect(result?.coordinates).toEqual({ x: 5, y: 5 });
        });

        it('should return a random tile if all tiles are equidistant from players', () => {
            const tile1 = new WalkableTile();
            tile1.coordinates = { x: 2, y: 0 };

            const tile2 = new WalkableTile();
            tile2.coordinates = { x: 0, y: 2 };

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(tile1, []);
            possibleMoves.set(tile2, []);

            mockPlayerEntity = new PlayerMapEntity('avatar.png');
            mockPlayerEntity.coordinates = { x: 0, y: 0 };

            mockPlayer = new PlayerCharacter('TestPlayer');
            mockPlayer.socketId = 'player123';
            mockPlayer.mapEntity = mockPlayerEntity;
            mockPlayer.isVirtual = true;
            mockPlayer.comportement = ProfileEnum.Defensive;

            const otherPlayerEntity = new PlayerMapEntity('other.png');
            otherPlayerEntity.coordinates = { x: 1, y: 1 };
            otherPlayerEntity.spawnCoordinates = { x: 1, y: 1 };

            const otherPlayer = new PlayerCharacter('OtherPlayer');
            otherPlayer.socketId = 'player456';
            otherPlayer.mapEntity = otherPlayerEntity;
            otherPlayer.isVirtual = true;
            otherPlayer.comportement = ProfileEnum.Defensive;

            mockGameMapDataManagerService.getTileAt.and.callFake((coords: Vec2) => {
                const tile = new WalkableTile();
                tile.coordinates = coords;
                return tile;
            });

            mockWebSocketService.getRoomInfo.and.returnValue({
                players: [mockPlayer, otherPlayer],
                id: '1',
                accessCode: 1234,
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.findFurthestTileFromPlayers(mockPlayer, possibleMoves);

            expect(result).toBeTruthy();
            if (result) {
                const possibleCoordinates = [tile1.coordinates, tile2.coordinates];
                expect(possibleCoordinates.some((coord) => coord.x === result.coordinates.x && coord.y === result.coordinates.y)).toBeTrue();
            }
        });

        it('should exclude the current player when calculating distances', () => {
            const tile = new WalkableTile();
            tile.coordinates = { x: 3, y: 3 };

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(tile, []);

            mockWebSocketService.getRoomInfo.and.returnValue({
                players: [mockPlayer],
                id: '1',
                accessCode: 1234,
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.findFurthestTileFromPlayers(mockPlayer, possibleMoves);

            expect(result).toBe(tile);
        });
    });

    describe('findNearestOpenDoor', () => {
        let mockPlayer: PlayerCharacter;
        let mockPlayerEntity: PlayerMapEntity;

        beforeEach(() => {
            mockPlayerEntity = new PlayerMapEntity('avatar.png');
            mockPlayerEntity.coordinates = { x: 0, y: 0 };

            mockPlayer = {
                socketId: 'player123',
                mapEntity: mockPlayerEntity,
                isVirtual: true,
                comportement: ProfileEnum.Defensive,
            } as PlayerCharacter;

            mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt', 'getNeighbours']);
            mockPlayGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', ['findPlayerFromPlayerMapEntity']);

            service.gameMapDataManagerService = mockGameMapDataManagerService;
            service.playGameBoardManagerService = mockPlayGameBoardManagerService;
        });

        it('should return null if no open doors are in possible moves', () => {
            const tile1 = new WalkableTile();
            tile1.coordinates = { x: 1, y: 1 };

            const tile2 = new WalkableTile();
            tile2.coordinates = { x: 2, y: 2 };

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(tile1, []);
            possibleMoves.set(tile2, []);

            const result = service.findNearestOpenDoor(mockPlayer, possibleMoves);
            expect(result).toBeNull();
        });

        it('should find nearest open door from possible moves', () => {
            mockPlayerEntity.coordinates = { x: 0, y: 0 };

            mockPlayer.socketId = 'player123';
            mockPlayer.mapEntity = mockPlayerEntity;

            const nearDoor = new OpenDoor();
            nearDoor.coordinates = { x: 1, y: 1 };

            const farDoor = new OpenDoor();
            farDoor.coordinates = { x: 3, y: 3 };

            const adjacentTile = new WalkableTile();
            adjacentTile.coordinates = { x: 1, y: 1 };

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(nearDoor, []);
            possibleMoves.set(farDoor, []);
            possibleMoves.set(adjacentTile, []);

            mockGameMapDataManagerService.getNeighbours.and.returnValue([adjacentTile]);

            mockPlayGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', ['findPlayerFromPlayerMapEntity']);
            service.playGameBoardManagerService = mockPlayGameBoardManagerService;

            const result = service.findNearestOpenDoor(mockPlayer, possibleMoves);

            expect(result).toBeTruthy();
            expect(result?.coordinates).toEqual({ x: 1, y: 1 });
        });

        it('should choose accessible adjacent tile when multiple exist', () => {
            const openDoor = new OpenDoor();
            openDoor.coordinates = { x: 1, y: 1 };

            const accessibleTile1 = new WalkableTile();
            accessibleTile1.coordinates = { x: 1, y: 0 };

            const accessibleTile2 = new WalkableTile();
            accessibleTile2.coordinates = { x: 0, y: 1 };

            const blockedTile = new WalkableTile();
            blockedTile.coordinates = { x: 2, y: 1 };
            blockedTile.player = new PlayerMapEntity('other.png');

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(openDoor, []);
            possibleMoves.set(accessibleTile1, []);
            possibleMoves.set(accessibleTile2, []);

            mockGameMapDataManagerService.getNeighbours.and.returnValue([accessibleTile1, accessibleTile2, blockedTile]);

            const result = service.findNearestOpenDoor(mockPlayer, possibleMoves);

            expect(result).toBeTruthy();
            expect(result?.coordinates).toEqual(accessibleTile1.coordinates);
        });
    });

    describe('findNearestClosedDoor', () => {
        let mockPlayer: PlayerCharacter;
        let mockPlayerEntity: PlayerMapEntity;

        beforeEach(() => {
            mockPlayerEntity = new PlayerMapEntity('avatar.png');
            mockPlayerEntity.coordinates = { x: 0, y: 0 };

            mockPlayer = {
                socketId: 'player123',
                mapEntity: mockPlayerEntity,
                isVirtual: true,
                comportement: ProfileEnum.Defensive,
            } as PlayerCharacter;

            mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt', 'getNeighbours']);
            service.gameMapDataManagerService = mockGameMapDataManagerService;
            mockGameMapDataManagerService.getNeighbours.and.returnValue([]);
        });

        it('should find nearest closed door from possible moves', () => {
            const walkableTile = new WalkableTile();
            walkableTile.coordinates = { x: 1, y: 1 };

            const doorTile = new DoorTile();
            doorTile.coordinates = { x: 1, y: 2 };

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(walkableTile, []);

            mockGameMapDataManagerService.getNeighbours.and.returnValue([doorTile]);

            const result = service.findNearestClosedDoor(mockPlayer, possibleMoves);

            expect(result).toBe(walkableTile);
            expect(mockGameMapDataManagerService.getNeighbours).toHaveBeenCalledWith(walkableTile);
        });

        it('should handle multiple adjacent doors', () => {
            const walkableTile = new WalkableTile();
            walkableTile.coordinates = { x: 1, y: 1 };

            const doorTile1 = new DoorTile();
            doorTile1.coordinates = { x: 1, y: 2 };

            const doorTile2 = new DoorTile();
            doorTile2.coordinates = { x: 2, y: 1 };

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(walkableTile, []);

            mockGameMapDataManagerService.getNeighbours.and.returnValue([doorTile1, doorTile2]);

            const result = service.findNearestClosedDoor(mockPlayer, possibleMoves);

            expect(result).toBe(walkableTile);
            expect(mockGameMapDataManagerService.getNeighbours).toHaveBeenCalledWith(walkableTile);
        });
    });
    describe('findNearestPossiblePlayer', () => {
        let mockPlayer: PlayerCharacter;
        let mockPlayerEntity: PlayerMapEntity;

        beforeEach(() => {
            mockPlayerEntity = new PlayerMapEntity('avatar.png');
            mockPlayerEntity.coordinates = { x: 0, y: 0 };

            mockPlayer = new PlayerCharacter('TestPlayer');
            mockPlayer.socketId = 'player123';
            mockPlayer.mapEntity = mockPlayerEntity;
            mockPlayer.isVirtual = true;
            mockPlayer.comportement = ProfileEnum.Defensive;

            mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt', 'getNeighbours']);
            service.gameMapDataManagerService = mockGameMapDataManagerService;
        });

        it('should return null if no other players are found', () => {
            mockWebSocketService.getRoomInfo.and.returnValue({
                players: [mockPlayer],
                id: '1',
                accessCode: 1234,
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: '',
                organizer: '',
            });

            const possibleMoves = new Map<Tile, Tile[]>();
            const result = service.findNearestPossiblePlayer(mockPlayer, possibleMoves);
            expect(result).toBeNull();
        });

        it('should find nearest accessible tile next to a player', () => {
            const otherPlayerEntity = new PlayerMapEntity('other.png');
            otherPlayerEntity.coordinates = { x: 2, y: 2 };

            const otherPlayer = new PlayerCharacter('OtherPlayer');
            otherPlayer.socketId = 'player456';
            otherPlayer.mapEntity = otherPlayerEntity;

            const playerTile = new WalkableTile();
            playerTile.coordinates = { x: 2, y: 2 };
            playerTile.player = otherPlayerEntity;

            const adjacentTile = new WalkableTile();
            adjacentTile.coordinates = { x: 1, y: 2 };

            mockGameMapDataManagerService.getTileAt.and.returnValue(playerTile);
            mockGameMapDataManagerService.getNeighbours.and.returnValue([adjacentTile]);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(adjacentTile, []);

            mockWebSocketService.getRoomInfo.and.returnValue({
                players: [mockPlayer, otherPlayer],
                id: '1',
                accessCode: 1234,
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.findNearestPossiblePlayer(mockPlayer, possibleMoves);

            expect(result).toBeTruthy();
            expect(result).toBe(adjacentTile);
            expect(mockGameMapDataManagerService.getTileAt).toHaveBeenCalledWith(otherPlayerEntity.coordinates);
            expect(mockGameMapDataManagerService.getNeighbours).toHaveBeenCalledWith(playerTile);
        });

        it('should handle multiple players and return nearest accessible tile', () => {
            const otherPlayer1Entity = new PlayerMapEntity('other1.png');
            otherPlayer1Entity.coordinates = { x: 4, y: 4 };

            const otherPlayer1 = new PlayerCharacter('OtherPlayer1');
            otherPlayer1.socketId = 'player456';
            otherPlayer1.mapEntity = otherPlayer1Entity;

            const otherPlayer2Entity = new PlayerMapEntity('other2.png');
            otherPlayer2Entity.coordinates = { x: 1, y: 1 };

            const otherPlayer2 = new PlayerCharacter('OtherPlayer2');
            otherPlayer2.socketId = 'player789';
            otherPlayer2.mapEntity = otherPlayer2Entity;

            const player1Tile = new WalkableTile();
            player1Tile.coordinates = { x: 4, y: 4 };
            player1Tile.player = otherPlayer1Entity;

            const player2Tile = new WalkableTile();
            player2Tile.coordinates = { x: 1, y: 1 };
            player2Tile.player = otherPlayer2Entity;

            const adjacentTile1 = new WalkableTile();
            adjacentTile1.coordinates = { x: 3, y: 4 };

            const adjacentTile2 = new WalkableTile();
            adjacentTile2.coordinates = { x: 1, y: 0 };

            const coord1 = 1;
            const coord4 = 4;

            mockGameMapDataManagerService.getTileAt.and.callFake((coords: Vec2) => {
                if (coords.x === coord4 && coords.y === coord4) return player1Tile;
                if (coords.x === coord1 && coords.y === coord1) return player2Tile;
                return new WalkableTile();
            });

            mockGameMapDataManagerService.getNeighbours.and.callFake((tile: Tile) => {
                if (tile === player1Tile) return [adjacentTile1];
                if (tile === player2Tile) return [adjacentTile2];
                return [];
            });

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(adjacentTile1, []);
            possibleMoves.set(adjacentTile2, []);

            mockWebSocketService.getRoomInfo.and.returnValue({
                players: [mockPlayer, otherPlayer1, otherPlayer2],
                id: '1',
                accessCode: 1234,
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.findNearestPossiblePlayer(mockPlayer, possibleMoves);

            expect(result).toBeTruthy();
            expect(result).toBe(adjacentTile2);
        });

        it('should return null when adjacent tiles are not in possible moves', () => {
            const otherPlayerEntity = new PlayerMapEntity('other.png');
            otherPlayerEntity.coordinates = { x: 1, y: 1 };

            const otherPlayer = new PlayerCharacter('OtherPlayer');
            otherPlayer.socketId = 'player456';
            otherPlayer.mapEntity = otherPlayerEntity;

            const playerTile = new WalkableTile();
            playerTile.coordinates = { x: 1, y: 1 };
            playerTile.player = otherPlayerEntity;

            const adjacentTile = new WalkableTile();
            adjacentTile.coordinates = { x: 1, y: 0 };

            mockGameMapDataManagerService.getTileAt.and.returnValue(playerTile);
            mockGameMapDataManagerService.getNeighbours.and.returnValue([adjacentTile]);

            const possibleMoves = new Map<Tile, Tile[]>();

            mockWebSocketService.getRoomInfo.and.returnValue({
                players: [mockPlayer, otherPlayer],
                id: '1',
                accessCode: 1234,
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: '',
                organizer: '',
            });

            const result = service.findNearestPossiblePlayer(mockPlayer, possibleMoves);
            expect(result).toBeNull();
        });
    });
    describe('findNearestPossibleItem', () => {
        let mockPlayer: PlayerCharacter;
        let mockPlayerEntity: PlayerMapEntity;
        const INVENTORY_SIZE = 2;

        beforeEach(() => {
            mockPlayerEntity = new PlayerMapEntity('avatar.png');
            mockPlayerEntity.coordinates = { x: 0, y: 0 };

            mockPlayer = new PlayerCharacter('TestPlayer');
            mockPlayer.socketId = 'player123';
            mockPlayer.mapEntity = mockPlayerEntity;
            mockPlayer.isVirtual = true;
            mockPlayer.comportement = ProfileEnum.Defensive;
            mockPlayer.inventory = [new EmptyItem(), new EmptyItem()];
        });

        it('should return null if no items are in possible moves', () => {
            const tile1 = new WalkableTile();
            tile1.coordinates = { x: 1, y: 1 };

            const tile2 = new WalkableTile();
            tile2.coordinates = { x: 2, y: 2 };

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(tile1, []);
            possibleMoves.set(tile2, []);

            const result = service.findNearestPossibleItem(mockPlayer, possibleMoves);
            expect(result).toBeNull();
        });

        it('should find nearest grabbable item for defensive player', () => {
            const itemTile = new TerrainTile();
            itemTile.coordinates = { x: 1, y: 1 };
            itemTile.item = {
                type: ItemType.MagicShield,
                isGrabbable: () => true,
            } as Item;

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(itemTile, []);

            mockPlayer.comportement = ProfileEnum.Defensive;

            const result = service.findNearestPossibleItem(mockPlayer, possibleMoves);

            expect(result).toBeTruthy();
            expect(result?.coordinates).toEqual({ x: 1, y: 1 });
            expect(result?.item?.type).toBe(ItemType.MagicShield);
        });

        it('should find nearest grabbable item for aggressive player', () => {
            const itemTile = new TerrainTile();
            itemTile.coordinates = { x: 1, y: 1 };
            itemTile.item = {
                type: ItemType.Sword,
                isGrabbable: () => true,
            } as Item;

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(itemTile, []);

            mockPlayer.comportement = ProfileEnum.Agressive;

            const result = service.findNearestPossibleItem(mockPlayer, possibleMoves);

            expect(result).toBeTruthy();
            expect(result?.coordinates).toEqual({ x: 1, y: 1 });
            expect(result?.item?.type).toBe(ItemType.Sword);
        });

        it('should choose item based on priority and distance', () => {
            const nearTile = new TerrainTile();
            nearTile.coordinates = { x: 1, y: 1 };
            nearTile.item = {
                type: ItemType.EnchantedBook,
                isGrabbable: () => true,
            } as Item;

            const farTile = new TerrainTile();
            farTile.coordinates = { x: 5, y: 5 };
            farTile.item = {
                type: ItemType.MagicShield,
                isGrabbable: () => true,
            } as Item;

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(nearTile, []);
            possibleMoves.set(farTile, []);

            mockPlayer.comportement = ProfileEnum.Defensive;

            const result = service.findNearestPossibleItem(mockPlayer, possibleMoves);

            expect(result).toBeTruthy();
            expect(result?.coordinates).toEqual(farTile.coordinates);
            expect(result?.item?.type).toBe(ItemType.MagicShield);
        });

        it('should not select non-grabbable items', () => {
            const itemTile = new TerrainTile();
            itemTile.coordinates = { x: 1, y: 1 };
            itemTile.item = {
                type: ItemType.MagicShield,
                isGrabbable: () => false,
            } as Item;

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(itemTile, []);

            const result = service.findNearestPossibleItem(mockPlayer, possibleMoves);

            expect(result).toBeNull();
        });

        it('should handle full inventory and better items', () => {
            mockPlayer.inventory = Array(INVENTORY_SIZE).fill({ type: ItemType.EnchantedBook });

            const itemTile = new TerrainTile();
            itemTile.coordinates = { x: 1, y: 1 };
            itemTile.item = {
                type: ItemType.MagicShield,
                isGrabbable: () => true,
            } as Item;

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(itemTile, []);

            mockPlayer.comportement = ProfileEnum.Defensive;

            const result = service.findNearestPossibleItem(mockPlayer, possibleMoves);

            expect(result).toBeTruthy();
            expect(result?.coordinates).toEqual(itemTile.coordinates);
            expect(result?.item?.type).toBe(ItemType.MagicShield);
        });
    });
    describe('isInventoryFull', () => {
        let mockPlayer: PlayerCharacter;
        const INVENTORY_SIZE = 2;

        beforeEach(() => {
            mockPlayer = new PlayerCharacter('TestPlayer');
            mockPlayer.socketId = 'player123';
            mockPlayer.isVirtual = true;
        });

        it('should return false for empty inventory', () => {
            mockPlayer.inventory = [];

            const result = service.isInventoryFull(mockPlayer);
            expect(result).toBeFalse();
        });

        it('should return true when inventory size equals INVENTORY_SIZE', () => {
            mockPlayer.inventory = Array(INVENTORY_SIZE).fill(new EmptyItem());

            const result = service.isInventoryFull(mockPlayer);
            expect(result).toBeTrue();
        });

        it('should return true when inventory size exceeds INVENTORY_SIZE', () => {
            mockPlayer.inventory = Array(INVENTORY_SIZE + 1).fill(new EmptyItem());

            const result = service.isInventoryFull(mockPlayer);
            expect(result).toBeTrue();
        });
    });

    describe('isNewItemBetterThanOthersInInventory', () => {
        let mockPlayer: PlayerCharacter;

        beforeEach(() => {
            mockPlayer = new PlayerCharacter('TestPlayer');
            mockPlayer.socketId = 'player123';
            mockPlayer.inventory = [new EmptyItem(), new EmptyItem()];
        });

        it('should return true for aggressive player when new item has higher priority', () => {
            mockPlayer.comportement = ProfileEnum.Agressive;
            mockPlayer.inventory = [{ type: ItemType.EnchantedBook } as Item, { type: ItemType.Chestplate } as Item];

            const newItem = { type: ItemType.Sword } as Item;

            const result = service.isNewItemBetterThanOthersInInventory(mockPlayer, newItem);
            expect(result).toBeTrue();
        });

        it('should return false for aggressive player when new item has lower priority', () => {
            mockPlayer.comportement = ProfileEnum.Agressive;
            mockPlayer.inventory = [{ type: ItemType.Sword } as Item, { type: ItemType.Flag } as Item];

            const newItem = { type: ItemType.EnchantedBook } as Item;

            const result = service.isNewItemBetterThanOthersInInventory(mockPlayer, newItem);
            expect(result).toBeFalse();
        });

        it('should return true for defensive player when new item has higher priority', () => {
            mockPlayer.comportement = ProfileEnum.Defensive;
            mockPlayer.inventory = [{ type: ItemType.EnchantedBook } as Item, { type: ItemType.Sword } as Item];

            const newItem = { type: ItemType.MagicShield } as Item;

            const result = service.isNewItemBetterThanOthersInInventory(mockPlayer, newItem);
            expect(result).toBeTrue();
        });

        it('should return false for defensive player when new item has lower priority', () => {
            mockPlayer.comportement = ProfileEnum.Defensive;
            mockPlayer.inventory = [{ type: ItemType.MagicShield } as Item, { type: ItemType.Flag } as Item];

            const newItem = { type: ItemType.EnchantedBook } as Item;

            const result = service.isNewItemBetterThanOthersInInventory(mockPlayer, newItem);
            expect(result).toBeFalse();
        });

        it('should return false when player has no comportement', () => {
            mockPlayer.comportement = null;
            mockPlayer.inventory = [{ type: ItemType.EnchantedBook } as Item, { type: ItemType.Sword } as Item];

            const newItem = { type: ItemType.MagicShield } as Item;

            const result = service.isNewItemBetterThanOthersInInventory(mockPlayer, newItem);
            expect(result).toBeFalse();
        });

        it('should handle empty inventory', () => {
            mockPlayer.comportement = ProfileEnum.Agressive;
            mockPlayer.inventory = [];

            const newItem = { type: ItemType.Sword } as Item;

            const result = service.isNewItemBetterThanOthersInInventory(mockPlayer, newItem);
            expect(result).toBeFalse();
        });
    });

    describe('getAggressivePlayerItemPriority', () => {
        beforeEach(() => {
            service = TestBed.inject(VirtualPlayerManagerService);
        });

        it('should return highest priority (10) for Sword', () => {
            const priority = 10;
            const result = service.getAggressivePlayerItemPriority(ItemType.Sword);
            expect(result).toBe(priority);
        });

        it('should return highest priority (10) for Flag', () => {
            const priority = 10;
            const result = service.getAggressivePlayerItemPriority(ItemType.Flag);
            expect(result).toBe(priority);
        });

        it('should return medium priority (8) for Totem', () => {
            const priority = 8;
            const result = service.getAggressivePlayerItemPriority(ItemType.Totem);
            expect(result).toBe(priority);
        });

        it('should return default priority (1) for other items', () => {
            const items = [ItemType.MagicShield, ItemType.Chestplate, ItemType.EnchantedBook];

            items.forEach((itemType) => {
                const result = service.getAggressivePlayerItemPriority(itemType);
                expect(result).toBe(1);
            });
        });

        it('should handle undefined item type', () => {
            const result = service.getAggressivePlayerItemPriority(undefined as unknown as ItemType);
            expect(result).toBe(1);
        });
    });

    describe('getDefensivePlayerItemPriority', () => {
        beforeEach(() => {
            service = TestBed.inject(VirtualPlayerManagerService);
        });

        it('should return highest priority (10) for MagicShield', () => {
            const priority = 10;
            const result = service.getDefensivePlayerItemPriority(ItemType.MagicShield);
            expect(result).toBe(priority);
        });

        it('should return highest priority (10) for Flag', () => {
            const priority = 10;
            const result = service.getDefensivePlayerItemPriority(ItemType.Flag);
            expect(result).toBe(priority);
        });

        it('should return high priority (9) for Chestplate', () => {
            const priority = 9;
            const result = service.getDefensivePlayerItemPriority(ItemType.Chestplate);
            expect(result).toBe(priority);
        });

        it('should return medium priority (8) for EnchantedBook', () => {
            const priority = 8;
            const result = service.getDefensivePlayerItemPriority(ItemType.EnchantedBook);
            expect(result).toBe(priority);
        });

        it('should return default priority (1) for other items', () => {
            const items = [ItemType.Sword, ItemType.Totem, ItemType.EmptyItem];

            items.forEach((itemType) => {
                const result = service.getDefensivePlayerItemPriority(itemType);
                expect(result).toBe(1);
            });
        });

        it('should handle undefined item type', () => {
            const result = service.getDefensivePlayerItemPriority(undefined as unknown as ItemType);
            expect(result).toBe(1);
        });
    });
});
