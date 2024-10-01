import { TestBed } from '@angular/core/testing';
import { Flag } from '@app/classes/Items/flag';
import { Item } from '@app/classes/Items/item';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { WaterTile } from '@app/classes/Tiles/water-tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '../game-board-services/game-map-data-manager.service';
import { ItemFactoryService } from '../game-board-services/item-factory.service';
import { TileFactoryService } from '../game-board-services/tile-factory.service';
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
    });

    it('should initialize placeableEntitiesSections correctly', () => {
        service.init();

        expect(service.placeableEntitiesSections.length).toBe(2);
        expect(service.placeableEntitiesSections[0].title).toBe('Tuiles');
        expect(service.placeableEntitiesSections[0].entities.length).toBe(4);
        expect(service.placeableEntitiesSections[1].title).toBe('Objets');
        expect(service.placeableEntitiesSections[1].entities.length).toBe(8);
    });

    it('should reset item list correctly without CTF', () => {
        gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(false);
        service.init();

        expect(service.placeableEntitiesSections[1].entities.length).toBe(8);
    });

    it('should reset item list correctly with CTF', () => {
        gameMapDataManagerServiceSpy.isGameModeCTF.and.returnValue(true);
        service.init();

        expect(service.placeableEntitiesSections[1].entities.length).toBe(9);

        const lastEntity = service.placeableEntitiesSections[1].entities[8];
        expect(lastEntity instanceof Flag).toBeTrue();
    });

    it('should set item limits correctly when itemLimit is 2', () => {
        gameMapDataManagerServiceSpy.itemLimit.and.returnValue(2);
        service.init();

        service.setItemLimit();

        const spawnItem = service.placeableEntitiesSections[1].entities[6] as Item;
        const randomItem = service.placeableEntitiesSections[1].entities[7] as Item;

        expect(spawnItem.itemLimit).toBe(2);
        expect(randomItem.itemLimit).toBe(2);
        expect(service.itemLimitCounter).toBe(2);
    });

    it('should set item limits correctly when itemLimit is 4', () => {
        gameMapDataManagerServiceSpy.itemLimit.and.returnValue(4);
        service.init();

        service.setItemLimit();

        const spawnItem = service.placeableEntitiesSections[1].entities[6] as Item;
        const randomItem = service.placeableEntitiesSections[1].entities[7] as Item;

        expect(spawnItem.itemLimit).toBe(4);
        expect(randomItem.itemLimit).toBe(4);
        expect(service.itemLimitCounter).toBe(4);
    });

    it('should set item limits correctly when itemLimit is 6', () => {
        gameMapDataManagerServiceSpy.itemLimit.and.returnValue(6);
        service.init();

        service.setItemLimit();

        const spawnItem = service.placeableEntitiesSections[1].entities[6] as Item;
        const randomItem = service.placeableEntitiesSections[1].entities[7] as Item;

        expect(spawnItem.itemLimit).toBe(6);
        expect(randomItem.itemLimit).toBe(6);
        expect(service.itemLimitCounter).toBe(6);
    });

    it('should select an entity and deselect map selection', () => {
        service.init();
        const entity: Item = service.placeableEntitiesSections[1].entities[0] as Item;
        spyOn(service, 'cancelSelectionMap');

        service.makeSelection(entity);

        expect(entity.visibleState).toBe(VisibleState.selected);
        expect(service.sideMenuSelectedEntity).toBe(entity);
        expect(service.cancelSelectionMap).toHaveBeenCalled();
    });

    it('should place an item on the selected tile and update limits', () => {
        service.init();
        const item: Item = service.placeableEntitiesSections[1].entities[0] as Item;
        const selectedTile: GrassTile = new GrassTile();
        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(true);
        gameMapDataManagerServiceSpy.isItem.and.returnValue(true);
        itemFactoryServiceSpy.copyItem.and.returnValue(item);

        item.itemLimit = 1;
        service.itemLimitCounter = 1;

        service.itemPlacer(item, selectedTile);

        expect(selectedTile.item).toBe(item);
        expect(item.itemLimit).toBe(0);
        expect(service.itemLimitCounter).toBe(0);
        expect(item.visibleState).toBe(VisibleState.disabled);
        expect(service.sideMenuSelectedEntity).toBeNull();
    });

    it('should remove an item from the tile and update limits', () => {
        service.init();
        const item: Item = service.placeableEntitiesSections[1].entities[0] as Item;
        const selectedTile: GrassTile = new GrassTile();
        selectedTile.item = item;
        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(true);
        gameMapDataManagerServiceSpy.isItem.and.returnValue(true);

        item.itemLimit = 0;
        service.itemLimitCounter = 0;

        service.itemRemover(selectedTile);

        expect((selectedTile as TerrainTile).item).toBeNull();
        expect(item.itemLimit).toBe(1);
        expect(service.itemLimitCounter).toBe(1);
        expect(item.visibleState).toBe(VisibleState.notSelected);
    });

    it('should handle left click on map tile for item placement', () => {
        service.init();
        const entity: GrassTile = new GrassTile();
        const selectedEntity: Item = service.placeableEntitiesSections[1].entities[0] as Item;
        service.sideMenuSelectedEntity = selectedEntity;
        gameMapDataManagerServiceSpy.isItem.and.returnValue(true);
        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(true);

        spyOn(service, 'itemPlacer');

        service.onMouseDownMapTile({ button: 0 } as MouseEvent, entity);

        expect(service.isDraggingLeft).toBeTrue();
        expect(service.itemPlacer).toHaveBeenCalledWith(selectedEntity, entity);
    });

    it('should handle right click on map tile for item removal', () => {
        service.init();
        const entity: GrassTile = new GrassTile();
        entity.item = service.placeableEntitiesSections[1].entities[0] as Item;
        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(true);

        spyOn(service, 'itemRemover');

        const mouseEvent = { button: 2, preventDefault: jasmine.createSpy('preventDefault') } as unknown as MouseEvent;

        service.onMouseDownMapTile(mouseEvent, entity);

        expect(service.isDraggingRight).toBeTrue();
        expect(mouseEvent.preventDefault).toHaveBeenCalled();
        expect(service.itemRemover).toHaveBeenCalledWith(entity);
    });

    it('should handle dragging left to place tiles', () => {
        service.init();
        const entity: GrassTile = new GrassTile();
        const selectedEntity: IceTile = new IceTile();
        service.sideMenuSelectedEntity = selectedEntity;
        service.isDraggingLeft = true;
        gameMapDataManagerServiceSpy.isItem.and.returnValue(false);
        gameMapDataManagerServiceSpy.isTerrainTile.and.returnValue(true);
        tileFactoryServiceSpy.copyFromTile.and.returnValue(selectedEntity);

        spyOn(service, 'tileCopyCreator');

        service.onMouseMoveMapTile(entity);

        expect(service.tileCopyCreator).toHaveBeenCalledWith(selectedEntity, entity);
    });

    // it('should handle dragging right to remove items and place grass tiles', () => {
    //     service.init();
    //     const entityWithItem: GrassTile = new GrassTile();
    //     entityWithItem.item = service.placeableEntitiesSections[1].entities[0] as Item;
    //     const entityWithoutItem: DoorTile = new DoorTile();
    //     gameMapDataManagerServiceSpy.isItem.and.returnValue(false);

    //     spyOn(service, 'itemRemover');
    //     tileFactoryServiceSpy.copyFromTile.and.returnValue(new GrassTile());

    //     service.isDraggingRight = true;

    //     service.onMouseMoveMapTile(entityWithItem);
    //     expect(service.itemRemover).toHaveBeenCalledWith(entityWithItem);
    //     expect(tileFactoryServiceSpy.copyFromTile).not.toHaveBeenCalled();

    //     service.onMouseMoveMapTile(entityWithoutItem);
    //     expect(tileFactoryServiceSpy.copyFromTile).toHaveBeenCalledWith(new GrassTile());
    // });

    it('should cancel selection from side menu', () => {
        service.init();
        const entity: Item = service.placeableEntitiesSections[1].entities[0] as Item;
        service.sideMenuSelectedEntity = entity;
        service.selectedEntity = new GrassTile();
        const foundEntity: Item = service.placeableEntitiesSections[1].entities[0] as Item;

        spyOn(service, 'sideMenuEntityFinder').and.returnValue(foundEntity);
        service.cancelSelectionSideMenu();

        expect(foundEntity.visibleState).toBe(VisibleState.notSelected);
        expect(service.selectedEntity).toBeNull();
        expect(service.sideMenuSelectedEntity).toBeNull();
    });

    it('should cancel selection from map', () => {
        service.init();
        const entity: WaterTile = new WaterTile();
        service.selectedEntity = entity;
        entity.visibleState = VisibleState.selected;
        const foundEntity = service.placeableEntitiesSections[0].entities[1] as Tile;

        spyOn(service, 'sideMenuEntityFinder').and.returnValue(foundEntity);
        service.cancelSelectionMap();

        expect(foundEntity.visibleState).toBe(VisibleState.notSelected);
        expect(service.selectedEntity).toBeNull();
    });
});
