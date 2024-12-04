/* eslint-disable max-lines */ // impossible to instantiate the service without these parameters
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ErrorModalComponent } from '@app/components/map-editor-components/validation-modal/error-modal/error-modal.component';
import { Pathfinder } from '@app/services/game-board-services/path-finder/path-finder';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory/tile-factory.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication/game-server-communication.service';
import { DiamondSword } from '@common/classes/Items/diamond-sword';
import { Spawn } from '@common/classes/Items/spawn';
import { PlayerMapEntity } from '@common/classes/Player/player-map-entity';
import { DoorTile } from '@common/classes/Tiles/door-tile';
import { GrassTile } from '@common/classes/Tiles/grass-tile';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';
import { WallTile } from '@common/classes/Tiles/wall-tile';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';
import { GameShared } from '@common/interfaces/game-shared';
import { TileShared } from '@common/interfaces/tile-shared';
import { Vec2 } from '@common/interfaces/vec2';
import { of, throwError } from 'rxjs';
import { GameMapDataManagerService } from './game-map-data-manager.service';

describe('GameMapDataManagerService', () => {
    let service: GameMapDataManagerService;
    let tileFactoryServiceSpy: jasmine.SpyObj<TileFactoryService>;
    let gameServerCommunicationServiceSpy: jasmine.SpyObj<GameServerCommunicationService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const tileFactorySpy = jasmine.createSpyObj('TileFactoryService', ['loadGridFromJSON']);
        const gameServerSpy = jasmine.createSpyObj('GameServerCommunicationService', ['addGame', 'updateGame']);
        const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                GameMapDataManagerService,
                { provide: TileFactoryService, useValue: tileFactorySpy },
                { provide: GameServerCommunicationService, useValue: gameServerSpy },
                { provide: MatDialog, useValue: dialogSpyObj },
                { provide: Router, useValue: routerSpyObj },
            ],
        });

        service = TestBed.inject(GameMapDataManagerService);
        tileFactoryServiceSpy = TestBed.inject(TileFactoryService) as jasmine.SpyObj<TileFactoryService>;
        gameServerCommunicationServiceSpy = TestBed.inject(GameServerCommunicationService) as jasmine.SpyObj<GameServerCommunicationService>;
        dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize the game and load the grid', () => {
        const mockGame: GameShared = {
            _id: '1',
            name: 'Test Game',
            description: 'A test game',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            tiles: [],
            isVisible: true,
            imageUrl: '',
        };

        spyOn(service, 'resetGame');
        service.init(mockGame);
        expect(service['databaseGame']).toEqual(mockGame);
        expect(service['lastSavedGrid']).toEqual(mockGame.tiles);
        expect(service.resetGame).toHaveBeenCalled();
    });

    it('should reset current values and load grid', () => {
        spyOn(service, 'resetCurrentValues');
        spyOn(service, 'loadGrid');

        service.resetGame();

        expect(service['resetCurrentValues']).toHaveBeenCalled();
        expect(service['loadGrid']).toHaveBeenCalled();
    });

    it('should reset currentName, currentDescription, and currentGrid', () => {
        service['databaseGame'] = {
            _id: '1',
            name: 'Test Game',
            description: 'Test Description',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            tiles: [],
            isVisible: true,
            imageUrl: '',
        };

        service.currentName = 'Old Name';
        service.currentDescription = 'Old Description';
        service['currentGrid'] = [[new GrassTile()]];

        service['resetCurrentValues']();

        expect(service.currentName).toBe('Test Game');
        expect(service.currentDescription).toBe('Test Description');
        expect(service['currentGrid']).toEqual([]);
    });

    describe('#saveGame', () => {
        beforeEach(() => {
            service['databaseGame'] = {
                _id: undefined,
                name: 'New Game',
                description: 'A new game',
                size: MapSize.SMALL,
                mode: GameMode.Classique,
                tiles: [],
                isVisible: true,
                imageUrl: '',
            };
            service.currentName = 'New Game';
            service.currentDescription = 'A new game';
        });

        it('should create a new game in the database', () => {
            gameServerCommunicationServiceSpy.addGame.and.returnValue(
                of({
                    _id: '1',
                    name: 'New Game',
                    description: 'A new game',
                    size: MapSize.SMALL,
                    mode: GameMode.Classique,
                    tiles: [],
                    isVisible: true,
                    imageUrl: '',
                } as GameShared),
            );
            spyOn(service, 'saveMap');
            service.saveGame();

            expect(gameServerCommunicationServiceSpy.addGame).toHaveBeenCalledWith(service['databaseGame']);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/administration-game']);
        });

        it('should return early if hasValidNameAndDescription returns false', () => {
            service['databaseGame'] = {
                _id: '1',
                name: 'Test Game',
                description: 'A test game',
                size: MapSize.SMALL,
                mode: GameMode.Classique,
                tiles: [],
                isVisible: true,
                imageUrl: '',
            };

            spyOn(service, 'hasValidNameAndDescription').and.returnValue(false);

            spyOn(service, 'saveMap');
            spyOn(service, 'createGameInDb');
            spyOn(service, 'saveGameInDb');

            service.saveGame();

            expect(service['saveMap']).not.toHaveBeenCalled();
            expect(service['createGameInDb']).not.toHaveBeenCalled();
            expect(service['saveGameInDb']).not.toHaveBeenCalled();
        });

        it('should update an existing game in the database', () => {
            service['databaseGame']._id = '1';
            gameServerCommunicationServiceSpy.updateGame.and.returnValue(of(void 0));
            spyOn(service, 'saveMap');
            service.saveGame();

            expect(gameServerCommunicationServiceSpy.updateGame).toHaveBeenCalledWith('1', service['databaseGame']);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/administration-game']);
        });

        it('should show error modal on save error', () => {
            const mockError = ['Save error'];
            gameServerCommunicationServiceSpy.addGame.and.returnValue(throwError(() => mockError));

            service.saveGame();

            expect(dialogSpy.open).toHaveBeenCalledWith(ErrorModalComponent, {
                data: { message: mockError.join('<br>') },
            });
        });
    });

    it('should convert JSON file to GameShared object', async () => {
        const mockJson = {
            _id: '1',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-02T00:00:00.000Z',
            name: 'Test Game',
            description: 'A test game',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            imageUrl: 'http://example.com/image.png',
            tiles: [[{ type: TileType.Grass }]],
        };
        const mockFile = new File([JSON.stringify(mockJson)], 'test.json', { type: 'application/json' });

        const result = await service.convertJsonToGameShared(mockFile);

        expect(result).toEqual({
            _id: '1',
            createdAt: new Date('2023-01-01T00:00:00.000Z'),
            updatedAt: new Date('2023-01-02T00:00:00.000Z'),
            name: 'Test Game',
            description: 'A test game',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            imageUrl: 'http://example.com/image.png',
            isVisible: false,
            tiles: [[{ type: TileType.Grass }]],
        });
    });

    it('should handle JSON file with missing optional fields', async () => {
        const mockJson = {
            _id: '1',
            name: 'Test Game',
            description: 'A test game',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            imageUrl: 'http://example.com/image.png',
            tiles: [[{ type: TileType.Grass }]],
        };
        const mockFile = new File([JSON.stringify(mockJson)], 'test.json', { type: 'application/json' });

        const result = await service.convertJsonToGameShared(mockFile);

        expect(result).toEqual({
            _id: '1',
            createdAt: undefined,
            updatedAt: undefined,
            name: 'Test Game',
            description: 'A test game',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            imageUrl: 'http://example.com/image.png',
            isVisible: false,
            tiles: [[{ type: TileType.Grass }]],
        });
    });

    it('should throw an error for invalid JSON file', async () => {
        const invalidJson = '{ invalid json }';
        const mockFile = new File([invalidJson], 'test.json', { type: 'application/json' });

        await expectAsync(service.convertJsonToGameShared(mockFile)).toBeRejectedWithError(SyntaxError);
    });

    it('should create a new grid for a new game', () => {
        service['databaseGame'] = {
            _id: undefined,
            name: 'New Game',
            description: 'A new game',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            tiles: [],
            isVisible: true,
            imageUrl: '',
        };

        spyOn(service, 'createNewGrid');
        service['loadGrid']();

        expect(service['createNewGrid']).toHaveBeenCalled();
    });

    it('should create a new grid with GrassTiles and set coordinates', () => {
        service['databaseGame'] = {
            _id: '1',
            name: 'Test Game',
            description: 'A test game',
            size: MapSize.LARGE,
            mode: GameMode.Classique,
            tiles: [],
            isVisible: true,
            imageUrl: '',
        };

        service['createNewGrid']();
        const largeMapLenght = 20;
        expect(service['currentGrid'].length).toBe(largeMapLenght);
        expect(service['currentGrid'][0].length).toBe(largeMapLenght);
        expect(service['currentGrid'][1].length).toBe(largeMapLenght);

        expect(service['currentGrid'][0][0]).toBeInstanceOf(GrassTile);
        expect(service['currentGrid'][0][1]).toBeInstanceOf(GrassTile);
        expect(service['currentGrid'][1][0]).toBeInstanceOf(GrassTile);
        expect(service['currentGrid'][1][1]).toBeInstanceOf(GrassTile);

        expect(service['currentGrid'][0][0].coordinates).toEqual({ x: 0, y: 0 });
        expect(service['currentGrid'][0][1].coordinates).toEqual({ x: 0, y: 1 });
        expect(service['currentGrid'][1][0].coordinates).toEqual({ x: 1, y: 0 });
        expect(service['currentGrid'][1][1].coordinates).toEqual({ x: 1, y: 1 });

        expect(service['lastSavedGrid'][0][0]).toEqual({ type: TileType.Grass });
        expect(service['lastSavedGrid'][0][1]).toEqual({ type: TileType.Grass });
        expect(service['lastSavedGrid'][1][0]).toEqual({ type: TileType.Grass });
        expect(service['lastSavedGrid'][1][1]).toEqual({ type: TileType.Grass });
    });

    it('should load the last saved grid for an existing game', () => {
        const mockTiles: TileShared[][] = [[{ type: TileType.Grass }]];
        service['databaseGame'] = {
            _id: '1',
            name: 'Existing Game',
            description: 'A game with saved tiles',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            tiles: mockTiles,
            isVisible: true,
            imageUrl: '',
        };

        service['lastSavedGrid'] = mockTiles;
        tileFactoryServiceSpy.loadGridFromJSON.and.returnValue([[new GrassTile()]]);
        service['loadGrid']();

        expect(tileFactoryServiceSpy.loadGridFromJSON).toHaveBeenCalledWith(mockTiles);
    });

    it('should save the current grid to the game tiles', () => {
        service['databaseGame'] = {
            _id: '1',
            name: 'Existing Game',
            description: 'A game with an empty grid',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            tiles: [],
            isVisible: true,
            imageUrl: '',
        };
        service['currentGrid'] = [[new GrassTile()]];

        service['saveMap']();

        expect(service['databaseGame'].tiles.length).toBe(1);
        expect(service['databaseGame'].tiles[0][0].type).toBe(TileType.Grass);
    });

    describe('#saveMap', () => {
        beforeEach(() => {
            service['databaseGame'] = {
                _id: '1',
                name: 'Test Game',
                description: 'A test game',
                size: MapSize.MEDIUM,
                mode: GameMode.Classique,
                tiles: [],
                isVisible: true,
                imageUrl: '',
            };
        });

        it('should save terrain tiles with items to databaseGame.tiles', () => {
            const terrainTile = new GrassTile() as TerrainTile;
            terrainTile.item = new DiamondSword();

            service['currentGrid'] = [[terrainTile]];

            service['saveMap']();

            expect(service['databaseGame'].tiles.length).toBe(1);
            expect(service['databaseGame'].tiles[0][0]).toEqual({
                type: terrainTile.type,
                item: { type: terrainTile.item.type },
            });
        });

        it('should save terrain tiles without items to databaseGame.tiles', () => {
            const terrainTile = new GrassTile() as TerrainTile;
            terrainTile.item = null;

            service['currentGrid'] = [[terrainTile]];

            service['saveMap']();

            expect(service['databaseGame'].tiles.length).toBe(1);
            expect(service['databaseGame'].tiles[0][0]).toEqual({
                type: terrainTile.type,
                item: null,
            });
        });

        it('should save non-terrain tiles to databaseGame.tiles', () => {
            const nonTerrainTile = new GrassTile();
            spyOn(nonTerrainTile, 'isTerrain').and.returnValue(false);

            service['currentGrid'] = [[nonTerrainTile]];

            service['saveMap']();

            expect(service['databaseGame'].tiles.length).toBe(1);
            expect(service['databaseGame'].tiles[0][0]).toEqual({ type: nonTerrainTile.type });
        });
    });

    it('should open an error modal with a string message', () => {
        service.openErrorModal('An error occurred');
        expect(dialogSpy.open).toHaveBeenCalledWith(ErrorModalComponent, {
            data: { message: 'An error occurred' },
        });
    });

    it('should open an error modal with an array of messages', () => {
        const errors = ['Error 1', 'Error 2'];
        service.openErrorModal(errors);
        expect(dialogSpy.open).toHaveBeenCalledWith(ErrorModalComponent, {
            data: { message: errors.join('<br>') },
        });
    });

    describe('#saveGameInDb', () => {
        beforeEach(() => {
            service['databaseGame'] = {
                _id: '1',
                name: 'Test Game',
                description: 'A test game',
                size: MapSize.SMALL,
                mode: GameMode.Classique,
                tiles: [],
                isVisible: true,
                imageUrl: '',
            };
        });

        it('should return early if databaseGame._id is not defined', () => {
            service['databaseGame']._id = undefined;

            service['saveGameInDb']();

            expect(gameServerCommunicationServiceSpy.updateGame).not.toHaveBeenCalled();
        });

        it('should call updateGame and navigate to /administration-game on success', () => {
            gameServerCommunicationServiceSpy.updateGame.and.returnValue(of(void 0)); // Mock success response

            service['saveGameInDb']();

            expect(gameServerCommunicationServiceSpy.updateGame).toHaveBeenCalledWith('1', service['databaseGame']);

            expect(routerSpy.navigate).toHaveBeenCalledWith(['/administration-game']);
        });

        it('should open error modal if updateGame fails', () => {
            const mockError = ['Update error'];
            gameServerCommunicationServiceSpy.updateGame.and.returnValue(throwError(() => mockError)); // Mock error

            service['saveGameInDb']();

            expect(dialogSpy.open).toHaveBeenCalledWith(ErrorModalComponent, {
                data: { message: mockError.join('<br>') },
            });
        });
    });

    it('should return the current grid', () => {
        const mockGrid = [
            [new GrassTile(), new GrassTile()],
            [new GrassTile(), new GrassTile()],
        ];
        service['currentGrid'] = mockGrid;

        const result = service.getCurrentGrid();

        expect(result).toBe(mockGrid);
    });

    it('should store isNewGame and gameToEdit in localStorage', () => {
        const isNewGame = true;
        const mockGame: GameShared = {
            _id: '1',
            name: 'Test Game',
            description: 'A test game',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            tiles: [],
            isVisible: true,
            imageUrl: '',
        };

        spyOn(localStorage, 'setItem');

        service.setLocalStorageVariables(isNewGame, mockGame);

        expect(localStorage.setItem).toHaveBeenCalledWith('isNewGame', JSON.stringify(isNewGame));
        expect(localStorage.setItem).toHaveBeenCalledWith('gameToEdit', JSON.stringify(mockGame));
    });

    it('should return true when isNewGame is stored as true in localStorage', () => {
        spyOn(localStorage, 'getItem').and.returnValue('true');

        const result = service.getLocalStorageIsNewGame();

        expect(result).toBeTrue();
    });

    it('should return false when isNewGame is stored as false in localStorage', () => {
        spyOn(localStorage, 'getItem').and.returnValue('false');

        const result = service.getLocalStorageIsNewGame();

        expect(result).toBeFalse();
    });

    it('should return false when isNewGame is not set in localStorage', () => {
        spyOn(localStorage, 'getItem').and.returnValue(null);

        const result = service.getLocalStorageIsNewGame();

        expect(result).toBeFalse();
    });

    it('should return false when isNewGame contains invalid data in localStorage', () => {
        spyOn(localStorage, 'getItem').and.returnValue('false');

        const result = service.getLocalStorageIsNewGame();

        expect(result).toBeFalse();
    });

    it('should return the gameToEdit object when it is stored in localStorage', () => {
        const mockGame = {
            _id: '1',
            name: 'Test Game',
            description: 'A test game',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            tiles: [],
            isVisible: true,
            imageUrl: '',
        };

        spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockGame));

        const result = service.getLocalStorageGameToEdit();

        expect(result).toEqual(mockGame);
    });

    it('should return an empty object if gameToEdit is not set in localStorage', () => {
        spyOn(localStorage, 'getItem').and.returnValue(null);

        const result = service.getLocalStorageGameToEdit();

        expect(result).toEqual({} as GameShared);
    });

    it('should return an empty object if gameToEdit is an invalid JSON string', () => {
        spyOn(localStorage, 'getItem').and.returnValue('{}');

        const result = service.getLocalStorageGameToEdit();

        expect(result).toEqual({} as GameShared);
    });

    it('should return true when the game mode is CTF', () => {
        service['databaseGame'] = {
            _id: '1',
            name: 'CTF Game',
            description: 'A CTF game',
            size: MapSize.SMALL,
            mode: GameMode.CTF,
            tiles: [],
            isVisible: true,
            imageUrl: '',
        };

        const result = service.isGameModeCTF();

        expect(result).toBeTrue();
    });

    it('should return false when the game mode is not CTF', () => {
        service['databaseGame'] = {
            _id: '1',
            name: 'Non-CTF Game',
            description: 'A non-CTF game',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            tiles: [],
            isVisible: true,
            imageUrl: '',
        };

        const result = service.isGameModeCTF();

        expect(result).toBeFalse();
    });

    it('should return the game size from databaseGame', () => {
        service['databaseGame'] = {
            _id: '1',
            name: 'Test Game',
            description: 'A test game',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            tiles: [],
            isVisible: true,
            imageUrl: '',
        };

        const result = service.gameSize();

        expect(result).toBe(MapSize.SMALL);
    });

    it('should return the game size when it is set to LARGE', () => {
        service['databaseGame'] = {
            _id: '2',
            name: 'Another Test Game',
            description: 'Another test game',
            size: MapSize.LARGE,
            mode: GameMode.Classique,
            tiles: [],
            isVisible: true,
            imageUrl: '',
        };

        const result = service.gameSize();

        expect(result).toBe(MapSize.LARGE);
    });
    it('should return 2 when the game size is SMALL', () => {
        spyOn(service, 'gameSize').and.returnValue(MapSize.SMALL);

        const result = service.itemLimit();

        expect(result).toBe(2);
    });

    it('should return 4 when the game size is MEDIUM', () => {
        spyOn(service, 'gameSize').and.returnValue(MapSize.MEDIUM);

        const result = service.itemLimit();

        const itemLimit = 4;
        expect(result).toBe(itemLimit);
    });

    it('should return 6 when the game size is LARGE', () => {
        spyOn(service, 'gameSize').and.returnValue(MapSize.LARGE);

        const result = service.itemLimit();

        const itemLimit = 6;
        expect(result).toBe(itemLimit);
    });

    it('should return the correct tile based on the coordinates', () => {
        const tile1 = new GrassTile();
        const tile2 = new GrassTile();
        const tile3 = new GrassTile();
        const tile4 = new GrassTile();

        service['currentGrid'] = [
            [tile1, tile2],
            [tile3, tile4],
        ];

        const result1 = service.getTileAt({ x: 0, y: 0 });

        const result2 = service.getTileAt({ x: 1, y: 1 });

        expect(result1).toBe(tile1);

        expect(result2).toBe(tile4);
    });

    it('should return an array of terrain tiles with spawn items', () => {
        const spawnTile1 = new GrassTile();
        spawnTile1.item = new Spawn();

        const spawnTile2 = new GrassTile() as TerrainTile;
        spawnTile2.item = new Spawn();

        const nonSpawnTile = new GrassTile();

        service['currentGrid'] = [
            [spawnTile1, nonSpawnTile],
            [nonSpawnTile, spawnTile2],
        ];

        const result = service.getTilesWithSpawn();

        expect(result).toContain(spawnTile1);
        expect(result).toContain(spawnTile2);
        expect(result).not.toContain(nonSpawnTile);
    });

    describe('getTerrainTilesCount', () => {
        it('should return the correct count of terrain tiles', () => {
            const terrainTile1 = new GrassTile();
            const terrainTile2 = new GrassTile();
            const nonTerrainTile = new WallTile();

            service['currentGrid'] = [
                [terrainTile1, nonTerrainTile],
                [nonTerrainTile, terrainTile2],
            ];

            const result = service.getTerrainTilesCount();

            expect(result).toBe(2);
        });
    });

    describe('getDoorsCount', () => {
        it('should return the correct count of door tiles', () => {
            const doorTile1 = new DoorTile();
            const doorTile2 = new DoorTile();
            const nonDoorTile = new GrassTile();

            service['currentGrid'] = [
                [doorTile1, nonDoorTile],
                [nonDoorTile, doorTile2],
            ];

            const result = service.getDoorsCount();

            expect(result).toBe(2);
        });
    });

    it('should call findAllReachableTiles on Pathfinder with the correct coordinates and movePoints', () => {
        const startCoordinates: Vec2 = { x: 1, y: 1 };
        const movePoints = 3;
        const mockResult = new Map<Tile, Tile[]>();

        const pathfinderSpy = spyOn(Pathfinder.prototype, 'findAllReachableTiles').and.returnValue(mockResult);

        const result = service.getPossibleMovementTiles(startCoordinates, movePoints);

        expect(pathfinderSpy).toHaveBeenCalledWith(startCoordinates);
        expect(result).toBe(mockResult);
    });

    it('should return null if the coordinates are out of bounds', () => {
        const outOfBoundsCoordinates: Vec2 = { x: -1, y: -1 };
        service['currentGrid'] = [[new GrassTile(), new GrassTile()]]; // 1x2 grid for testing

        const result = service.getTileAt(outOfBoundsCoordinates);

        expect(result).toBeNull();
    });

    it('should start searching from the player’s spawn coordinates', () => {
        const spawnCoordinates: Vec2 = { x: 3, y: 3 };
        const mockPlayer = { spawnCoordinates } as PlayerMapEntity;

        const getTileAtSpy = spyOn(service, 'getTileAt').and.returnValue(null);

        try {
            service.getClosestWalkableTileWithoutPlayerAt(mockPlayer);
        } catch (e) {
            // Handle the error or log it if necessary
        }
        expect(getTileAtSpy).toHaveBeenCalledWith(spawnCoordinates);
    });

    describe('getClosestWalkableTileWithoutPlayerAt', () => {
        let mockPlayer: PlayerMapEntity;
        let spawnCoordinates: Vec2;

        beforeEach(() => {
            spawnCoordinates = { x: 3, y: 3 };
            mockPlayer = { spawnCoordinates } as PlayerMapEntity;
        });

        it('should return the tile if it is walkable and has no player', () => {
            // Arrange
            const tile = new WalkableTile();
            tile.coordinates = spawnCoordinates;
            spyOn(tile, 'isWalkable').and.returnValue(true);
            spyOn(tile, 'hasPlayer').and.returnValue(false);

            spyOn(service, 'getTileAt').and.returnValue(tile);

            // Act
            const result = service.getClosestWalkableTileWithoutPlayerAt(mockPlayer);

            // Assert
            expect(result).toBe(tile);
        });

        it('should return the tile if it is walkable and has the same player as mapPlayer', () => {
            // Arrange
            const tile = new WalkableTile();
            tile.coordinates = spawnCoordinates;
            tile.player = mockPlayer;
            spyOn(tile, 'isWalkable').and.returnValue(true);
            spyOn(tile, 'hasPlayer').and.returnValue(true);

            spyOn(service, 'getTileAt').and.returnValue(tile);

            // Act
            const result = service.getClosestWalkableTileWithoutPlayerAt(mockPlayer);

            // Assert
            expect(result).toBe(tile);
        });

        it('should not return the tile if it is walkable but has a different player', () => {
            // Arrange
            const tile = new WalkableTile();
            tile.coordinates = spawnCoordinates;
            tile.player = {} as PlayerMapEntity; // Different player
            spyOn(tile, 'isWalkable').and.returnValue(true);
            spyOn(tile, 'hasPlayer').and.returnValue(true);

            spyOn(service, 'getTileAt').and.returnValue(tile);

            // Act & Assert
            expect(() => service.getClosestWalkableTileWithoutPlayerAt(mockPlayer)).toThrowError('No walkable tile found');
        });
    });

    describe('getClosestTerrainTileWithoutItemAt', () => {
        const startTile = new GrassTile();
        beforeEach(() => {
            service['currentGrid'] = [
                [startTile, new GrassTile(), new GrassTile()],
                [new GrassTile(), new GrassTile(), new GrassTile()],
                [new GrassTile(), new GrassTile(), new GrassTile()],
            ];
            for (let row = 0; row < service['currentGrid'].length; row++) {
                for (let col = 0; col < service['currentGrid'][row].length; col++) {
                    service['currentGrid'][row][col].coordinates = { x: row, y: col };
                }
            }
        });

        it('should return the startTile if it is a terrain tile and has no item', () => {
            startTile.item = null;

            const result = service.getClosestTerrainTileWithoutItemAt(startTile);

            expect(result).toBe(startTile);
        });

        it('should return a neighbor tile if start tile has an item', () => {
            startTile.item = new DiamondSword();

            const result = service.getClosestTerrainTileWithoutItemAt(startTile);

            expect(result).not.toBe(startTile);
        });

        it('should return a far neighbor tile, if all direct neighbors have items', () => {
            startTile.item = new DiamondSword();
            (service['currentGrid'][0][1] as TerrainTile).item = new DiamondSword();
            (service['currentGrid'][1][0] as TerrainTile).item = new DiamondSword();

            const result = service.getClosestTerrainTileWithoutItemAt(startTile);

            expect(result).not.toBe(startTile);
            expect(result).not.toBe(service['currentGrid'][0][1] as TerrainTile);
            expect(result).not.toBe(service['currentGrid'][1][0] as TerrainTile);
        });

        it('should throw error if no terrain tile found', () => {
            startTile.item = new DiamondSword();
            spyOn(service, 'getNeighbours').and.returnValue([]);

            expect(() => service.getClosestTerrainTileWithoutItemAt(startTile)).toThrowError('No terrain tile found');
        });
    });

    describe('getClosestWalkableTileWithoutPlayerAt', () => {
        const spawnTile = new GrassTile();
        const playerMapEntity = new PlayerMapEntity('player');
        playerMapEntity.spawnCoordinates = { x: 0, y: 0 };

        beforeEach(() => {
            service['currentGrid'] = [
                [spawnTile, new GrassTile(), new GrassTile()],
                [new GrassTile(), new GrassTile(), new GrassTile()],
                [new GrassTile(), new GrassTile(), new GrassTile()],
            ];
            for (let row = 0; row < service['currentGrid'].length; row++) {
                for (let col = 0; col < service['currentGrid'][row].length; col++) {
                    service['currentGrid'][row][col].coordinates = { x: row, y: col };
                }
            }
        });

        it('should return the spawnTile if it is a walkable tile and has no player', () => {
            spawnTile.player = null;
            const result = service.getClosestWalkableTileWithoutPlayerAt(playerMapEntity);

            expect(result).toBe(spawnTile);
        });

        it('should return a neighbor tile if spawnTile has another player', () => {
            const otherMapEntity = new PlayerMapEntity('player2');
            spawnTile.player = otherMapEntity;

            const result = service.getClosestWalkableTileWithoutPlayerAt(playerMapEntity);

            expect(result).not.toBe(spawnTile);
        });

        it('should return a far neighbor tile, if all direct neighbors have players', () => {
            const otherMapEntity = new PlayerMapEntity('player2');
            const otherMapEntity2 = new PlayerMapEntity('player3');
            const otherMapEntity3 = new PlayerMapEntity('player4');
            spawnTile.player = otherMapEntity;
            (service['currentGrid'][0][1] as TerrainTile).player = otherMapEntity2;
            (service['currentGrid'][1][0] as TerrainTile).player = otherMapEntity3;

            const result = service.getClosestWalkableTileWithoutPlayerAt(playerMapEntity);

            expect(result).not.toBe(spawnTile);
            expect(result).not.toBe(service['currentGrid'][0][1] as TerrainTile);
            expect(result).not.toBe(service['currentGrid'][1][0] as TerrainTile);
        });

        it('should throw error if no walkable tile found', () => {
            const otherMapEntity = new PlayerMapEntity('player2');
            spawnTile.player = otherMapEntity;
            spyOn(service, 'getNeighbours').and.returnValue([]);

            expect(() => service.getClosestWalkableTileWithoutPlayerAt(playerMapEntity)).toThrowError('No walkable tile found');
        });
    });

    it('should set the specified tile at the given coordinates in the current grid', () => {
        // Arrange
        const coordinates: Vec2 = { x: 1, y: 1 };
        const newTile = new GrassTile();

        // Initialize a 2x2 grid with placeholder tiles
        const initialTile = new GrassTile();
        service['currentGrid'] = [
            [initialTile, initialTile],
            [initialTile, initialTile],
        ];

        // Act
        service.setTileAt(coordinates, newTile);

        // Assert
        expect(service['currentGrid'][coordinates.x][coordinates.y]).toBe(newTile);
    });
});
