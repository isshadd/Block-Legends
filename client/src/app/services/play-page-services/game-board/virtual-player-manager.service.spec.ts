/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
// import { Subject } from 'rxjs';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
// import { PlayerCharacter } from '@common/classes/Player/player-character';
import { PlayerMapEntity } from '@common/classes/Player/player-map-entity';
// import { DoorTile } from '@common/classes/Tiles/door-tile';
// import { GrassTile } from '@common/classes/Tiles/grass-tile';
// import { ProfileEnum } from '@common/enums/profile';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { PlayGameBoardManagerService } from './play-game-board-manager.service';
import { VirtualPlayerManagerService } from './virtual-player-manager.service';
// import { mock } from 'node:test';
import { Item } from '@common/classes/Items/item';
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

describe('VirtualPlayerManagerService', () => {
    let service: VirtualPlayerManagerService;
    let mockPlayGameBoardManagerService: jasmine.SpyObj<PlayGameBoardManagerService>;
    let mockGameMapDataManagerService: jasmine.SpyObj<GameMapDataManagerService>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;

    beforeEach(() => {
        // Create mock spy objects for dependencies
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
                // Define signalUserDidBattleAction and signalUserDidDoorAction as Subjects with spy methods
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

        // mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt']);

        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['getRoomInfo']);

        // Create the service with mock dependencies
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
            const mockPlayer: PlayerCharacter = { socketId } as PlayerCharacter; // Mock player object
            mockPlayGameBoardManagerService.findPlayerFromSocketId.and.returnValue(mockPlayer);
            // spyOn(service, 'handleVirtualPlayerTurn');

            service.startTurn('player123');

            expect(mockPlayGameBoardManagerService.findPlayerFromSocketId).toHaveBeenCalledWith('player123');
            expect(service.handleVirtualPlayerTurn).toHaveBeenCalledWith(mockPlayer, true);
        });

        it('should not call handleVirtualPlayerTurn if no virtual player is found', () => {
            mockPlayGameBoardManagerService.findPlayerFromSocketId.and.returnValue(null);
            // spyOn(service, 'handleVirtualPlayerTurn');

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
            // Initialize service and mock player
            service = TestBed.inject(VirtualPlayerManagerService);
            mockPlayer = jasmine.createSpyObj('PlayerCharacter', ['someMethodIfNeeded']);

            // Spy on methods used within handleAgressiveComportment
            // spyOn(service, 'handleAggressiveActions').and.returnValue(false);
            spyOn(service, 'handleAggressiveMovement');
        });

        it('should call handleAggressiveActions and not call handleAggressiveMovement if action is taken', () => {
            spyOn(service, 'handleAggressiveActions').and.returnValue(true); // Mock action taken

            service.handleAgressiveComportment(mockPlayer, true);

            expect(service.handleAggressiveActions).toHaveBeenCalledWith(mockPlayer);
            expect(service.handleAggressiveMovement).not.toHaveBeenCalled();
        });

        it('should call handleAggressiveActions and then handleAggressiveMovement if no action is taken', () => {
            spyOn(service, 'handleAggressiveActions').and.returnValue(false); // Mock no action taken

            service.handleAgressiveComportment(mockPlayer, false);

            expect(service.handleAggressiveActions).toHaveBeenCalledWith(mockPlayer);
            expect(service.handleAggressiveMovement).toHaveBeenCalledWith(mockPlayer, false);
        });
    });

    describe('handleAggressiveActions', () => {
        let mockPlayer: jasmine.SpyObj<PlayerCharacter>;

        beforeEach(() => {
            mockPlayer = jasmine.createSpyObj('PlayerCharacter', ['socketId', 'mapEntity', 'currentActionPoints']);
            mockPlayer.currentActionPoints = 10; // Default action points
        });

        it('should return false if player has no action points', () => {
            mockPlayer.currentActionPoints = 0;

            const result = service.handleAggressiveActions(mockPlayer);

            expect(result).toBeFalse();
        });

        it('should emit battle action and return true for an enemy player on an adjacent tile', () => {
            // Create enemy tile with player
            const mockTile = new WalkableTile();
            mockTile.type = TileType.Grass;
            mockTile.description = 'Mock Walkable Tile';
            mockTile.imageUrl = 'mock-url';
            mockTile.coordinates = { x: 0, y: 0 };
            mockTile.player = new PlayerMapEntity('avatar.png');
            mockTile.player.description = 'enemy123';

            // Create enemy player
            const enemyPlayer = {
                socketId: 'enemy123',
                mapEntity: mockTile.player,
            } as PlayerCharacter;

            // Setup mocks
            mockGameMapDataManagerService.getTileAt.and.returnValue(mockTile);
            mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([mockTile]);
            mockPlayGameBoardManagerService.findPlayerFromPlayerMapEntity.and.returnValue(enemyPlayer);

            // Test
            const result = service.handleAggressiveActions(mockPlayer);

            expect(result).toBeTrue();
            expect(mockPlayGameBoardManagerService.signalUserDidBattleAction.next).toHaveBeenCalledWith({
                playerTurnId: mockPlayer.socketId,
                enemyPlayerId: enemyPlayer.socketId,
            });
        });

        it('should emit door action if adjacent tile is a door tile', () => {
            // Create proper DoorTile instance
            const mockDoorTile = new DoorTile();
            mockDoorTile.type = TileType.Door;
            mockDoorTile.description = 'Mock Door Tile';
            mockDoorTile.imageUrl = 'mock-door-url';
            mockDoorTile.coordinates = { x: 0, y: 0 } as Vec2;

            // Update mock return
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
        // let signalUserStartedMovingSubject: jasmine.SpyObj<Subject<string>>;

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
            // signalUserStartedMovingSubject = jasmine.createSpyObj('Subject', ['next']);
            const signalVirtualPlayerEndedTurnSubject = jasmine.createSpyObj('Subject', ['next']);

            // mockPlayGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', ['findPlayerFromSocketId'], {
            //     signalUserStartedMoving: signalUserStartedMovingSubject,
            // });

            const signalUserStartedMovingSubject = new Subject<string>();
            spyOn(signalUserStartedMovingSubject, 'next');

            service.signalMoveVirtualPlayer = signalMoveVirtualPlayerSubject;
            service.signalVirtualPlayerEndedTurn = signalVirtualPlayerEndedTurnSubject;
            spyOn(service, 'handleAggressiveMovement').and.callThrough();

            Object.defineProperty(mockPlayGameBoardManagerService, 'signalUserStartedMoving', {
                value: signalUserStartedMovingSubject,
                writable: true,
            });

            // spyOn(service, 'setPossibleMoves').and.returnValue(new Map());
            // spyOn(service, 'findNearestPossiblePlayer').and.returnValue(null);
            // spyOn(service, 'findNearestPossibleItem').and.returnValue(null);
            // spyOn(service, 'findNearestClosedDoor').and.returnValue(null);
            service.playGameBoardManagerService = mockPlayGameBoardManagerService;
        });

        it('should end the turn if no targets are found and turn has not started', () => {
            // Create current tile
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };

            // Setup mocks
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([]);

            spyOn(service, 'findNearestPossiblePlayer').and.returnValue(null);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(null);
            spyOn(service, 'findNearestClosedDoor').and.returnValue(null);

            const possibleMoves = new Map<Tile, Tile[]>();
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            // Execute
            service.handleAggressiveMovement(mockPlayer, false);

            // Assert
            expect(service.signalVirtualPlayerEndedTurn.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).not.toHaveBeenCalled();
        });

        it('should signal virtual player movement with correct coordinates', () => {
            // Create current tile
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };
            currentTile.player = mockPlayerEntity;

            // Create target tile
            const targetTile = new WalkableTile();
            targetTile.coordinates = { x: 1, y: 1 };

            // Setup GameMapDataManagerService mock
            mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', [
                'getTileAt',
                'getAdjacentActionTiles',
                'getNeighbours',
            ]);
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            service.gameMapDataManagerService = mockGameMapDataManagerService;

            // Setup PlayGameBoardManagerService mock with signal
            const signalUserStartedMovingSubject = new Subject<string>();
            spyOn(signalUserStartedMovingSubject, 'next');

            mockPlayGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', ['getAdjacentActionTiles'], {
                signalUserStartedMoving: signalUserStartedMovingSubject,
            });
            service.playGameBoardManagerService = mockPlayGameBoardManagerService;

            // Setup signals
            service.signalMoveVirtualPlayer = jasmine.createSpyObj('Subject', ['next']);
            service.signalVirtualPlayerEndedTurn = jasmine.createSpyObj('Subject', ['next']);

            // Setup spies
            spyOn(service, 'findNearestPossiblePlayer').and.returnValue(targetTile);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(null);
            spyOn(service, 'findNearestClosedDoor').and.returnValue(null);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(targetTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            // Execute
            service.handleAggressiveMovement(mockPlayer, true);

            // Assert
            expect(mockGameMapDataManagerService.getTileAt).toHaveBeenCalledWith(mockPlayerEntity.coordinates);
            expect(service.playGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 1, y: 1 },
                virtualPlayerId: 'player123',
            });
        });

        it('should move towards the nearest player if found', () => {
            // Create current tile
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };
            currentTile.player = mockPlayerEntity;

            // Create target tile with player
            const targetTile = new WalkableTile();
            targetTile.coordinates = { x: 2, y: 2 };

            // Setup mocks
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            spyOn(service, 'findNearestPossiblePlayer').and.returnValue(targetTile);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(null);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(targetTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            // Execute
            service.handleAggressiveMovement(mockPlayer, true);

            // Assert
            expect(mockPlayGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 2, y: 2 },
                virtualPlayerId: 'player123',
            });
        });
        it('should move towards the nearest item if no player is found but an item is found', () => {
            // Create current tile with proper coordinates
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };
            currentTile.player = mockPlayerEntity;
            currentTile.type = TileType.Grass;

            // Create target tile with item
            const mockTargetTile = new TerrainTile();
            mockTargetTile.coordinates = { x: 3, y: 3 };
            mockTargetTile.type = TileType.Grass;
            mockTargetTile.description = 'Mock Target Tile';
            mockTargetTile.imageUrl = 'mock-url';
            mockTargetTile.item = { type: ItemType.Sword, isGrabbable: () => true } as Item;

            // Setup mocks
            mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', [
                'getTileAt',
                'getAdjacentActionTiles',
                'getNeighbours',
            ]);
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);

            // Setup PlayGameBoardManagerService with signal
            mockPlayGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', ['getAdjacentActionTiles'], {
                signalUserStartedMoving: jasmine.createSpyObj('Subject', ['next']),
            });

            // Inject mocked services
            service.gameMapDataManagerService = mockGameMapDataManagerService;
            service.playGameBoardManagerService = mockPlayGameBoardManagerService;

            // Setup spies
            spyOn(service, 'findNearestPossiblePlayer').and.returnValue(null);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(mockTargetTile);
            spyOn(service, 'findNearestClosedDoor').and.returnValue(null);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(mockTargetTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            // Execute
            service.handleAggressiveMovement(mockPlayer, true);

            // Assert
            expect(mockPlayGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 3, y: 3 },
                virtualPlayerId: 'player123',
            });
        });

        it('should move towards the nearest door if no player or item is found but a door is found', () => {
            // Create current tile
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };
            currentTile.player = mockPlayerEntity;

            // Create door tile
            const mockDoorTile = new WalkableTile();
            mockDoorTile.coordinates = { x: 4, y: 4 };
            mockDoorTile.type = TileType.Door;

            // Setup mocks
            mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', [
                'getTileAt',
                'getAdjacentActionTiles',
                'getNeighbours',
            ]);
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            service.gameMapDataManagerService = mockGameMapDataManagerService;

            // Setup spies
            spyOn(service, 'findNearestPossiblePlayer').and.returnValue(null);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(null);
            spyOn(service, 'findNearestClosedDoor').and.returnValue(mockDoorTile);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(mockDoorTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            // Execute
            service.handleAggressiveMovement(mockPlayer, true);

            // Assert
            expect(service.playGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 4, y: 4 },
                virtualPlayerId: 'player123',
            });
        });

        it('should signal user started moving and emit move signal if a target tile is selected', () => {
            // Create current tile for player's position
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };
            currentTile.type = TileType.Grass;
            currentTile.description = 'Current Tile';
            currentTile.imageUrl = 'mock-url';

            // Create target tile
            const mockTargetTile = new WalkableTile();
            mockTargetTile.coordinates = { x: 5, y: 5 };
            mockTargetTile.type = TileType.Grass;
            mockTargetTile.description = 'Mock Target Tile';
            mockTargetTile.imageUrl = 'mock-url';

            // Setup spies and mock returns
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile); // Mock the current tile
            spyOn(service, 'findNearestPossiblePlayer').and.returnValue(mockTargetTile);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(mockTargetTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            // Execute
            service.handleAggressiveMovement(mockPlayer, true);

            // Assert
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

            // Initialize getAdjacentActionTiles to return empty array by default
            mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([]);

            // Setup GameMapDataManagerService mock
            mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt']);

            // Initialize service with mocks
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
            // Setup
            const currentTile = new WalkableTile();
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([]);

            // Execute
            const result = service.handleDefensiveActions(mockPlayer, false);

            // Assert
            expect(result).toBeFalse();
            expect(mockGameMapDataManagerService.getTileAt).toHaveBeenCalledWith(mockPlayer.mapEntity.coordinates);
            expect(mockPlayGameBoardManagerService.getAdjacentActionTiles).toHaveBeenCalledWith(currentTile);
        });

        it('should perform door action on adjacent open door and return true', () => {
            // Create current tile and open door tile
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
            // Create current tile and open door tile with player
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
            // Create current tile and regular walkable tile
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
            // Setup player entity and character
            mockPlayerEntity = new PlayerMapEntity('avatar.png');
            mockPlayerEntity.coordinates = { x: 0, y: 0 };
            mockPlayer = {
                socketId: 'player123',
                mapEntity: mockPlayerEntity,
            } as PlayerCharacter;

            // Setup WebSocketService mock
            mockWebSocketService.getRoomInfo.and.returnValue({
                players: [],
                id: '',
                accessCode: 0,
                isLocked: false,
                maxPlayers: 0,
                currentPlayerTurn: '',
                organizer: '',
            });

            // Setup mock services with signals
            mockPlayGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', ['getAdjacentActionTiles'], {
                signalUserStartedMoving: jasmine.createSpyObj('Subject', ['next']),
            });

            // Setup signals
            service.signalMoveVirtualPlayer = jasmine.createSpyObj('Subject', ['next']);
            service.signalVirtualPlayerEndedTurn = jasmine.createSpyObj('Subject', ['next']);

            // Setup service with mocks
            service.playGameBoardManagerService = mockPlayGameBoardManagerService;
            service.gameMapDataManagerService = mockGameMapDataManagerService;
        });

        it('should move towards nearest item if available', () => {
            // Create current tile
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };

            // Create item tile
            const itemTile = new TerrainTile();
            itemTile.coordinates = { x: 1, y: 1 };
            itemTile.item = { type: ItemType.MagicShield } as Item;

            // Setup mocks
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(itemTile);
            spyOn(service, 'findNearestOpenDoor').and.returnValue(null);
            spyOn(service, 'findFurthestTileFromPlayers').and.returnValue(null);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(itemTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            // Execute
            service.handleDefensiveMovement(mockPlayer, true);

            // Assert
            expect(service.playGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 1, y: 1 },
                virtualPlayerId: 'player123',
            });
        });

        it('should move towards nearest open door if no items available', () => {
            // Create current tile
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };

            // Create open door tile
            const openDoorTile = new OpenDoor();
            openDoorTile.coordinates = { x: 2, y: 2 };

            // Setup mocks
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(null);
            spyOn(service, 'findNearestOpenDoor').and.returnValue(openDoorTile);
            spyOn(service, 'findFurthestTileFromPlayers').and.returnValue(null);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(openDoorTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            // Execute
            service.handleDefensiveMovement(mockPlayer, true);

            // Assert
            expect(service.playGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 2, y: 2 },
                virtualPlayerId: 'player123',
            });
        });

        it('should move to furthest tile from players if no items or doors available', () => {
            // Create current tile
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };

            // Create furthest tile
            const furthestTile = new WalkableTile();
            furthestTile.coordinates = { x: 3, y: 3 };

            // Setup mocks
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(null);
            spyOn(service, 'findNearestOpenDoor').and.returnValue(null);
            spyOn(service, 'findFurthestTileFromPlayers').and.returnValue(furthestTile);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(furthestTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            // Execute
            service.handleDefensiveMovement(mockPlayer, true);

            // Assert
            expect(service.playGameBoardManagerService.signalUserStartedMoving.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).toHaveBeenCalledWith({
                coordinates: { x: 3, y: 3 },
                virtualPlayerId: 'player123',
            });
        });

        it('should end turn if no valid moves available and turn not started', () => {
            // Create current tile
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };

            // Setup mocks
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(null);
            spyOn(service, 'findNearestOpenDoor').and.returnValue(null);
            spyOn(service, 'findFurthestTileFromPlayers').and.returnValue(null);

            const possibleMoves = new Map<Tile, Tile[]>();
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            // Execute
            service.handleDefensiveMovement(mockPlayer, false);

            // Assert
            expect(service.signalVirtualPlayerEndedTurn.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).not.toHaveBeenCalled();
        });

        it('should not move if player is already at target tile', () => {
            // Create current tile
            const currentTile = new WalkableTile();
            currentTile.coordinates = { x: 0, y: 0 };

            // Create target tile as TerrainTile with item
            const targetTile = new TerrainTile();
            targetTile.coordinates = { x: 0, y: 0 };
            targetTile.item = { type: ItemType.MagicShield } as Item; // Add an item

            // Setup mocks
            mockGameMapDataManagerService.getTileAt.and.returnValue(currentTile);
            spyOn(service, 'findNearestPossibleItem').and.returnValue(targetTile);

            const possibleMoves = new Map<Tile, Tile[]>();
            possibleMoves.set(targetTile, []);
            spyOn(service, 'setPossibleMoves').and.returnValue(possibleMoves);

            // Execute
            service.handleDefensiveMovement(mockPlayer, true);

            // Assert
            expect(service.signalVirtualPlayerEndedTurn.next).toHaveBeenCalledWith('player123');
            expect(service.signalMoveVirtualPlayer.next).not.toHaveBeenCalled();
        });
    });
});
