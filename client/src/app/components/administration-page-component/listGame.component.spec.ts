// src/app/components/list-game/listGame.component.spec.ts

import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterLink } from '@angular/router';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.service';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { Tile } from '@common/classes/Tiles/tile';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';
import { GameShared } from '@common/interfaces/game-shared';
import { VisibleState } from '@common/interfaces/placeable-entity';
import { TileShared } from '@common/interfaces/tile-shared';
import { Subject } from 'rxjs';
import { ListGameComponent } from './listGame.component';

describe('ListGameComponent', () => {
    let component: ListGameComponent;
    let fixture: ComponentFixture<ListGameComponent>;
    let mockAdministrationService: jasmine.SpyObj<AdministrationPageManagerService>;
    let mockGameMapDataManagerService: jasmine.SpyObj<GameMapDataManagerService>;
    let mockTileFactoryService: jasmine.SpyObj<TileFactoryService>;
    let mockRouter: jasmine.SpyObj<Router>;

    const mockGames: GameShared[] = [
        {
            _id: '1',
            name: 'Game One',
            description: 'First game',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            imageUrl: 'url1',
            isVisible: true,
            tiles: [
                [{ type: TileType.Grass }, { type: TileType.Water }],
                [{ type: TileType.Wall }, { type: TileType.Door }],
            ],
        },
        {
            _id: '2',
            name: 'Game Two',
            description: 'Second game',
            size: MapSize.LARGE,
            mode: GameMode.Classique,
            imageUrl: 'url2',
            isVisible: false,
            tiles: [
                [{ type: TileType.Ice }, { type: TileType.Water }],
                [{ type: TileType.Door }, { type: TileType.Grass }],
            ],
        },
    ];

    // Helper function to create mock Tile instances
    const createMockTile = (type: TileType, visibleState: VisibleState, coordinates: { x: number; y: number } = { x: 0, y: 0 }): Tile => {
        const tile = new Tile();
        tile.type = type;
        tile.description = `${type} description`;
        tile.imageUrl = `url-for-${type}`;
        tile.coordinates = coordinates;
        tile.visibleState = visibleState;
        return tile;
    };

    const mockTilesGame1: Tile[][] = [
        [
            createMockTile(TileType.Grass, VisibleState.NotSelected, { x: 0, y: 0 }),
            createMockTile(TileType.Water, VisibleState.Disabled, { x: 1, y: 0 }),
        ],
        [
            createMockTile(TileType.Wall, VisibleState.Selected, { x: 0, y: 1 }),
            createMockTile(TileType.Door, VisibleState.NotSelected, { x: 1, y: 1 }),
        ],
    ];

    const mockTilesGame2: Tile[][] = [
        [
            createMockTile(TileType.Ice, VisibleState.NotSelected, { x: 0, y: 0 }),
            createMockTile(TileType.Ice, VisibleState.NotSelected, { x: 1, y: 0 }),
        ],
        [
            createMockTile(TileType.Door, VisibleState.NotSelected, { x: 0, y: 1 }),
            createMockTile(TileType.Water, VisibleState.Selected, { x: 1, y: 1 }),
        ],
    ];

    beforeEach(async () => {
        // Create spy objects for the services
        mockAdministrationService = jasmine.createSpyObj('AdministrationPageManagerService', ['setGames', 'deleteGame', 'toggleVisibility'], {
            signalGamesSetted$: new Subject<GameShared[]>(),
        });

        mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', ['setLocalStorageVariables']);

        mockTileFactoryService = jasmine.createSpyObj('TileFactoryService', ['loadGridFromJSON']);

        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [CommonModule, RouterLink, MapComponent, ListGameComponent],
            providers: [
                { provide: AdministrationPageManagerService, useValue: mockAdministrationService },
                { provide: GameMapDataManagerService, useValue: mockGameMapDataManagerService },
                { provide: TileFactoryService, useValue: mockTileFactoryService },
                { provide: Router, useValue: mockRouter },
            ],
            schemas: [NO_ERRORS_SCHEMA], // Ignore child component errors
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ListGameComponent);
        component = fixture.componentInstance;

        // Set up TileFactoryService mock
        mockTileFactoryService.loadGridFromJSON.and.callFake((tiles: TileShared[][]) => {
            // Compare tiles using JSON.stringify for simplicity
            if (JSON.stringify(tiles) === JSON.stringify(mockGames[0].tiles)) {
                return mockTilesGame1;
            } else if (JSON.stringify(tiles) === JSON.stringify(mockGames[1].tiles)) {
                return mockTilesGame2;
            }
            return [];
        });

        // Emit mock games
        (mockAdministrationService.signalGamesSetted$ as Subject<GameShared[]>).next(mockGames);

        // Trigger ngOnInit and other lifecycle hooks
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should subscribe to signalGamesSetted$ and call getGames with emitted games', () => {
            expect(component.databaseGames).toEqual(mockGames);
            expect(component.loadedTiles.length).toBe(mockGames.length);
            expect(mockTileFactoryService.loadGridFromJSON).toHaveBeenCalledTimes(mockGames.length);
            expect(component.loadedTiles[0]).toEqual(mockTilesGame1);
            expect(component.loadedTiles[1]).toEqual(mockTilesGame2);
        });

        it('should call administrationService.setGames on initialization', () => {
            expect(mockAdministrationService.setGames).toHaveBeenCalled();
        });
    });

    describe('getGames', () => {
        it('should set databaseGames and loadedTiles correctly', () => {
            const newGames: GameShared[] = [
                {
                    _id: '3',
                    name: 'Game Three',
                    description: 'Third game',
                    size: MapSize.MEDIUM,
                    mode: GameMode.Classique,
                    imageUrl: 'url3',
                    isVisible: true,
                    tiles: [[{ type: TileType.Grass }, { type: TileType.Water }]],
                },
            ];

            const mockTilesGame3: Tile[][] = [
                [
                    createMockTile(TileType.Grass, VisibleState.NotSelected, { x: 0, y: 0 }),
                    createMockTile(TileType.Water, VisibleState.Selected, { x: 1, y: 0 }),
                ],
            ];

            mockTileFactoryService.loadGridFromJSON.and.callFake((tiles: TileShared[][]) => {
                if (JSON.stringify(tiles) === JSON.stringify(newGames[0].tiles)) {
                    return mockTilesGame3;
                }
                return [];
            });

            component.getGames(newGames);

            expect(component.databaseGames).toEqual(newGames);
            expect(component.loadedTiles.length).toBe(newGames.length);
            expect(mockTileFactoryService.loadGridFromJSON).toHaveBeenCalledWith(newGames[0].tiles);
            expect(component.loadedTiles[0]).toEqual(mockTilesGame3);
        });
    });

    describe('deleteGame', () => {
        it('should call administrationService.deleteGame with valid id', () => {
            const gameId = '1';
            component.deleteGame(gameId);
            expect(mockAdministrationService.deleteGame).toHaveBeenCalledWith(gameId);
        });

        it('should not call administrationService.deleteGame when id is null', () => {
            component.deleteGame(null);
            expect(mockAdministrationService.deleteGame).not.toHaveBeenCalledWith(jasmine.anything());
        });

        it('should not call administrationService.deleteGame when id is undefined', () => {
            component.deleteGame(undefined);
            expect(mockAdministrationService.deleteGame).not.toHaveBeenCalledWith(jasmine.anything());
        });
    });

    describe('toggleVisibility', () => {
        it('should call administrationService.toggleVisibility with the game', () => {
            const game = mockGames[0];
            component.toggleVisibility(game);
            expect(mockAdministrationService.toggleVisibility).toHaveBeenCalledWith(game);
        });
    });

    describe('editGame', () => {
        it('should set local storage variables and navigate to map-editor', () => {
            const game = mockGames[0];
            component.editGame(game);
            expect(mockGameMapDataManagerService.setLocalStorageVariables).toHaveBeenCalledWith(false, game);
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/map-editor']);
        });
    });
});
