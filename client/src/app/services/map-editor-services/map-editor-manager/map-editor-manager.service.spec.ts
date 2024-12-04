/* eslint-disable max-lines */ // Disabling max-lines is necessary for the tests of large services
import { TestBed } from '@angular/core/testing';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager/game-map-data-manager.service';
import { ItemFactoryService } from '@app/services/game-board-services/item-factory/item-factory.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory/tile-factory.service';
import { MapEditorMouseHandlerService } from '@app/services/map-editor-services/map-editor-mouse-handler/map-editor-mouse-handler.service';
import { MapEditorSideMenuService } from '@app/services/map-editor-services/map-editor-side-menu/map-editor-side-menu.service';
import { Chestplate } from '@common/classes/Items/chestplate';
import { DiamondSword } from '@common/classes/Items/diamond-sword';
import { Item } from '@common/classes/Items/item';
import { DoorTile } from '@common/classes/Tiles/door-tile';
import { GrassTile } from '@common/classes/Tiles/grass-tile';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { ItemType } from '@common/enums/item-type';
import { PlaceableEntity, VisibleState } from '@common/interfaces/placeable-entity';
import { Vec2 } from '@common/interfaces/vec2';
import { of, Subject } from 'rxjs';
import { MapEditorManagerService } from './map-editor-manager.service';

describe('MapEditorManagerService', () => {
    let service: MapEditorManagerService;
    let tileFactoryServiceSpy: jasmine.SpyObj<TileFactoryService>;
    let itemFactoryServiceSpy: jasmine.SpyObj<ItemFactoryService>;
    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;
    let sideMenuServiceSpy: jasmine.SpyObj<MapEditorSideMenuService>;
    let mouseHandlerServiceSpy: jasmine.SpyObj<MapEditorMouseHandlerService>;

    beforeEach(() => {
        const tileFactorySpy = jasmine.createSpyObj('TileFactoryService', ['copyFromTile']);
        const itemFactorySpy = jasmine.createSpyObj('ItemFactoryService', ['copyItem']);
        const gameMapSpy = jasmine.createSpyObj('GameMapDataManagerService', ['getCurrentGrid', 'getTileAt', 'isGameModeCTF', 'itemLimit']);
        const sideMenuSpy = jasmine.createSpyObj('MapEditorSideMenuService', [
            'init',
            'resetItemList',
            'sideMenuItemFinder',
            'updateItemLimitCounter',
            'sideMenuEntityFinder',
        ]);
        const mouseHandlerSpy = jasmine.createSpyObj('MapEditorMouseHandlerService', [
            'setMouseInMap',
            'getDraggedItem',
            'onMouseDownSideMenu',
            'onMouseEnter',
            'onMouseLeave',
            'onMouseDownMapTile',
            'onMouseMoveMapTile',
            'onMouseUp',
            'onMapTileMouseUp',
            'setLastDraggedItemCoordinates', // Add this method to the spy
        ]);

        // Mock observables for signals
        sideMenuSpy.signalSideMenuMouseEnter$ = of();
        sideMenuSpy.signalSideMenuMouseLeave$ = of();
        sideMenuSpy.signalSideMenuMouseDown$ = of();
        mouseHandlerSpy.signalTileCopy$ = of();
        mouseHandlerSpy.signalItemPlacer$ = new Subject();
        mouseHandlerSpy.signalItemRemover$ = new Subject();
        mouseHandlerSpy.signalCancelSelection$ = new Subject();
        mouseHandlerSpy.signalItemDragged$ = new Subject();
        mouseHandlerSpy.signalItemPlacerWithCoordinates$ = new Subject();
        mouseHandlerSpy.signalItemInPlace$ = new Subject();

        TestBed.configureTestingModule({
            providers: [
                MapEditorManagerService,
                { provide: TileFactoryService, useValue: tileFactorySpy },
                { provide: ItemFactoryService, useValue: itemFactorySpy },
                { provide: GameMapDataManagerService, useValue: gameMapSpy },
                { provide: MapEditorSideMenuService, useValue: sideMenuSpy },
                { provide: MapEditorMouseHandlerService, useValue: mouseHandlerSpy },
            ],
        });

        service = TestBed.inject(MapEditorManagerService);
        tileFactoryServiceSpy = TestBed.inject(TileFactoryService) as jasmine.SpyObj<TileFactoryService>;
        itemFactoryServiceSpy = TestBed.inject(ItemFactoryService) as jasmine.SpyObj<ItemFactoryService>;
        gameMapDataManagerServiceSpy = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;
        sideMenuServiceSpy = TestBed.inject(MapEditorSideMenuService) as jasmine.SpyObj<MapEditorSideMenuService>;
        mouseHandlerServiceSpy = TestBed.inject(MapEditorMouseHandlerService) as jasmine.SpyObj<MapEditorMouseHandlerService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize the side menu', () => {
        gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(true);

        const itemLimit = 5;
        gameMapDataManagerServiceSpy.itemLimit.and.returnValue(itemLimit);

        service.init();

        expect(sideMenuServiceSpy.init).toHaveBeenCalledWith(true, itemLimit);
    });

    it('should complete the destroy$ subject', () => {
        spyOn(service['destroy$'], 'next');
        spyOn(service['destroy$'], 'complete');

        service.ngOnDestroy();

        expect(service['destroy$'].next).toHaveBeenCalled();
        expect(service['destroy$'].complete).toHaveBeenCalled();
    });

    it('should reset item list and check items on the map', () => {
        spyOn(service, 'mapItemCheckup');
        service.itemCheckup();

        expect(sideMenuServiceSpy.resetItemList).toHaveBeenCalled();
        expect(service.mapItemCheckup).toHaveBeenCalled();
    });

    it('should copy a tile and set coordinates', () => {
        const mockTile = new GrassTile();
        const mockSelectedTile = new GrassTile();
        mockSelectedTile.coordinates = { x: 2, y: 3 };

        const mockGrid = [
            [new GrassTile(), new GrassTile(), new GrassTile(), new GrassTile()],
            [new GrassTile(), new GrassTile(), new GrassTile(), new GrassTile()],
            [new GrassTile(), new GrassTile(), new GrassTile(), mockSelectedTile],
        ];

        tileFactoryServiceSpy.copyFromTile.and.returnValue(mockTile);
        gameMapDataManagerServiceSpy.getCurrentGrid.and.returnValue(mockGrid);

        service['tileCopyCreator'](mockTile, mockSelectedTile);

        expect(tileFactoryServiceSpy.copyFromTile).toHaveBeenCalledWith(mockTile);
        expect(mockTile.coordinates).toEqual({ x: 2, y: 3 });
    });

    it('should place an item on the terrain tile', () => {
        const mockItem = {
            type: 'Sword',
            isItem: () => true,
            setCoordinates: jasmine.createSpy('setCoordinates'),
        } as unknown as Item;

        const mockTile = new GrassTile() as TerrainTile;
        mockTile.coordinates = { x: 1, y: 1 };

        itemFactoryServiceSpy.copyItem.and.returnValue(mockItem);
        sideMenuServiceSpy.updateItemLimitCounter.and.returnValue(mockItem);

        service['itemPlacer'](mockItem, mockTile);

        expect(itemFactoryServiceSpy.copyItem).toHaveBeenCalledWith(mockItem);
        expect(mockTile.item).toBe(mockItem);
        expect(mockItem.setCoordinates).toHaveBeenCalledWith(mockTile.coordinates);
    });

    it('should call mouseHandlerService.onMouseEnter', () => {
        const mockEntity = { visibleState: 0 } as unknown as PlaceableEntity;
        service.onMouseEnter(mockEntity);
        expect(mouseHandlerServiceSpy.onMouseEnter).toHaveBeenCalledWith(mockEntity);
    });

    it('should call mouseHandlerService.onMouseLeave', () => {
        const mockEntity = { visibleState: 0 } as unknown as PlaceableEntity;
        service.onMouseLeave(mockEntity);
        expect(mouseHandlerServiceSpy.onMouseLeave).toHaveBeenCalledWith(mockEntity);
    });

    it('should call itemPlacerWithCoordinates with correct arguments when signalItemPlacerWithCoordinates$ emits', () => {
        const mockItem = { type: ItemType.Sword } as unknown as Item;
        const mockCoordinates: Vec2 = { x: 2, y: 3 };

        spyOn(service, 'itemPlacerWithCoordinates');
        (mouseHandlerServiceSpy.signalItemPlacerWithCoordinates$ as Subject<{ item: Item; coordinates: Vec2 }>).next({
            item: mockItem,
            coordinates: mockCoordinates,
        });

        expect(service.itemPlacerWithCoordinates).toHaveBeenCalledWith(mockItem, mockCoordinates);
    });

    it('should call itemPlacedInSideMenu with correct arguments when signalItemInPlace$ emits', () => {
        const mockItem = { type: ItemType.Sword } as unknown as Item;
        const mockCoordinates: Vec2 = { x: 2, y: 3 };

        spyOn(service, 'itemPlacedInSideMenu');

        (mouseHandlerServiceSpy.signalItemInPlace$ as Subject<{ item: Item; coordinates: Vec2 }>).next({
            item: mockItem,
            coordinates: mockCoordinates,
        });

        expect(service.itemPlacedInSideMenu).toHaveBeenCalledWith(mockItem, mockCoordinates);
    });

    it('should call updateItemLimitCounter for terrain tiles with items', () => {
        const mockItem = { type: 'Sword', isItem: () => true } as unknown as Item;
        const mockTerrainTile = new GrassTile() as TerrainTile;
        mockTerrainTile.item = mockItem;

        const mockGrid = [[mockTerrainTile]];

        gameMapDataManagerServiceSpy.getCurrentGrid.and.returnValue(mockGrid);

        service.mapItemCheckup();

        expect(sideMenuServiceSpy.updateItemLimitCounter).toHaveBeenCalledWith(mockItem, -1);
    });

    it('should not call updateItemLimitCounter for terrain tiles without items', () => {
        const mockTerrainTile = new GrassTile() as TerrainTile;
        mockTerrainTile.item = null;

        const mockGrid = [[mockTerrainTile]];

        gameMapDataManagerServiceSpy.getCurrentGrid.and.returnValue(mockGrid);

        service.mapItemCheckup();

        expect(sideMenuServiceSpy.updateItemLimitCounter).not.toHaveBeenCalled();
    });

    it('should not call updateItemLimitCounter for non-terrain tiles', () => {
        const mockNonTerrainTile = { isTerrain: () => false } as unknown as GrassTile;

        const mockGrid = [[mockNonTerrainTile]];

        gameMapDataManagerServiceSpy.getCurrentGrid.and.returnValue(mockGrid);

        service.mapItemCheckup();

        expect(sideMenuServiceSpy.updateItemLimitCounter).not.toHaveBeenCalled();
    });

    it('should call setMouseInMap with true when the mouse enters the map', () => {
        service.onMapMouseEnter();
        expect(mouseHandlerServiceSpy.setMouseInMap).toHaveBeenCalledWith(true);
    });

    it('should call setMouseInMap with false if an item is being dragged', () => {
        mouseHandlerServiceSpy.getDraggedItem.and.returnValue({ type: 'Sword', isItem: () => true } as unknown as Item);

        service.onMapMouseLeave();

        expect(mouseHandlerServiceSpy.getDraggedItem).toHaveBeenCalled();
        expect(mouseHandlerServiceSpy.setMouseInMap).toHaveBeenCalledWith(false);
    });

    it('should not call setMouseInMap if no item is being dragged', () => {
        mouseHandlerServiceSpy.getDraggedItem.and.returnValue(null);

        service.onMapMouseLeave();

        expect(mouseHandlerServiceSpy.getDraggedItem).toHaveBeenCalled();
        expect(mouseHandlerServiceSpy.setMouseInMap).not.toHaveBeenCalled();
    });

    it('should call onMouseDownMapTile in mouseHandlerService with correct arguments', () => {
        const mockEvent = new MouseEvent('mousedown');
        const mockTile = new GrassTile();

        service.onMouseDownMapTile(mockEvent, mockTile);

        expect(mouseHandlerServiceSpy.onMouseDownMapTile).toHaveBeenCalledWith(mockEvent, mockTile);
    });

    it('should call onMouseMoveMapTile in mouseHandlerService with the correct entity', () => {
        const mockTile = new GrassTile();

        service.onMouseMoveMapTile(mockTile);

        expect(mouseHandlerServiceSpy.onMouseMoveMapTile).toHaveBeenCalledWith(mockTile);
    });

    it('should call onMouseUp in mouseHandlerService', () => {
        service.onMouseUp();

        expect(mouseHandlerServiceSpy.onMouseUp).toHaveBeenCalled();
    });

    it('should call onMapTileMouseUp in mouseHandlerService with the correct entity', () => {
        const mockTile = new GrassTile();

        service.onMouseUpMapTile(mockTile);

        expect(mouseHandlerServiceSpy.onMapTileMouseUp).toHaveBeenCalledWith(mockTile);
    });

    it('should call onMouseDownSideMenu in mouseHandlerService with the correct entity', () => {
        const mockEntity = { visibleState: 0 } as unknown as PlaceableEntity;

        service.onMouseDownSideMenu(mockEntity);

        expect(mouseHandlerServiceSpy.onMouseDownSideMenu).toHaveBeenCalledWith(mockEntity);
    });

    it('should call onMouseDownSideMenu with the found item if item is found', () => {
        const mockItem = new DiamondSword();
        sideMenuServiceSpy.sideMenuItemFinder.and.returnValue(mockItem);

        service.onMapItemDragged(ItemType.Sword);

        expect(sideMenuServiceSpy.sideMenuItemFinder).toHaveBeenCalledWith(ItemType.Sword);
        expect(mouseHandlerServiceSpy.onMouseDownSideMenu).toHaveBeenCalledWith(mockItem);
    });

    it('should not call onMouseDownSideMenu if no item is found', () => {
        sideMenuServiceSpy.sideMenuItemFinder.and.returnValue(null);

        service.onMapItemDragged(ItemType.Sword);

        expect(sideMenuServiceSpy.sideMenuItemFinder).toHaveBeenCalledWith(ItemType.Sword);
        expect(mouseHandlerServiceSpy.onMouseDownSideMenu).not.toHaveBeenCalled();
    });

    it('should return the dragged item from mouseHandlerService', () => {
        const mockItem = new DiamondSword();
        mouseHandlerServiceSpy.getDraggedItem.and.returnValue(mockItem);

        const result = service.getDraggedItem();

        expect(mouseHandlerServiceSpy.getDraggedItem).toHaveBeenCalled();
        expect(result).toBe(mockItem);
    });

    it('should return null if no item is being dragged', () => {
        mouseHandlerServiceSpy.getDraggedItem.and.returnValue(null);

        const result = service.getDraggedItem();

        expect(mouseHandlerServiceSpy.getDraggedItem).toHaveBeenCalled();
        expect(result).toBeNull();
    });

    it('should set the visibleState of the found entity to NotSelected', () => {
        const mockEntity = { visibleState: VisibleState.Selected } as unknown as PlaceableEntity;
        sideMenuServiceSpy.sideMenuEntityFinder.and.returnValue(mockEntity as unknown as Tile | Item | null);

        service['cancelSelection'](mockEntity);

        expect(sideMenuServiceSpy.sideMenuEntityFinder).toHaveBeenCalledWith(mockEntity);
        expect(mockEntity.visibleState).toBe(VisibleState.NotSelected);
    });

    it('should do nothing if no entity is found', () => {
        sideMenuServiceSpy.sideMenuEntityFinder.and.returnValue(null);

        service['cancelSelection']({ visibleState: VisibleState.Selected } as unknown as PlaceableEntity);

        expect(sideMenuServiceSpy.sideMenuEntityFinder).toHaveBeenCalled();
    });

    it('should copy a tile, set coordinates, and update the grid', () => {
        const mockCopiedTile = new GrassTile();
        const mockSelectedTile = new GrassTile();
        mockSelectedTile.coordinates = { x: 2, y: 3 };

        const mockGrid = [
            [new GrassTile(), new GrassTile(), new GrassTile(), new GrassTile()],
            [new GrassTile(), new GrassTile(), new GrassTile(), new GrassTile()],
            [new GrassTile(), new GrassTile(), new GrassTile(), mockSelectedTile],
        ];

        tileFactoryServiceSpy.copyFromTile.and.returnValue(mockCopiedTile);
        gameMapDataManagerServiceSpy.getCurrentGrid.and.returnValue(mockGrid);

        service['tileCopyCreator'](mockCopiedTile, mockSelectedTile);

        expect(tileFactoryServiceSpy.copyFromTile).toHaveBeenCalledWith(mockCopiedTile);
        expect(mockCopiedTile.coordinates).toEqual({ x: 2, y: 3 });
        expect(gameMapDataManagerServiceSpy.getCurrentGrid()[2][3]).toBe(mockCopiedTile);
        expect(mockCopiedTile.visibleState).toBe(VisibleState.NotSelected);
    });

    it('should copy a terrain tile with an item and update the grid', () => {
        const mockCopiedTile = new GrassTile();
        const mockSelectedTile = new GrassTile();
        mockSelectedTile.coordinates = { x: 1, y: 1 };

        const mockItem = new DiamondSword();
        mockSelectedTile.item = mockItem;

        const mockGrid = [
            [new GrassTile(), new GrassTile()],
            [new GrassTile(), mockSelectedTile],
        ];

        tileFactoryServiceSpy.copyFromTile.and.returnValue(mockCopiedTile);
        gameMapDataManagerServiceSpy.getCurrentGrid.and.returnValue(mockGrid);
        sideMenuServiceSpy.sideMenuItemFinder.and.returnValue(mockItem);

        service['tileCopyCreator'](mockCopiedTile, mockSelectedTile);

        expect(mockCopiedTile.item).toBe(mockItem);
        expect(gameMapDataManagerServiceSpy.getCurrentGrid()[1][1]).toBe(mockCopiedTile);
        expect(mockCopiedTile.visibleState).toBe(VisibleState.NotSelected);
    });

    it('should remove the item if the copied tile is not a terrain tile', () => {
        const mockCopiedTile = new Tile();
        const mockSelectedTile = new GrassTile();
        mockSelectedTile.coordinates = { x: 0, y: 0 };

        const mockItem = new DiamondSword();
        mockSelectedTile.item = mockItem;

        spyOn(service, 'itemRemover');

        const mockGrid = [[mockSelectedTile]];

        tileFactoryServiceSpy.copyFromTile.and.returnValue(mockCopiedTile);
        gameMapDataManagerServiceSpy.getCurrentGrid.and.returnValue(mockGrid);

        service['tileCopyCreator'](mockCopiedTile, mockSelectedTile);

        expect(service.itemRemover).toHaveBeenCalledWith(mockSelectedTile);
    });

    it('should place an item on a terrain tile and update the item limit', () => {
        const mockItem = new DiamondSword();
        const mockTile = new GrassTile();
        mockTile.coordinates = { x: 1, y: 1 };

        itemFactoryServiceSpy.copyItem.and.returnValue(mockItem);
        sideMenuServiceSpy.updateItemLimitCounter.and.returnValue(mockItem);

        service['itemPlacer'](mockItem, mockTile);

        expect(itemFactoryServiceSpy.copyItem).toHaveBeenCalledWith(mockItem);
        expect(mockTile.item).toBe(mockItem);
        expect(sideMenuServiceSpy.updateItemLimitCounter).toHaveBeenCalledWith(mockItem, -1);
        expect(mouseHandlerServiceSpy.setLastDraggedItemCoordinates).toHaveBeenCalledWith(null);
    });

    it('should remove an existing item from the terrain tile before placing a new one', () => {
        const mockItem = new DiamondSword();
        const mockTile = new GrassTile();
        const existingItem = new Chestplate();
        mockTile.item = existingItem;
        mockTile.coordinates = { x: 1, y: 1 };

        spyOn(service, 'itemRemover');
        itemFactoryServiceSpy.copyItem.and.returnValue(mockItem);

        service['itemPlacer'](mockItem, mockTile);

        expect(service.itemRemover).toHaveBeenCalledWith(mockTile);
        expect(itemFactoryServiceSpy.copyItem).toHaveBeenCalledWith(mockItem);
        expect(mockTile.item).toBe(mockItem);
    });

    it('should deselect the item from the side menu if item limit reaches zero', () => {
        const mockItem = new DiamondSword();
        const mockTile = new GrassTile();
        mockTile.coordinates = { x: 1, y: 1 };
        mockItem.itemLimit = 0;

        mouseHandlerServiceSpy.sideMenuSelectedEntity = mockItem;

        sideMenuServiceSpy.updateItemLimitCounter.and.returnValue(mockItem);
        itemFactoryServiceSpy.copyItem.and.returnValue(mockItem);

        service['itemPlacer'](mockItem, mockTile);

        expect(mouseHandlerServiceSpy.setLastDraggedItemCoordinates).toHaveBeenCalledWith(null);
        expect(mouseHandlerServiceSpy.sideMenuSelectedEntity).toBeNull();
    });

    it('should not place an item if the selected tile is not a terrain tile', () => {
        const mockItem = new DiamondSword();
        const mockTile = new Tile();

        service['itemPlacer'](mockItem, mockTile);

        expect(itemFactoryServiceSpy.copyItem).not.toHaveBeenCalled();
        expect(mouseHandlerServiceSpy.setLastDraggedItemCoordinates).not.toHaveBeenCalled();
    });

    it('should place an item on the correct tile using coordinates', () => {
        const mockItem = new DiamondSword();
        const mockTile = new GrassTile();
        const mockCoordinates: Vec2 = { x: 1, y: 1 };

        gameMapDataManagerServiceSpy.getTileAt.and.returnValue(mockTile);
        spyOn(service, 'itemPlacer');
        service['itemPlacerWithCoordinates'](mockItem, mockCoordinates);

        expect(gameMapDataManagerServiceSpy.getTileAt).toHaveBeenCalledWith(mockCoordinates);
        expect(service.itemPlacer).toHaveBeenCalledWith(mockItem, mockTile);
    });

    it('should handle itemPlacerWithCoordinates when getTileAt returns null', () => {
        const mockItem = { type: ItemType.Sword } as unknown as Item;
        const mockCoordinates: Vec2 = { x: -1, y: -1 }; // Invalid coordinates

        gameMapDataManagerServiceSpy.getTileAt.and.returnValue(null);

        spyOn(service, 'itemPlacer');

        service['itemPlacerWithCoordinates'](mockItem, mockCoordinates);

        expect(gameMapDataManagerServiceSpy.getTileAt).toHaveBeenCalledWith(mockCoordinates);
        expect(service.itemPlacer).not.toHaveBeenCalled();
    });

    it('should remove the item from a terrain tile and update the item limit', () => {
        const mockItem = new DiamondSword();
        const mockTile = new GrassTile();
        mockTile.item = mockItem;

        service['itemRemover'](mockTile);

        expect(sideMenuServiceSpy.updateItemLimitCounter).toHaveBeenCalledWith(mockItem, 1);
        expect(mockTile.item).toBeNull();
    });

    it('should not remove an item if the tile is not a terrain tile', () => {
        const mockTile = new DoorTile();

        service['itemRemover'](mockTile);

        expect(sideMenuServiceSpy.updateItemLimitCounter).not.toHaveBeenCalled();
    });

    it('should not remove an item if the terrain tile does not have an item', () => {
        const mockTile = new GrassTile();
        mockTile.item = null;

        service['itemRemover'](mockTile);

        expect(sideMenuServiceSpy.updateItemLimitCounter).not.toHaveBeenCalled();
    });

    it('should not remove an item if foundEntity is not an item', () => {
        const mockItem = new DiamondSword();
        const mockCoordinates: Vec2 = { x: 2, y: 2 };
        const mockTerrainTile = new GrassTile();

        sideMenuServiceSpy.sideMenuEntityFinder.and.returnValue(null); // No item found
        gameMapDataManagerServiceSpy.getTileAt.and.returnValue(mockTerrainTile);

        spyOn(service, 'itemRemover');

        service['itemPlacedInSideMenu'](mockItem, mockCoordinates);

        expect(sideMenuServiceSpy.sideMenuEntityFinder).toHaveBeenCalledWith(mockItem);
        expect(gameMapDataManagerServiceSpy.getTileAt).toHaveBeenCalledWith(mockCoordinates);
        expect(service.itemRemover).not.toHaveBeenCalled();
    });

    it('should call itemRemover if foundEntity is an instance of Item', () => {
        const mockItem = new DiamondSword();
        const mockCoordinates: Vec2 = { x: 2, y: 2 };
        const mockTerrainTile = new GrassTile();

        sideMenuServiceSpy.sideMenuEntityFinder.and.returnValue(mockItem);
        gameMapDataManagerServiceSpy.getTileAt.and.returnValue(mockTerrainTile);

        spyOn(service, 'itemRemover');

        service['itemPlacedInSideMenu'](mockItem, mockCoordinates);

        expect(service.itemRemover).toHaveBeenCalledWith(mockTerrainTile);
    });
});
