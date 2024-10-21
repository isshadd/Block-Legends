import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DiamondSword } from '@app/classes/Items/diamond-sword';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { ErrorModalComponent } from '@app/components/map-editor-components/validation-modal/error-modal/error-modal.component';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';
import { GameShared } from '@common/interfaces/game-shared';
import { TileShared } from '@common/interfaces/tile-shared';
import { of, throwError } from 'rxjs';
import { GameServerCommunicationService } from '../game-server-communication.service';
import { GameMapDataManagerService } from './game-map-data-manager.service';
import { TileFactoryService } from './tile-factory.service';

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
        spyOn(service as any, 'resetCurrentValues');
        spyOn(service as any, 'loadGrid');

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
            spyOn(service as any, 'saveMap');
            service.saveGame();

            expect(gameServerCommunicationServiceSpy.addGame).toHaveBeenCalledWith(service['databaseGame']);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/administration-game']);
        });

        it('should update an existing game in the database', () => {
            service['databaseGame']._id = '1';
            gameServerCommunicationServiceSpy.updateGame.and.returnValue(of(void 0));
            spyOn(service as any, 'saveMap');
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

        spyOn(service as any, 'createNewGrid');
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

        expect(service['currentGrid'].length).toBe(20);
        expect(service['currentGrid'][0].length).toBe(20);
        expect(service['currentGrid'][1].length).toBe(20);

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
});
