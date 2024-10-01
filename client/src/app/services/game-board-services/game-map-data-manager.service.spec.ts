import { TestBed } from '@angular/core/testing';
import { Item } from '@app/classes/Items/item';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { OpenDoor } from '@app/classes/Tiles/open-door';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { WallTile } from '@app/classes/Tiles/wall-tile';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { GameMode } from '@common/enums/game-mode';
import { ItemType } from '@common/enums/item-type';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';
import { GameShared } from '@common/interfaces/game-shared';
import { of } from 'rxjs';
import { GameMapDataManagerService } from './game-map-data-manager.service';
import { ItemFactoryService } from './item-factory.service';
import { TileFactoryService } from './tile-factory.service';

describe('GameMapDataManagerService', () => {
    let service: GameMapDataManagerService;
    let tileFactoryServiceSpy: jasmine.SpyObj<TileFactoryService>;
    let gameServerCommunicationServiceSpy: jasmine.SpyObj<GameServerCommunicationService>;

    beforeEach(() => {
        const tileSpy = jasmine.createSpyObj('TileFactoryService', ['createTile']);
        const itemSpy = jasmine.createSpyObj('ItemFactoryService', ['createItem']);
        const gameServerSpy = jasmine.createSpyObj('GameServerCommunicationService', ['addGame', 'updateGame']);

        TestBed.configureTestingModule({
            providers: [
                GameMapDataManagerService,
                { provide: TileFactoryService, useValue: tileSpy },
                { provide: ItemFactoryService, useValue: itemSpy },
                { provide: GameServerCommunicationService, useValue: gameServerSpy },
            ],
        });

        service = TestBed.inject(GameMapDataManagerService);
        tileFactoryServiceSpy = TestBed.inject(TileFactoryService) as jasmine.SpyObj<TileFactoryService>;
        gameServerCommunicationServiceSpy = TestBed.inject(GameServerCommunicationService) as jasmine.SpyObj<GameServerCommunicationService>;

        // Clear localStorage before each test
        localStorage.clear();
    });

    it('should initialize a new game and create a new grid', () => {
        const mockGame: GameShared = {
            _id: undefined,
            name: 'New Game',
            description: 'A brand new game',
            mode: GameMode.CTF,
            size: MapSize.SMALL,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };

        service.newGame(mockGame);

        expect(service.databaseGame).toEqual(mockGame);
        expect(service.currentName).toBe(mockGame.name);
        expect(service.currentDescription).toBe(mockGame.description);
        expect(service.currentGrid.length).toBe(mockGame.size);

        expect(service.databaseGame.tiles.length).toBe(mockGame.size);
    });

    it('should load an existing game and initialize the grid', () => {
        const mockGame: GameShared = {
            _id: '12345',
            name: 'Loaded Game',
            description: 'A loaded game',
            mode: GameMode.CTF,
            size: MapSize.SMALL,
            tiles: [
                [{ type: TileType.Grass }, { type: TileType.Door }],
                [{ type: TileType.Grass }, { type: TileType.OpenDoor }],
            ],
            imageUrl: '',
            isVisible: false,
        };

        // Mock tileFactoryService to return appropriate tiles
        tileFactoryServiceSpy.createTile.and.callFake((type: TileType) => {
            if (type === TileType.Grass) {
                return new GrassTile();
            } else if (type === TileType.Door) {
                const doorTile = new DoorTile();
                doorTile.type = type;
                return doorTile;
            } else if (type === TileType.OpenDoor) {
                const openDoorTile = new OpenDoor();
                openDoorTile.type = type;
                return openDoorTile;
            } else {
                return new GrassTile();
            }
        });

        service.loadGame(mockGame);

        expect(service.databaseGame).toEqual(mockGame);
        expect(service.currentGrid.length).toBe(mockGame.tiles.length);
        expect(tileFactoryServiceSpy.createTile).toHaveBeenCalledTimes(4);
    });

    it('should not save if name or description is invalid', () => {
        service.currentName = '';
        service.currentDescription = 'Valid Description';
        spyOn(service, 'hasValidNameAndDescription').and.returnValue(false);

        service.save();

        expect(gameServerCommunicationServiceSpy.addGame).not.toHaveBeenCalled();
        expect(gameServerCommunicationServiceSpy.updateGame).not.toHaveBeenCalled();
    });

    it('should create a new game in the database if _id is undefined', () => {
        service.databaseGame = {
            _id: undefined,
            name: 'Game to Save',
            description: 'Description',
            mode: GameMode.CTF,
            size: MapSize.SMALL,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };
        service.currentName = 'Game to Save';
        service.currentDescription = 'Description';

        const returnedGame: GameShared = { ...service.databaseGame, _id: 'new_id' };
        gameServerCommunicationServiceSpy.addGame.and.returnValue(of(returnedGame));

        service.save();

        expect(gameServerCommunicationServiceSpy.addGame).toHaveBeenCalledWith(service.databaseGame);
        expect(service.databaseGame._id).toBe('new_id');
        expect(service.isGameUpdated).toBeFalse();
        expect(localStorage.getItem('isNewGame')).toBe('false');
        expect(localStorage.getItem('gameToEdit')).toEqual(JSON.stringify(returnedGame));
    });

    it('should update an existing game in the database if _id is defined', () => {
        service.databaseGame = {
            _id: 'existing_id',
            name: 'Existing Game',
            description: 'Existing Description',
            mode: GameMode.CTF,
            size: MapSize.LARGE,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };
        service.currentName = 'Updated Game';
        service.currentDescription = 'Updated Description';
        spyOn(service, 'hasValidNameAndDescription').and.returnValue(true);
        spyOn(service, 'saveGameInDb').and.callFake(() => {});

        service.save();
        expect(service.isGameUpdated).toBeFalse();
        expect(service.saveGameInDb).toHaveBeenCalled();
    });

    it('should set and get local storage variables correctly', () => {
        const isNewGame = true;
        const mockGame: GameShared = {
            _id: '123',
            name: 'Local Storage Game',
            description: 'Stored in local storage',
            mode: GameMode.CTF,
            size: MapSize.MEDIUM,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };

        service.setLocalStorageVariables(isNewGame, mockGame);

        expect(localStorage.getItem('isNewGame')).toBe(JSON.stringify(isNewGame));
        expect(localStorage.getItem('gameToEdit')).toBe(JSON.stringify(mockGame));

        expect(service.getLocalStorageIsNewGame()).toBeTrue();
        expect(service.getLocalStorageGameToEdit()).toEqual(mockGame);
    });

    // it('should return default values if local storage is empty', () => {
    //     expect(service.getLocalStorageIsNewGame()).toBeFalse();
    //     expect(service.getLocalStorageGameToEdit()).toEqual('{}');
    // });

    it('should call addGame and update local storage upon creation', () => {
        service.databaseGame = {
            _id: undefined,
            name: 'New Game',
            description: 'Description',
            mode: GameMode.CTF,
            size: MapSize.SMALL,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };

        const returnedGame: GameShared = { ...service.databaseGame, _id: 'new_id' };
        gameServerCommunicationServiceSpy.addGame.and.returnValue(of(returnedGame));

        service.createGameInDb();

        expect(gameServerCommunicationServiceSpy.addGame).toHaveBeenCalledWith(service.databaseGame);
        expect(service.databaseGame).toEqual(returnedGame);
        expect(localStorage.getItem('isNewGame')).toBe('false');
        expect(localStorage.getItem('gameToEdit')).toEqual(JSON.stringify(returnedGame));
    });

    it('should not save if the game is not saved', () => {
        service.databaseGame = { ...service.databaseGame, _id: undefined };
        service.saveGameInDb();

        expect(gameServerCommunicationServiceSpy.updateGame).not.toHaveBeenCalled();
    });

    it('should call setLocalStorageVariables with false and the current game when the game is saved', () => {
        // **Arrange**

        // Initialize databaseGame with a valid _id to simulate a saved game
        const mockGame: GameShared = {
            _id: 'existing_id',
            name: 'Existing Game',
            description: 'Existing Description',
            mode: GameMode.CTF,
            size: MapSize.LARGE,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };
        service.databaseGame = mockGame;

        // Spy on isSavedGame to return true
        spyOn(service, 'isSavedGame').and.returnValue(true);

        // Spy on setLocalStorageVariables to monitor its invocation
        const setLocalStorageSpy = spyOn(service, 'setLocalStorageVariables').and.callThrough();

        // Optionally, spy on updateGame if you want to verify its call as well
        gameServerCommunicationServiceSpy.updateGame.and.returnValue(of(void 0));

        // **Act**
        service.saveGameInDb();

        // **Assert**

        // Verify that updateGame was called with correct parameters
        expect(gameServerCommunicationServiceSpy.updateGame).toHaveBeenCalledWith('existing_id', mockGame);

        // Verify that setLocalStorageVariables was called once with false and the current game
        expect(setLocalStorageSpy).toHaveBeenCalledTimes(1);
        expect(setLocalStorageSpy).toHaveBeenCalledWith(false, mockGame);

        // Additionally, you can verify localStorage if needed
        expect(localStorage.getItem('isNewGame')).toBe('false');
        expect(localStorage.getItem('gameToEdit')).toEqual(JSON.stringify(mockGame));
    });

    it('should not call setLocalStorageVariables if the game is not saved', () => {
        // **Arrange**

        // Initialize databaseGame without an _id to simulate an unsaved game
        const mockGame: GameShared = {
            _id: undefined,
            name: 'Unsaved Game',
            description: 'Unsaved Description',
            mode: GameMode.CTF,
            size: MapSize.MEDIUM,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };
        service.databaseGame = mockGame;

        // Spy on isSavedGame to return false
        spyOn(service, 'isSavedGame').and.returnValue(false);

        // Spy on setLocalStorageVariables to monitor its invocation
        const setLocalStorageSpy = spyOn(service, 'setLocalStorageVariables').and.callThrough();

        // **Act**
        service.saveGameInDb();

        // **Assert**

        // Verify that updateGame was not called
        expect(gameServerCommunicationServiceSpy.updateGame).not.toHaveBeenCalled();

        // Verify that setLocalStorageVariables was not called
        expect(setLocalStorageSpy).not.toHaveBeenCalled();

        // Additionally, verify that localStorage remains unchanged
        expect(localStorage.getItem('isNewGame')).toBeNull();
        expect(localStorage.getItem('gameToEdit')).toBeNull();
    });

    it('should update the game in the database if _id is defined', () => {
        service.databaseGame = {
            _id: 'existing_id',
            name: 'Existing Game',
            description: 'Description',
            mode: GameMode.CTF,
            size: MapSize.MEDIUM,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };
        service.saveGameInDb();

        expect(gameServerCommunicationServiceSpy.updateGame).toHaveBeenCalledWith('existing_id', service.databaseGame);
        expect(localStorage.getItem('isNewGame')).toBe('false');
        expect(localStorage.getItem('gameToEdit')).toEqual(JSON.stringify(service.databaseGame));
    });

    it('should correctly save the current grid to the database game tiles', () => {
        service.databaseGame = {
            _id: 'test_id',
            name: 'Test Game',
            description: 'A test game description',
            mode: GameMode.CTF,
            size: MapSize.SMALL,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };

        service.currentGrid = [[new GrassTile()], [new TerrainTile()]];

        const grassTile = service.currentGrid[0][0] as GrassTile;
        grassTile.type = TileType.Grass;

        const terrainTile = service.currentGrid[1][0] as TerrainTile;
        terrainTile.type = TileType.Door;
        terrainTile.item = new Item();
        terrainTile.item.type = ItemType.Sword;
        service.saveMap();

        expect(service.databaseGame.tiles.length).toBe(2);
        expect(service.databaseGame.tiles[0].length).toBe(1);
        expect(service.databaseGame.tiles[1].length).toBe(1);

        expect(service.databaseGame.tiles[0][0].type).toBe(TileType.Grass);
        expect(service.databaseGame.tiles[0][0].item).toBeNull();

        expect(service.databaseGame.tiles[1][0].type).toBe(TileType.Door);
        expect(service.databaseGame.tiles[1][0].item).toBeDefined();
        expect(service.databaseGame.tiles[1][0].item?.type).toBe(ItemType.Sword);
    });

    it('should reset current values and reload the grid', () => {
        spyOn(service, 'resetCurrentValues');
        spyOn(service, 'loadGrid');

        service.resetGame();

        expect(service.resetCurrentValues).toHaveBeenCalled();
        expect(service.loadGrid).toHaveBeenCalled();
    });

    it('should correctly identify TerrainTile', () => {
        const terrainTile = new TerrainTile();
        terrainTile.item = new Item();

        expect(service.isTerrainTile(terrainTile)).toBeTrue();
    });

    it('should correctly identify non-TerrainTile', () => {
        const wallTile = new WallTile();

        expect(service.isTerrainTile(wallTile)).toBeFalse();
    });

    it('should correctly identify Item', () => {
        const item: Item = { testItem: true } as unknown as Item;

        expect(service.isItem(item)).toBeTrue();
    });

    it('should correctly identify non-Item', () => {
        const nonItem = { name: 'Not an Item' };

        expect(service.isItem(nonItem as unknown)).toBeFalse();
    });

    it('should return true for Door type', () => {
        const doorTile = { type: TileType.Door } as unknown;

        expect(service.isDoor(doorTile)).toBeTrue();
    });

    it('should return true for OpenDoor type', () => {
        const openDoorTile = { type: TileType.OpenDoor } as unknown;

        expect(service.isDoor(openDoorTile)).toBeTrue();
    });

    it('should return false for other tile types', () => {
        const grassTile = { type: TileType.Grass } as unknown;

        expect(service.isDoor(grassTile)).toBeFalse();
    });

    it('should return true when both name and description are valid', () => {
        service.currentName = 'Valid Name';
        service.currentDescription = 'Valid Description';

        expect(service.hasValidNameAndDescription()).toBeTrue();
    });

    it('should return false when name is empty', () => {
        service.currentName = '';
        service.currentDescription = 'Valid Description';

        expect(service.hasValidNameAndDescription()).toBeFalse();
    });

    it('should return false when description is empty', () => {
        service.currentName = 'Valid Name';
        service.currentDescription = '';

        expect(service.hasValidNameAndDescription()).toBeFalse();
    });

    // it('should return false if databaseGame is undefined', () => {
    //     service.databaseGame = undefined;

    //     expect(service.isSavedGame()).toBeFalse();
    // });

    it('should return false if _id is undefined', () => {
        service.databaseGame = {
            _id: undefined,
            name: 'Game',
            description: 'Description',
            mode: GameMode.CTF,
            size: MapSize.SMALL,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };

        expect(service.isSavedGame()).toBeFalse();
    });

    it('should return true if _id is defined', () => {
        service.databaseGame = {
            _id: 'existing_id',
            name: 'Game',
            description: 'Description',
            mode: GameMode.CTF,
            size: MapSize.SMALL,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };

        expect(service.isSavedGame()).toBeTrue();
    });

    it('should return true if game mode is CTF', () => {
        service.databaseGame = {
            _id: 'existing_id',
            name: 'Game',
            description: 'Description',
            mode: GameMode.CTF,
            size: MapSize.SMALL,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        } as GameShared;

        expect(service.isGameModeCTF()).toBeTrue();
    });

    it('should return false if game mode is not CTF', () => {
        service.databaseGame = {
            _id: 'existing_id',
            name: 'Game',
            description: 'Description',
            mode: GameMode.Classique,
            size: MapSize.SMALL,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        } as GameShared;

        expect(service.isGameModeCTF()).toBeFalse();
    });

    // it('should return false if databaseGame is undefined', () => {
    //     service.databaseGame = undefined;

    //     expect(service.isGameModeCTF()).toBeFalse();
    // });
    it('should return correct game size', () => {
        service.databaseGame = {
            _id: 'existing_id',
            name: 'Game',
            description: 'Description',
            mode: GameMode.CTF,
            size: MapSize.LARGE,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        } as GameShared;

        expect(service.gameSize()).toBe(MapSize.LARGE);
    });

    it('should return correct item limit based on game size', () => {
        service.databaseGame = { size: MapSize.SMALL } as GameShared;
        expect(service.itemLimit()).toBe(2);

        service.databaseGame.size = MapSize.MEDIUM;
        expect(service.itemLimit()).toBe(4);

        service.databaseGame.size = MapSize.LARGE;
        expect(service.itemLimit()).toBe(6);
    });
});
