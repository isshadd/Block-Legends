/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { Chestplate } from '@app/classes/Items/chestplate';
import { DiamondSword } from '@app/classes/Items/diamond-sword';
import { Potion } from '@app/classes/Items/potion';
import { RandomItem } from '@app/classes/Items/random-item';
import { Spawn } from '@app/classes/Items/spawn';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { OpenDoor } from '@app/classes/Tiles/open-door';
import { WallTile } from '@app/classes/Tiles/wall-tile';
import { WaterTile } from '@app/classes/Tiles/water-tile';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { ItemFactoryService } from '@app/services/game-board-services/item-factory.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { ItemType } from '@common/enums/item-type';
import { MapEditorManagerService } from './map-editor-manager.service';

describe('MapEditorManagerService', () => {
    let service: MapEditorManagerService;
    let tileFactoryServiceSpy: jasmine.SpyObj<TileFactoryService>;
    let itemFactoryServiceSpy: jasmine.SpyObj<ItemFactoryService>;
    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;

    beforeEach(() => {
        const tileSpy = jasmine.createSpyObj('TileFactoryService', ['copyFromTile']);
        const itemSpy = jasmine.createSpyObj('ItemFactoryService', ['copyItem']);
        const gameMapSpy = jasmine.createSpyObj('GameMapDataManagerService', ['isGameModeCTF', 'itemLimit', 'isTerrainTile', 'isItem', 'isDoor']);

        TestBed.configureTestingModule({
            providers: [
                MapEditorManagerService,
                { provide: TileFactoryService, useValue: tileSpy },
                { provide: ItemFactoryService, useValue: itemSpy },
                { provide: GameMapDataManagerService, useValue: gameMapSpy },
            ],
        });

        service = TestBed.inject(MapEditorManagerService);
        tileFactoryServiceSpy = TestBed.inject(TileFactoryService) as jasmine.SpyObj<TileFactoryService>;
        itemFactoryServiceSpy = TestBed.inject(ItemFactoryService) as jasmine.SpyObj<ItemFactoryService>;
        gameMapDataManagerServiceSpy = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;

        service.init();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize placeable entities sections correctly', () => {
        service.init();

        expect(service.placeableEntitiesSections.length).toBe(2);
        expect(service.placeableEntitiesSections[0].title).toBe('Tuiles');
        expect(service.placeableEntitiesSections[1].title).toBe('Objets');
    });

    it('should reset item list and set item limits', () => {
        const ITEM_LIMIT = 6;
        gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(true);
        gameMapDataManagerServiceSpy.itemLimit.and.returnValue(ITEM_LIMIT);
        service.resetItemList();

        const itemsSection = service.placeableEntitiesSections.find((section) => section.title === 'Objets');
        expect(itemsSection?.entities.length).toBeGreaterThan(0);
        expect(service.itemLimitCounter).toBe(gameMapDataManagerServiceSpy.itemLimit());
    });

    it('should update item limit counter and update random item limit', () => {
        service.itemLimitCounter = 6;
        const randomItem = new RandomItem();
        spyOn(service, 'getRandomItemItemInMenu').and.returnValue(randomItem);

        service.updateItemLimitCounter(-1);

        const expectedItemLimitCounter = 5;
        expect(service.itemLimitCounter).toBe(expectedItemLimitCounter);
        expect(randomItem.itemLimit).toBe(expectedItemLimitCounter);
    });

    it('should get null when there is no placeable entities while getting random item', () => {
        service.placeableEntitiesSections = [];
        const randomItem = service.getRandomItemItemInMenu();

        expect(randomItem).toBeNull();
    });

    it('should get null when there is no placeable entities while getting spawn item', () => {
        service.placeableEntitiesSections = [];
        const spawnItem = service.getSpawnItemInMenu();

        expect(spawnItem).toBeNull();
    });

    it('should start and end dragging an entity', () => {
        const entity: PlaceableEntity = new WaterTile();
        service.startDrag(entity);

        expect(service.draggedEntity).toBe(entity);

        service.endDrag();
        expect(service.draggedEntity).toBeNull();
    });

    it('should find tile in sideMenu', () => {
        const tile = new IceTile();
        const sideMenuTile = service.sideMenuTileFinder(tile);

        expect(sideMenuTile).toEqual(jasmine.any(IceTile));

        service.placeableEntitiesSections[0].entities = [];
        const nullSideMenuTile = service.sideMenuTileFinder(tile);

        expect(nullSideMenuTile).toBeNull();
    });

    it('should find item in sideMenu', () => {
        const item = new DiamondSword();
        const sideMenuItem = service.sideMenuItemFinder(item);

        expect(sideMenuItem).toEqual(jasmine.any(DiamondSword));

        service.placeableEntitiesSections[1].entities = [];
        const nullSideMenuItem = service.sideMenuItemFinder(item);

        expect(nullSideMenuItem).toBeNull();
    });

    it('should find entity in sideMenu', () => {
        const entity1 = new WaterTile();
        const sideMenuEntity1 = service.sideMenuEntityFinder(entity1);

        expect(sideMenuEntity1).toEqual(jasmine.any(WaterTile));

        const entity2 = new DiamondSword();
        const sideMenuEntity2 = service.sideMenuEntityFinder(entity2);

        expect(sideMenuEntity2).toEqual(jasmine.any(DiamondSword));

        const entity3 = new GrassTile();
        const sideMenuEntity3 = service.sideMenuEntityFinder(entity3);

        expect(sideMenuEntity3).toBeNull();
    });

    it('should cancel the selection on sideMenu', () => {
        const entity = new WaterTile();
        const sideMenuEntity = new WaterTile();
        service.sideMenuSelectedEntity = entity;

        spyOn(service, 'sideMenuEntityFinder').and.returnValue(sideMenuEntity);
        service.cancelSelectionSideMenu();

        expect(sideMenuEntity.visibleState).toBe(VisibleState.NotSelected);
        expect(service.sideMenuSelectedEntity).toBeNull();
    });

    it('should cancel selection map', () => {
        const entity = new WaterTile();
        const sideMenuEntity = new WaterTile();
        service.selectedEntity = entity;

        spyOn(service, 'sideMenuEntityFinder').and.returnValue(sideMenuEntity);
        service.cancelSelectionMap();

        expect(sideMenuEntity.visibleState).toBe(VisibleState.NotSelected);
        expect(service.selectedEntity).toBeNull();
    });

    it('should select an entity and cancel map selection', () => {
        const entity: PlaceableEntity = new WaterTile();
        spyOn(service, 'cancelSelectionMap');

        service.makeSelection(entity);

        expect(entity.visibleState).toBe(VisibleState.Selected);
        expect(service.sideMenuSelectedEntity).toBe(entity);
        expect(service.cancelSelectionMap).toHaveBeenCalled();
    });

    it('should show mouse enter and mouse leave', () => {
        const entity: PlaceableEntity = new WaterTile();
        service.onMouseEnter(entity);

        expect(entity.visibleState).toBe(VisibleState.Hovered);

        service.onMouseLeave(entity);

        expect(entity.visibleState).toBe(VisibleState.NotSelected as VisibleState);
    });

    it('should copy a terrain tile under tile with item', () => {
        const tile = new GrassTile();
        tile.coordinates = { x: 0, y: 0 };
        const item = new DiamondSword();
        tile.item = item;
        gameMapDataManagerServiceSpy.currentGrid = [[tile]];

        const copiedTile = new WaterTile();
        copiedTile.coordinates = { x: -1, y: -1 };
        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(true);
        tileFactoryServiceSpy.copyFromTile.and.returnValue(copiedTile);

        service.tileCopyCreator(copiedTile, tile);

        expect(copiedTile.item).toEqual(tile.item);
        expect(copiedTile.visibleState).toBe(VisibleState.NotSelected);
    });

    it('should copy a non terrain tile without item', () => {
        const tile = new GrassTile();
        tile.coordinates = { x: 0, y: 0 };
        const item = new DiamondSword();
        tile.item = item;
        gameMapDataManagerServiceSpy.currentGrid = [[tile]];

        const copiedTile = new DoorTile();
        copiedTile.coordinates = { x: -1, y: -1 };
        tileFactoryServiceSpy.copyFromTile.and.returnValue(copiedTile);

        gameMapDataManagerServiceSpy.isTerrainTile.withArgs(copiedTile).and.returnValue(false);
        gameMapDataManagerServiceSpy.isTerrainTile.withArgs(tile).and.returnValue(true);

        spyOn(service, 'itemRemover');
        service.tileCopyCreator(copiedTile, tile);

        expect(service.itemRemover).toHaveBeenCalledWith(tile);
        expect(copiedTile.visibleState).toBe(VisibleState.NotSelected);
    });

    it('should place an item on a tile', () => {
        const item = new DiamondSword();
        const tile = new GrassTile();
        tile.item = item;
        service.itemLimitCounter = 6;
        spyOn(service, 'updateItemLimitCounter');
        spyOn(service, 'itemRemover');
        spyOn(service, 'sideMenuItemsEnabler');

        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(true);
        itemFactoryServiceSpy.copyItem.and.returnValue(item);

        service.itemPlacer(item, tile);

        expect(service.itemRemover).toHaveBeenCalledWith(tile);
        expect(tile.item).toEqual(jasmine.any(DiamondSword));
        expect(service.updateItemLimitCounter).toHaveBeenCalledWith(-1);
        expect(gameMapDataManagerServiceSpy.isGameUpdated).toBeTrue();
        expect(service.sideMenuItemsEnabler).toHaveBeenCalled();

        service.itemLimitCounter = 0;
        const item2 = new Chestplate();
        const tile2 = new GrassTile();

        spyOn(service, 'sideMenuItemsDisabler');

        service.itemPlacer(item2, tile2);

        expect(service.sideMenuItemsDisabler).toHaveBeenCalled();
    });

    it('should not place an item on bad conditions', () => {
        const item = new DiamondSword();
        const tile = new WallTile();

        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(false);
        spyOn(service, 'sideMenuItemFinder').and.returnValue(item);

        service.itemPlacer(item, tile);

        expect(service.sideMenuItemFinder).not.toHaveBeenCalled();

        const tile2 = new GrassTile();
        item.itemLimit = 0;

        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(true);

        service.itemPlacer(item, tile2);

        expect(service.sideMenuItemFinder).toHaveBeenCalled();
        expect(itemFactoryServiceSpy.copyItem).not.toHaveBeenCalled();

        item.itemLimit = 1;
        service.sideMenuSelectedEntity = item;

        service.itemPlacer(item, tile2);

        expect(itemFactoryServiceSpy.copyItem).toHaveBeenCalled();
        expect(item.visibleState).toBe(VisibleState.Disabled);
    });

    it('should remove an item from a tile', () => {
        const item = new DiamondSword();
        const tile = new GrassTile();
        tile.item = item;
        service.itemLimitCounter = 6;
        spyOn(service, 'updateItemLimitCounter');
        spyOn(service, 'sideMenuItemsEnabler');
        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(true);

        service.itemRemover(tile);

        expect(tile.item).toBeNull();
        expect(service.updateItemLimitCounter).toHaveBeenCalledWith(1);
        expect(gameMapDataManagerServiceSpy.isGameUpdated).toBeTrue();
        expect(service.sideMenuItemsEnabler).toHaveBeenCalled();

        service.itemLimitCounter = 0;
        const item2 = new Spawn();
        const tile2 = new GrassTile();
        tile2.item = item2;
        spyOn(service, 'sideMenuItemsDisabler');

        service.itemRemover(tile2);

        expect(service.sideMenuItemsDisabler).toHaveBeenCalled();
    });

    it('item remover should not accept not terrain tiles', () => {
        const tile = new WallTile();
        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(false);
        spyOn(service, 'sideMenuItemFinder');

        service.itemRemover(tile);

        expect(service.sideMenuItemFinder).not.toHaveBeenCalled();
    });

    it('should handle left-click on map tile with selected entity', () => {
        const tile = new GrassTile();
        tile.coordinates = { x: 0, y: 0 };
        const selectedTile = new WaterTile();
        service.sideMenuSelectedEntity = selectedTile;
        spyOn(service, 'tileCopyCreator');

        service.leftClickMapTile(tile);

        expect(service.tileCopyCreator).toHaveBeenCalledWith(selectedTile, tile);

        const selectedItem = new DiamondSword();
        service.sideMenuSelectedEntity = selectedItem;
        spyOn(service, 'itemPlacer');
        spyOn(service, 'cancelSelectionSideMenu');
        gameMapDataManagerServiceSpy.isItem.and.returnValue(true);
        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(true);

        service.leftClickMapTile(tile);

        expect(service.itemPlacer).toHaveBeenCalledWith(selectedItem, tile);
        expect(service.cancelSelectionSideMenu).toHaveBeenCalled();
    });

    it('should handle left-click on map tile with bad values', () => {
        const tile = new DoorTile();
        tile.coordinates = { x: 0, y: 0 };
        service.sideMenuSelectedEntity = null;
        spyOn(service, 'tileCopyCreator');

        service.leftClickMapTile(tile);

        expect(service.tileCopyCreator).not.toHaveBeenCalled();
    });

    it('should handle left-click on map with closed doors', () => {
        const selectedTile = new DoorTile();
        selectedTile.coordinates = { x: 0, y: 0 };
        service.sideMenuSelectedEntity = selectedTile;
        gameMapDataManagerServiceSpy.isDoor.and.returnValue(true);
        tileFactoryServiceSpy.copyFromTile.and.returnValue(new OpenDoor());
        spyOn(service, 'tileCopyCreator');

        service.leftClickMapTile(selectedTile);

        expect(service.tileCopyCreator).toHaveBeenCalledWith(jasmine.any(OpenDoor), selectedTile);
    });

    it('should handle left-click on map with open doors', () => {
        const selectedTile = new OpenDoor();
        selectedTile.coordinates = { x: 0, y: 0 };
        service.sideMenuSelectedEntity = selectedTile;
        gameMapDataManagerServiceSpy.isDoor.and.returnValue(true);
        tileFactoryServiceSpy.copyFromTile.and.returnValue(new DoorTile());
        spyOn(service, 'tileCopyCreator');

        service.leftClickMapTile(selectedTile);

        expect(service.tileCopyCreator).toHaveBeenCalledWith(jasmine.any(DoorTile), selectedTile);
    });

    it('should handle right-click on map tile', () => {
        const tile = new WaterTile();
        tile.coordinates = { x: 0, y: 0 };
        const event = new MouseEvent('contextmenu');
        spyOn(event, 'preventDefault');
        spyOn(service, 'tileCopyCreator');

        service.rightClickMapTile(event, tile);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(service.tileCopyCreator).toHaveBeenCalledWith(jasmine.any(GrassTile), tile);

        const item = new DiamondSword();
        tile.item = item;
        spyOn(service, 'itemRemover');

        service.rightClickMapTile(event, tile);

        expect(service.itemRemover).toHaveBeenCalledWith(tile);
    });

    it('should handle right-click on map tile with bad values', () => {
        const tile = new GrassTile();
        tile.coordinates = { x: 0, y: 0 };
        const event = new MouseEvent('contextmenu');
        spyOn(event, 'preventDefault');
        spyOn(service, 'tileCopyCreator');

        service.rightClickMapTile(event, tile);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(service.tileCopyCreator).not.toHaveBeenCalled();

        const tile2 = new WallTile();
        tile2.coordinates = { x: 0, y: 0 };
        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(true);

        service.rightClickMapTile(event, tile2);

        expect(service.tileCopyCreator).toHaveBeenCalled();
    });

    it('should call leftClickMapTile when left mouse button is clicked', () => {
        const tile = new GrassTile();
        const event = new MouseEvent('mousedown', { button: 0 });
        spyOn(service, 'leftClickMapTile');

        service.onMouseDownMapTile(event, tile);

        expect(service.leftClickMapTile).toHaveBeenCalledWith(tile);
    });

    it('should call rightClickMapTile when right mouse button is clicked', () => {
        const tile = new GrassTile();
        const event = new MouseEvent('mousedown', { button: 2 });
        spyOn(service, 'rightClickMapTile');

        service.onMouseDownMapTile(event, tile);

        expect(service.rightClickMapTile).toHaveBeenCalledWith(event, tile);
    });

    it('should call tileCopyCreator when dragging left and sideMenuSelectedEntity is a tile', () => {
        const tile = new GrassTile();
        const selectedTile = new WaterTile();
        service.sideMenuSelectedEntity = selectedTile;
        service.isDraggingLeft = true;
        gameMapDataManagerServiceSpy.isItem.and.returnValue(false);
        spyOn(service, 'tileCopyCreator');

        service.onMouseMoveMapTile(tile);

        expect(service.tileCopyCreator).toHaveBeenCalledWith(selectedTile, tile);
    });

    it('should remove item and replace tile when dragging right over a non-grass tile', () => {
        const tile = new WaterTile();
        service.isDraggingRight = true;
        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(true);
        spyOn(service, 'itemRemover');
        spyOn(service, 'tileCopyCreator');

        service.onMouseMoveMapTile(tile);

        expect(service.itemRemover).toHaveBeenCalledWith(tile);
        expect(service.tileCopyCreator).toHaveBeenCalledWith(jasmine.any(GrassTile), tile);
    });

    it('should only remove item when dragging right over a grass tile', () => {
        const tile = new GrassTile();
        service.isDraggingRight = true;
        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(true);
        spyOn(service, 'itemRemover');
        spyOn(service, 'tileCopyCreator');

        service.onMouseMoveMapTile(tile);

        expect(service.itemRemover).toHaveBeenCalledWith(tile);
        expect(service.tileCopyCreator).not.toHaveBeenCalled();
    });

    it('should reset dragging flags on mouse up', () => {
        service.isDraggingLeft = true;
        service.isDraggingRight = true;

        service.onMouseUp();

        expect(service.isDraggingLeft).toBeFalse();
        expect(service.isDraggingRight).toBeFalse();
    });

    it('should deselect entity if it is already selected', () => {
        const entity = new WaterTile();
        entity.visibleState = VisibleState.Selected;
        service.sideMenuSelectedEntity = entity;
        spyOn(service, 'cancelSelectionMap');

        service.onMouseDownSideMenu(entity);

        expect(entity.visibleState).not.toBe(VisibleState.Selected);
        expect(service.sideMenuSelectedEntity).toBeNull();
        expect(service.cancelSelectionMap).toHaveBeenCalled();
    });

    it('should do nothing if entity is disabled', () => {
        const entity = new WaterTile();
        entity.visibleState = VisibleState.Disabled;
        spyOn(service, 'cancelSelectionMap');
        spyOn(service, 'cancelSelectionSideMenu');
        spyOn(service, 'makeSelection');

        service.onMouseDownSideMenu(entity);

        expect(service.cancelSelectionMap).not.toHaveBeenCalled();
        expect(service.cancelSelectionSideMenu).not.toHaveBeenCalled();
        expect(service.makeSelection).not.toHaveBeenCalled();
    });

    it('should select new entity if different from current selection', () => {
        const entity1 = new WaterTile();
        const entity2 = new IceTile();
        entity1.visibleState = VisibleState.Selected;
        service.sideMenuSelectedEntity = entity1;
        spyOn(service, 'cancelSelectionSideMenu');
        spyOn(service, 'makeSelection');

        service.onMouseDownSideMenu(entity2);

        expect(service.cancelSelectionSideMenu).toHaveBeenCalled();
        expect(service.makeSelection).toHaveBeenCalledWith(entity2);
    });

    it('should select entity if no current selection', () => {
        const entity = new WaterTile();
        spyOn(service, 'makeSelection');

        service.onMouseDownSideMenu(entity);

        expect(service.makeSelection).toHaveBeenCalledWith(entity);
    });

    it('should reset item list and perform map item checkup', () => {
        spyOn(service, 'resetItemList');
        spyOn(service, 'mapItemCheckup');

        service.itemCheckup();

        expect(service.resetItemList).toHaveBeenCalled();
        expect(service.mapItemCheckup).toHaveBeenCalled();
    });

    it('should update item limits based on items on the map', () => {
        const item1 = new DiamondSword();
        const item2 = new Potion();
        const tile1 = new GrassTile();
        tile1.item = item1;
        const tile2 = new GrassTile();
        tile2.item = item2;

        gameMapDataManagerServiceSpy.currentGrid = [[tile1, tile2]];

        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(true);
        spyOn(service, 'sideMenuItemFinder').and.callFake((item) => {
            if (item === item1) {
                return item1;
            } else if (item === item2) {
                return item2;
            }
            return null;
        });
        spyOn(service, 'updateItemLimitCounter');
        spyOn(service, 'sideMenuItemsDisabler');
        spyOn(service, 'sideMenuItemsEnabler');

        service.itemLimitCounter = 6;

        service.mapItemCheckup();

        expect(service.updateItemLimitCounter).toHaveBeenCalledTimes(2);
        expect(service.updateItemLimitCounter).toHaveBeenCalledWith(-1);
        expect(service.sideMenuItemsDisabler).not.toHaveBeenCalled();
        expect(service.sideMenuItemsEnabler).toHaveBeenCalled();

        service.itemLimitCounter = 0;

        service.mapItemCheckup();

        expect(service.sideMenuItemsDisabler).toHaveBeenCalled();
    });

    it('should disable items with visibleState NotSelected and type not Spawn', () => {
        const item1 = new DiamondSword();
        item1.visibleState = VisibleState.NotSelected;
        item1.type = ItemType.Sword;

        const item2 = new Spawn();
        item2.visibleState = VisibleState.NotSelected;
        item2.type = ItemType.Spawn;

        service.placeableEntitiesSections[1].entities = [item1, item2];

        service.sideMenuItemsDisabler();

        expect(item1.visibleState).not.toBe(VisibleState.NotSelected);
        expect(item2.visibleState).toBe(VisibleState.NotSelected);
    });

    it('should enable items with itemLimit > 0', () => {
        const item1 = new DiamondSword();
        item1.itemLimit = 1;
        item1.visibleState = VisibleState.Disabled;

        const item2 = new Potion();
        item2.itemLimit = 0;
        item2.visibleState = VisibleState.Disabled;

        service.placeableEntitiesSections[1].entities = [item1, item2];

        service.sideMenuItemsEnabler();

        expect(item1.visibleState).not.toBe(VisibleState.Disabled);
        expect(item2.visibleState).toBe(VisibleState.Disabled);
    });
});
