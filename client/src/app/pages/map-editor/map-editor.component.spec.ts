import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager/game-map-data-manager.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { DiamondSword } from '@common/classes/Items/diamond-sword';
import { GrassTile } from '@common/classes/Tiles/grass-tile';
import { WallTile } from '@common/classes/Tiles/wall-tile';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';
import { GameShared } from '@common/interfaces/game-shared';
import { of } from 'rxjs';
import { MapEditorComponent } from './map-editor.component';

describe('MapEditorComponent', () => {
    let component: MapEditorComponent;
    let fixture: ComponentFixture<MapEditorComponent>;

    let routerSpy: jasmine.SpyObj<Router>;
    let mapEditorManagerServiceSpy: jasmine.SpyObj<MapEditorManagerService>;
    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;
    let gameServerCommunicationServiceSpy: jasmine.SpyObj<GameServerCommunicationService>;

    const emptyGame: GameShared = {
        name: '',
        description: '',
        size: MapSize.SMALL,
        mode: GameMode.CTF,
        imageUrl: '',
        isVisible: false,
        tiles: [],
    };

    const existingGame: GameShared = {
        _id: 'game123',
        name: 'Existing Game',
        description: 'Description',
        size: MapSize.SMALL,
        mode: GameMode.CTF,
        imageUrl: '',
        isVisible: false,
        tiles: [[{ type: TileType.Grass }], [{ type: TileType.Grass }]],
    };

    const testingMouseCoordinates = { clientX: 100, clientY: 200 };

    beforeEach(async () => {
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        const mapEditorManagerServiceSpyObj = jasmine.createSpyObj('MapEditorManagerService', [
            'init',
            'mapItemCheckup',
            'onMouseUp',
            'onMapMouseEnter',
            'onMapMouseLeave',
            'onMouseUpMapTile',
            'getDraggedItem',
            'onMouseDownMapTile',
            'onMouseEnter',
            'onMouseMoveMapTile',
            'onMouseLeave',
        ]);
        const gameMapDataManagerServiceSpyObj = jasmine.createSpyObj('GameMapDataManagerService', [
            'getLocalStorageIsNewGame',
            'getLocalStorageGameToEdit',
            'init',
            'getCurrentGrid',
        ]);
        const gameServerCommunicationServiceSpyObj = jasmine.createSpyObj('GameServerCommunicationService', ['getGame']);

        await TestBed.configureTestingModule({
            imports: [MapEditorComponent],
            providers: [
                { provide: Router, useValue: routerSpyObj },
                { provide: ActivatedRoute, useValue: {} },
                { provide: MapEditorManagerService, useValue: mapEditorManagerServiceSpyObj },
                { provide: GameMapDataManagerService, useValue: gameMapDataManagerServiceSpyObj },
                { provide: GameServerCommunicationService, useValue: gameServerCommunicationServiceSpyObj },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        mapEditorManagerServiceSpy = TestBed.inject(MapEditorManagerService) as jasmine.SpyObj<MapEditorManagerService>;
        gameMapDataManagerServiceSpy = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;
        gameServerCommunicationServiceSpy = TestBed.inject(GameServerCommunicationService) as jasmine.SpyObj<GameServerCommunicationService>;

        gameMapDataManagerServiceSpy.getCurrentGrid.and.returnValue([]);
        gameMapDataManagerServiceSpy.getLocalStorageIsNewGame.and.returnValue(false);
        gameMapDataManagerServiceSpy.getLocalStorageGameToEdit.and.returnValue(existingGame);
        gameServerCommunicationServiceSpy.getGame.and.returnValue(of(existingGame));

        fixture = TestBed.createComponent(MapEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Initialization', () => {
        it('should initialize services correctly for a new game', () => {
            gameMapDataManagerServiceSpy.getLocalStorageIsNewGame.and.returnValue(true);
            gameMapDataManagerServiceSpy.getLocalStorageGameToEdit.and.returnValue(emptyGame);

            fixture = TestBed.createComponent(MapEditorComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component).toBeTruthy();
            expect(gameMapDataManagerServiceSpy.getLocalStorageIsNewGame).toHaveBeenCalled();
            expect(gameMapDataManagerServiceSpy.getLocalStorageGameToEdit).toHaveBeenCalled();
            expect(gameMapDataManagerServiceSpy.init).toHaveBeenCalledWith(emptyGame);
            expect(mapEditorManagerServiceSpy.init).toHaveBeenCalled();
        });

        it('should initialize services correctly for editing an existing game', () => {
            expect(gameServerCommunicationServiceSpy.getGame).toHaveBeenCalledWith(existingGame._id);
            expect(gameMapDataManagerServiceSpy.init).toHaveBeenCalledWith(existingGame);
            expect(mapEditorManagerServiceSpy.init).toHaveBeenCalled();
            expect(mapEditorManagerServiceSpy.mapItemCheckup).toHaveBeenCalled();
        });

        it('should navigate to /administration-game if gameToEdit is invalid', () => {
            gameMapDataManagerServiceSpy.getLocalStorageGameToEdit.and.returnValue(emptyGame);

            fixture = TestBed.createComponent(MapEditorComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(routerSpy.navigate).toHaveBeenCalledWith(['/administration-game']);
        });
    });

    it('should call mapEditorManagerService.onMouseUp and set isDragging to false', () => {
        component.isDragging = true;

        component.onMouseUp();

        expect(mapEditorManagerServiceSpy.onMouseUp).toHaveBeenCalled();
        expect(component.isDragging).toBeFalse();
    });

    it('should call mapEditorManagerService.onMapMouseEnter', () => {
        component.onMapMouseEnter();

        expect(mapEditorManagerServiceSpy.onMapMouseEnter).toHaveBeenCalled();
    });

    it('should call mapEditorManagerService.onMapMouseLeave', () => {
        component.onMapMouseLeave();

        expect(mapEditorManagerServiceSpy.onMapMouseLeave).toHaveBeenCalled();
    });

    it('should call mapEditorManagerService.onMouseUpMapTile with the correct tile', () => {
        const mockTile = new GrassTile();

        component.onMapTileMouseUp(mockTile);

        expect(mapEditorManagerServiceSpy.onMouseUpMapTile).toHaveBeenCalledWith(mockTile);
    });

    describe('onMouseDown', () => {
        it('should not set dragging state if right mouse button is clicked', () => {
            const mockEvent = new MouseEvent('mousedown', { button: 2 });

            component.onMouseDown(mockEvent);

            expect(mapEditorManagerServiceSpy.getDraggedItem).not.toHaveBeenCalled();
        });

        it('should set dragging state and dragImage when left button is pressed and draggedItem exists', () => {
            const mockEvent = new MouseEvent('mousedown', {
                button: 0,
                clientX: testingMouseCoordinates.clientX,
                clientY: testingMouseCoordinates.clientY,
            });
            const draggedItem = new DiamondSword();

            mapEditorManagerServiceSpy.getDraggedItem.and.returnValue(draggedItem);
            spyOn(component, 'onMouseMove');
            spyOn(mockEvent, 'preventDefault');

            component.onMouseDown(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mapEditorManagerServiceSpy.getDraggedItem).toHaveBeenCalled();
            expect(component.isDragging).toBeTrue();
            expect(component.dragImage).toBe(draggedItem.imageUrl);
            expect(component.onMouseMove).toHaveBeenCalledWith(mockEvent);
        });

        it('should not set dragging state if no draggedItem exists', () => {
            const mockEvent = new MouseEvent('mousedown', {
                button: 0,
                clientX: testingMouseCoordinates.clientX,
                clientY: testingMouseCoordinates.clientY,
            });
            mapEditorManagerServiceSpy.getDraggedItem.and.returnValue(null);
            spyOn(component, 'onMouseMove');
            spyOn(mockEvent, 'preventDefault');

            component.onMouseDown(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mapEditorManagerServiceSpy.getDraggedItem).toHaveBeenCalled();
            expect(component.onMouseMove).not.toHaveBeenCalled();
        });
    });

    describe('onMouseMove', () => {
        it('should update mouseX and mouseY when dragging is true', () => {
            component.isDragging = true;
            const mockEvent = new MouseEvent('mousemove', testingMouseCoordinates);

            component.onMouseMove(mockEvent);

            expect(component.mouseX).toBe(testingMouseCoordinates.clientX);
            expect(component.mouseY).toBe(testingMouseCoordinates.clientY);
        });

        it('should not update mouseX and mouseY when dragging is false', () => {
            component.isDragging = false;
            const mockEvent = new MouseEvent('mousemove', testingMouseCoordinates);

            component.onMouseMove(mockEvent);

            expect(component.mouseX).toBe(0);
            expect(component.mouseY).toBe(0);
        });
    });

    describe('onMapTileMouseDown', () => {
        it('should initiate dragging if tile is TerrainTile with an item', () => {
            const mockEvent = new MouseEvent('mousedown', {
                button: 0,
                clientX: testingMouseCoordinates.clientX,
                clientY: testingMouseCoordinates.clientY,
            });
            const mockItem = new DiamondSword();
            const mockTerrainTile = new GrassTile();
            mockTerrainTile.item = mockItem;

            mapEditorManagerServiceSpy.onMouseDownMapTile.and.callThrough();
            spyOn(component, 'onMouseMove');
            spyOn(mockEvent, 'preventDefault');

            component.onMapTileMouseDown(mockEvent, mockTerrainTile);

            expect(mapEditorManagerServiceSpy.onMouseDownMapTile).toHaveBeenCalledWith(mockEvent, mockTerrainTile);
            expect(component.isDragging).toBeTrue();
            expect(component.dragImage).toBe(mockItem.imageUrl);
            expect(component.onMouseMove).toHaveBeenCalledWith(mockEvent);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        it('should not initiate dragging if tile is not TerrainTile', () => {
            const mockEvent = new MouseEvent('mousedown', {
                button: 0,
                clientX: testingMouseCoordinates.clientX,
                clientY: testingMouseCoordinates.clientY,
            });
            const mockTile = new WallTile();
            spyOn(component, 'onMouseMove');

            component.onMapTileMouseDown(mockEvent, mockTile);

            expect(mapEditorManagerServiceSpy.onMouseDownMapTile).toHaveBeenCalledWith(mockEvent, mockTile);
            expect(component.isDragging).toBeFalse();
            expect(component.dragImage).toBe('');
            expect(component.onMouseMove).not.toHaveBeenCalled();
        });

        it('should not initiate dragging if TerrainTile has no item', () => {
            const mockEvent = new MouseEvent('mousedown', {
                button: 0,
                clientX: testingMouseCoordinates.clientX,
                clientY: testingMouseCoordinates.clientY,
            });
            const mockTerrainTile = new GrassTile();
            spyOn(component, 'onMouseMove');

            component.onMapTileMouseDown(mockEvent, mockTerrainTile);

            expect(mapEditorManagerServiceSpy.onMouseDownMapTile).toHaveBeenCalledWith(mockEvent, mockTerrainTile);
            expect(component.isDragging).toBeFalse();
            expect(component.dragImage).toBe('');
            expect(component.onMouseMove).not.toHaveBeenCalled();
        });
    });

    it('should call mapEditorManagerService.onMouseEnter with the correct tile', () => {
        const mockTile = new GrassTile();

        component.onMapTileMouseEnter(mockTile);

        expect(mapEditorManagerServiceSpy.onMouseEnter).toHaveBeenCalledWith(mockTile);
    });

    it('should call mapEditorManagerService.onMouseMoveMapTile with the correct tile', () => {
        const mockTile = new GrassTile();

        component.onMapTileMouseMove(mockTile);

        expect(mapEditorManagerServiceSpy.onMouseMoveMapTile).toHaveBeenCalledWith(mockTile);
    });

    it('should call mapEditorManagerService.onMouseLeave with the correct tile', () => {
        const mockTile = new GrassTile();

        component.onMapTileMouseLeave(mockTile);

        expect(mapEditorManagerServiceSpy.onMouseLeave).toHaveBeenCalledWith(mockTile);
    });
});
