import { TestBed } from '@angular/core/testing';
import { Chestplate } from '@app/classes/Items/chestplate';
import { DiamondSword } from '@app/classes/Items/diamond-sword';
import { RandomItem } from '@app/classes/Items/random-item';
import { Spawn } from '@app/classes/Items/spawn';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { OpenDoor } from '@app/classes/Tiles/open-door';
import { WaterTile } from '@app/classes/Tiles/water-tile';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { ItemFactoryService } from '@app/services/game-board-services/item-factory.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
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
        gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(true);
        gameMapDataManagerServiceSpy.itemLimit.and.returnValue(6);
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

        expect(service.itemLimitCounter).toBe(5);
        expect(randomItem.itemLimit).toBe(5);
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

        expect(entity.visibleState).toBe(VisibleState.NotSelected);
    });

    it('should copy a terrain tile under tile with item', () => {
        const tile = new GrassTile();
        tile.coordinates = { x: 0, y: 0 };
        const item = new DiamondSword();
        tile.item = item;
        gameMapDataManagerServiceSpy.currentGrid = [[tile]];

        let copiedTile = new WaterTile();
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

        let copiedTile = new DoorTile();
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
    });
});
