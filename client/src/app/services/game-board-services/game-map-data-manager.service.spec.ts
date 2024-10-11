/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { DiamondSword } from '@app/classes/Items/diamond-sword';
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
import { of, throwError } from 'rxjs';
import { GameMapDataManagerService } from './game-map-data-manager.service';
import { ItemFactoryService } from './item-factory.service';
import { TileFactoryService } from './tile-factory.service';

describe('GameMapDataManagerService', () => {
    let service: GameMapDataManagerService;
    let tileFactoryServiceSpy: jasmine.SpyObj<TileFactoryService>;
    let itemFactoryServiceSpy: jasmine.SpyObj<ItemFactoryService>;
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
        itemFactoryServiceSpy = TestBed.inject(ItemFactoryService) as jasmine.SpyObj<ItemFactoryService>;
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
        const expectedTileCalls = 4;
        expect(tileFactoryServiceSpy.createTile).toHaveBeenCalledTimes(expectedTileCalls);
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
        const originalGame: GameShared = {
            _id: undefined,
            name: 'Game to Save',
            description: 'Description',
            mode: GameMode.CTF,
            size: MapSize.SMALL,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };
        service.databaseGame = originalGame;
        service.currentName = 'Game to Save';
        service.currentDescription = 'Description';

        const returnedGame: GameShared = { ...originalGame, _id: 'new_id' };
        gameServerCommunicationServiceSpy.addGame.and.returnValue(of(returnedGame));

        const setLocalStorageSpy = spyOn(service, 'setLocalStorageVariables').and.callThrough();

        service.save();

        expect(gameServerCommunicationServiceSpy.addGame).toHaveBeenCalledWith(originalGame);

        expect(service.databaseGame._id).toBe('new_id');

        expect(service.isGameUpdated).toBeFalse();

        expect(setLocalStorageSpy).toHaveBeenCalledTimes(1);
        expect(setLocalStorageSpy).toHaveBeenCalledWith(false, returnedGame);

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
        spyOn(service, 'saveGameInDb').and.callFake(() => {
            return of(void 0);
        });

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

    it('should correctly save non-TerrainTile types by pushing { type: tile.type } to databaseGame.tiles', () => {
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

        const grassTile = new DoorTile();
        grassTile.type = TileType.Door;

        service.currentGrid = [[grassTile]];

        service.saveMap();

        expect(service.databaseGame.tiles.length).toBe(1);
        expect(service.databaseGame.tiles[0].length).toBe(1);
        expect(service.databaseGame.tiles[0][0]).toEqual(jasmine.objectContaining({ type: TileType.Door }));
    });

    it('should call addGame with the game having _id: undefined and update local storage with the returned game having _id: new_id', () => {
        const originalGame: GameShared = {
            _id: undefined,
            name: 'New Game',
            description: 'Description',
            mode: GameMode.CTF,
            size: MapSize.SMALL,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };
        service.databaseGame = originalGame;

        const setLocalStorageSpy = spyOn(service, 'setLocalStorageVariables').and.callThrough();

        const returnedGame: GameShared = { ...originalGame, _id: 'new_id' };
        gameServerCommunicationServiceSpy.addGame.and.returnValue(of(returnedGame));

        service.createGameInDb();

        expect(gameServerCommunicationServiceSpy.addGame).toHaveBeenCalledWith(originalGame);

        expect(service.databaseGame).toEqual(returnedGame);

        expect(setLocalStorageSpy).toHaveBeenCalledTimes(1);
        expect(setLocalStorageSpy).toHaveBeenCalledWith(false, returnedGame);

        expect(localStorage.getItem('isNewGame')).toBe('false');
        expect(localStorage.getItem('gameToEdit')).toEqual(JSON.stringify(returnedGame));
    });

    it('should handle errors with unexpected structure in createGameInDb', () => {
        const mockError = {
            error: 'Some unexpected error format',
        };

        spyOn(service, 'openErrorModal');
        gameServerCommunicationServiceSpy.addGame.and.returnValue(throwError(mockError));

        service.createGameInDb();

        expect(service.isGameUpdated).toBeTrue();
    });

    it('should not save if the game is not saved', () => {
        service.databaseGame = { ...service.databaseGame, _id: undefined };
        service.saveGameInDb();

        expect(gameServerCommunicationServiceSpy.updateGame).not.toHaveBeenCalled();
    });

    it('should handle errors with unexpected structure in saveGameInDb', () => {
        const originalGame: GameShared = {
            _id: 'testId',
            name: 'New Game',
            description: 'Description',
            mode: GameMode.CTF,
            size: MapSize.SMALL,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };
        service.databaseGame = originalGame;
        const mockError = {
            error: 'Some unexpected error format',
        };

        spyOn(service, 'openErrorModal');
        spyOn(service, 'isSavedGame').and.returnValue(true);
        gameServerCommunicationServiceSpy.updateGame.and.returnValue(throwError(mockError));

        service.saveGameInDb();

        expect(service.isGameUpdated).toBeTrue();
    });

    it('should call setLocalStorageVariables with false and the current game when the game is saved', () => {
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

        spyOn(service, 'isSavedGame').and.returnValue(true);

        const setLocalStorageSpy = spyOn(service, 'setLocalStorageVariables').and.callThrough();

        gameServerCommunicationServiceSpy.updateGame.and.returnValue(of(void 0));

        service.saveGameInDb();

        expect(gameServerCommunicationServiceSpy.updateGame).toHaveBeenCalledWith('existing_id', mockGame);

        expect(setLocalStorageSpy).toHaveBeenCalledTimes(1);
        expect(setLocalStorageSpy).toHaveBeenCalledWith(false, mockGame);

        expect(localStorage.getItem('isNewGame')).toBe('false');
        expect(localStorage.getItem('gameToEdit')).toEqual(JSON.stringify(mockGame));
    });

    it('should return true when isNewGame is set to true in localStorage', () => {
        localStorage.setItem('isNewGame', 'true');
        expect(service.getLocalStorageIsNewGame()).toBeTrue();
    });

    it('should return false when isNewGame is set to false in localStorage', () => {
        localStorage.setItem('isNewGame', 'false');
        expect(service.getLocalStorageIsNewGame()).toBeFalse();
    });

    it('should return false when isNewGame is not set in localStorage', () => {
        localStorage.removeItem('isNewGame');
        expect(service.getLocalStorageIsNewGame()).toBeFalse();
    });

    it('should return the game object when gameToEdit is set in localStorage', () => {
        const mockGame: GameShared = {
            _id: 'game_id',
            name: 'Test Game',
            description: 'Test Description',
            mode: GameMode.CTF,
            size: MapSize.MEDIUM,
            tiles: [],
            imageUrl: '',
            isVisible: true,
        };
        localStorage.setItem('gameToEdit', JSON.stringify(mockGame));
        expect(service.getLocalStorageGameToEdit()).toEqual(mockGame);
    });

    it('should return an empty object when gameToEdit is not set in localStorage', () => {
        localStorage.removeItem('gameToEdit');
        expect(service.getLocalStorageGameToEdit()).toEqual({} as GameShared);
    });

    it('should not call setLocalStorageVariables if the game is not saved', () => {
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

        spyOn(service, 'isSavedGame').and.returnValue(false);

        const setLocalStorageSpy = spyOn(service, 'setLocalStorageVariables').and.callThrough();

        service.saveGameInDb();

        expect(gameServerCommunicationServiceSpy.updateGame).not.toHaveBeenCalled();

        expect(setLocalStorageSpy).not.toHaveBeenCalled();

        expect(localStorage.getItem('isNewGame')).toBeNull();
        expect(localStorage.getItem('gameToEdit')).toBeNull();
    });

    it('should return false when databaseGame is undefined', () => {
        service.databaseGame = undefined as unknown as GameShared;
        expect(service.isSavedGame()).toBeFalse();
    });

    it('should return false when databaseGame is undefined', () => {
        service.databaseGame = undefined as unknown as GameShared;
        expect(service.isGameModeCTF()).toBeFalse();
    });

    it('should update the game in the database if _id is defined', () => {
        const existingGame: GameShared = {
            _id: 'existing_id',
            name: 'Existing Game',
            description: 'Description',
            mode: GameMode.CTF,
            size: MapSize.MEDIUM,
            tiles: [],
            imageUrl: '',
            isVisible: false,
        };
        service.databaseGame = existingGame;

        gameServerCommunicationServiceSpy.updateGame.and.returnValue(of(void 0));

        const setLocalStorageSpy = spyOn(service, 'setLocalStorageVariables').and.callThrough();

        service.saveGameInDb();

        expect(gameServerCommunicationServiceSpy.updateGame).toHaveBeenCalledWith('existing_id', existingGame);

        expect(setLocalStorageSpy).toHaveBeenCalledTimes(1);
        expect(setLocalStorageSpy).toHaveBeenCalledWith(false, existingGame);

        expect(localStorage.getItem('isNewGame')).toBe('false');
        expect(localStorage.getItem('gameToEdit')).toEqual(JSON.stringify(existingGame));

        expect(service.isGameUpdated).toBeFalse();
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

    it('should load correctly', () => {
        service.databaseGame = {
            _id: 'test_id',
            name: 'Test Game',
            description: 'A test game description',
            mode: GameMode.CTF,
            size: MapSize.SMALL,
            tiles: [[{ type: TileType.Grass, item: { type: ItemType.Sword } }, { type: TileType.Grass }]],
            imageUrl: '',
            isVisible: false,
        };

        spyOn(service, 'isTerrainTile').and.returnValue(true);
        tileFactoryServiceSpy.createTile.and.returnValue(new GrassTile());
        itemFactoryServiceSpy.createItem.and.returnValue(new DiamondSword());

        service.loadGrid();

        expect(service.currentGrid.length).toBe(1);
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
        const item = new DiamondSword();

        expect(service.isItem(item)).toBeTrue();
    });

    it('should return true for Door type', () => {
        const doorTile = new DoorTile();

        expect(service.isDoor(doorTile)).toBeTrue();
    });

    it('should return true for OpenDoor type', () => {
        const openDoorTile = new OpenDoor();

        expect(service.isDoor(openDoorTile)).toBeTrue();
    });

    it('should return false for other tile types', () => {
        const grassTile = new GrassTile();

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
        const smallItemLimit = 2;
        const mediumItemLimit = 4;
        const largeItemLimit = 6;

        service.databaseGame = { size: MapSize.SMALL } as GameShared;
        expect(service.itemLimit()).toBe(smallItemLimit);

        service.databaseGame.size = MapSize.MEDIUM;
        expect(service.itemLimit()).toBe(mediumItemLimit);

        service.databaseGame.size = MapSize.LARGE;
        expect(service.itemLimit()).toBe(largeItemLimit);
    });

    it('should open ErrorModalComponent with concatenated error messages when an array is provided', () => {
        const messages = ['Error 1', 'Error 2', 'Error 3'];

        spyOn(service.dialog, 'open').and.callThrough();

        service.openErrorModal(messages);

        expect(service.dialog.open).toHaveBeenCalled();
    });
});
