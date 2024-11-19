/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { Item } from '@common/classes/Items/item';
import { DoorTile } from '@common/classes/Tiles/door-tile';
import { GrassTile } from '@common/classes/Tiles/grass-tile';
import { OpenDoor } from '@common/classes/Tiles/open-door';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { WaterTile } from '@common/classes/Tiles/water-tile';
import { ItemType } from '@common/enums/item-type';
import { PlaceableEntity, VisibleState } from '@common/interfaces/placeable-entity';
import { Vec2 } from '@common/interfaces/vec2';
import { MapEditorMouseHandlerService, MouseButton } from './map-editor-mouse-handler.service';

describe('MapEditorMouseHandlerService', () => {
    let service: MapEditorMouseHandlerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MapEditorMouseHandlerService],
        });
        service = TestBed.inject(MapEditorMouseHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set visibleState to Hovered if not selected', () => {
        const entity: PlaceableEntity = {
            visibleState: VisibleState.NotSelected,
            isItem: () => false,
            description: '',
            imageUrl: '',
            coordinates: { x: -1, y: -1 },
        };
        service.onMouseEnter(entity);
        expect(entity.visibleState).toBe(VisibleState.Hovered);
    });

    it('should set isItemInPlace to true if the dragged item matches', () => {
        const mockItem: Item = { type: ItemType.Sword, isItem: () => true } as unknown as Item;
        service['lastDraggedItem'] = mockItem;
        service['isDraggingItem'] = true;

        spyOn(service, 'getDraggedItem').and.returnValue(mockItem);

        service.onMouseEnter(mockItem);

        expect(service['isItemInPlace']).toBeTrue();
    });

    it('should set visibleState to NotSelected if currently Hovered', () => {
        const entity: PlaceableEntity = {
            visibleState: VisibleState.Hovered,
            isItem: () => false,
            description: '',
            imageUrl: '',
            coordinates: { x: -1, y: -1 },
        };

        service.onMouseLeave(entity);

        expect(entity.visibleState).toBe(VisibleState.NotSelected);
    });

    it('should not change visibleState if it is not Hovered', () => {
        const entity: PlaceableEntity = {
            visibleState: VisibleState.Selected,
            isItem: () => false,
            description: '',
            imageUrl: '',
            coordinates: { x: -1, y: -1 },
        };

        service.onMouseLeave(entity);

        expect(entity.visibleState).toBe(VisibleState.Selected);
    });

    it('should call leftMouseDownMapTile when left mouse button is pressed', () => {
        const mockTile = new GrassTile();
        spyOn(service, 'leftMouseDownMapTile');
        const mockEvent = new MouseEvent('mousedown', { button: MouseButton.Left });

        service.onMouseDownMapTile(mockEvent, mockTile);

        expect(service['leftMouseDownMapTile']).toHaveBeenCalledWith(mockTile);
    });

    it('should call rightMouseDownMapTile when right mouse button is pressed', () => {
        const mockTile = new GrassTile();
        spyOn(service, 'rightMouseDownMapTile');
        const mockEvent = new MouseEvent('mousedown', { button: MouseButton.Right });

        service.onMouseDownMapTile(mockEvent, mockTile);

        expect(service['rightMouseDownMapTile']).toHaveBeenCalledWith(mockEvent, mockTile);
    });

    it('should remove item and signal item dragging if terrain tile has an item', () => {
        const mockTerrainTile = new GrassTile() as TerrainTile;
        mockTerrainTile.item = { type: ItemType.Sword, isItem: () => true } as Item;
        mockTerrainTile.coordinates = { x: 1, y: 1 };

        spyOn(service['signalItemRemover'], 'next');
        spyOn(service['signalItemDragged'], 'next');

        service.leftMouseDownMapTile(mockTerrainTile);

        expect(service['lastDraggedItemCoordinates']).toEqual(mockTerrainTile.coordinates);
        expect(service['signalItemRemover'].next).toHaveBeenCalledWith(mockTerrainTile);
        expect(service['signalItemDragged'].next).toHaveBeenCalledWith(ItemType.Sword);
    });

    it('should return early if sideMenuSelectedEntity is not set', () => {
        spyOn(service['signalTileCopy'], 'next');

        const mockTile = new GrassTile();
        service['sideMenuSelectedEntity'] = null;

        service.leftMouseDownMapTile(mockTile);

        expect(service['signalTileCopy'].next).not.toHaveBeenCalled();
    });

    it('should toggle door tile to OpenDoor when a DoorTile is clicked and selected entity is a door', () => {
        const mockDoorTile = new DoorTile();
        service['sideMenuSelectedEntity'] = new DoorTile();

        spyOn(service['signalTileCopy'], 'next');

        service.leftMouseDownMapTile(mockDoorTile);

        expect(service['signalTileCopy'].next).toHaveBeenCalledWith({ tile: new OpenDoor(), entity: mockDoorTile });
    });

    it('should toggle OpenDoor to DoorTile when an OpenDoor is clicked and selected entity is a door', () => {
        const mockOpenDoorTile = new OpenDoor();
        service['sideMenuSelectedEntity'] = new DoorTile();

        spyOn(service['signalTileCopy'], 'next');

        service.leftMouseDownMapTile(mockOpenDoorTile);

        expect(service['signalTileCopy'].next).toHaveBeenCalledWith({ tile: new DoorTile(), entity: mockOpenDoorTile });
    });

    it('should signal tile copy if the tile is not terrain or does not have an item', () => {
        const mockTile = new OpenDoor();
        spyOn(service['signalTileCopy'], 'next');

        service.rightMouseDownMapTile(new MouseEvent('mousedown', { button: 2 }), mockTile);

        expect(service['signalTileCopy'].next).toHaveBeenCalledWith({ tile: jasmine.any(GrassTile), entity: mockTile });
    });

    it('should signal tile copy if the tile is not terrain or does not have an item', () => {
        const mockTile = new WaterTile();
        spyOn(service['signalTileCopy'], 'next');

        service.rightMouseDownMapTile(new MouseEvent('mousedown', { button: 2 }), mockTile);

        expect(service['signalTileCopy'].next).toHaveBeenCalledWith({ tile: jasmine.any(GrassTile), entity: mockTile });
    });

    it('should not signal tile copy when selected entity is an item', () => {
        const mockTile = new GrassTile();
        service['sideMenuSelectedEntity'] = { isItem: () => true } as unknown as Item;

        spyOn(service['signalTileCopy'], 'next');

        service.leftMouseDownMapTile(mockTile);

        expect(service['signalTileCopy'].next).not.toHaveBeenCalled();
    });

    it('should set isDraggingRight to true and prevent default event behavior', () => {
        const mockTile = new GrassTile();
        const mockEvent = new MouseEvent('mousedown', { button: 2 });

        spyOn(mockEvent, 'preventDefault');

        service.rightMouseDownMapTile(mockEvent, mockTile);

        expect(service['isDraggingRight']).toBeTrue();
        expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should return early if the entity is a GrassTile without an item', () => {
        const mockTile = new GrassTile();
        mockTile.item = null;

        spyOn(service['signalItemRemover'], 'next');
        spyOn(service['signalTileCopy'], 'next');

        service.rightMouseDownMapTile(new MouseEvent('mousedown', { button: 2 }), mockTile);

        expect(service['signalItemRemover'].next).not.toHaveBeenCalled();
        expect(service['signalTileCopy'].next).not.toHaveBeenCalled();
    });

    it('should signal item removal if the tile has an item', () => {
        const mockTile = new GrassTile() as TerrainTile;
        mockTile.item = { type: 'Sword', isItem: () => true } as Item;

        spyOn(service['signalItemRemover'], 'next');

        service.rightMouseDownMapTile(new MouseEvent('mousedown', { button: 2 }), mockTile);

        expect(service['signalItemRemover'].next).toHaveBeenCalledWith(mockTile);
    });

    it('should signal tile copy when dragging left and the selected entity is not an item', () => {
        const mockTile = new GrassTile();
        const sideMenuTile = new GrassTile();

        service['sideMenuSelectedEntity'] = sideMenuTile;
        service['isDraggingLeft'] = true;
        spyOn(service['signalTileCopy'], 'next');

        service.onMouseMoveMapTile(mockTile);

        expect(service['signalTileCopy'].next).toHaveBeenCalledWith({ tile: sideMenuTile, entity: mockTile });
    });

    it('should not signal tile copy when dragging left if the selected entity is an item', () => {
        const mockTile = new GrassTile();
        const sideMenuItem = { isItem: () => true } as unknown as Tile;

        service['sideMenuSelectedEntity'] = sideMenuItem;
        service['isDraggingLeft'] = true;
        spyOn(service['signalTileCopy'], 'next');

        service.onMouseMoveMapTile(mockTile);

        expect(service['signalTileCopy'].next).not.toHaveBeenCalled();
    });

    it('should signal item removal when dragging right and the tile is terrain', () => {
        const mockTerrainTile = new GrassTile() as TerrainTile;
        mockTerrainTile.item = { type: 'Sword', isItem: () => true } as Item;

        service['isDraggingRight'] = true;
        spyOn(service['signalItemRemover'], 'next');

        service.onMouseMoveMapTile(mockTerrainTile);

        expect(service['signalItemRemover'].next).toHaveBeenCalledWith(mockTerrainTile);
    });

    it('should signal tile copy when dragging right and the tile is not a GrassTile', () => {
        const mockTile = new DoorTile();

        service['isDraggingRight'] = true;
        spyOn(service['signalTileCopy'], 'next');

        service.onMouseMoveMapTile(mockTile);

        expect(service['signalTileCopy'].next).toHaveBeenCalledWith({ tile: jasmine.any(GrassTile), entity: mockTile });
    });

    it('should not signal tile copy when dragging right if the tile is a GrassTile', () => {
        const mockTile = new GrassTile();

        service['isDraggingRight'] = true;
        spyOn(service['signalTileCopy'], 'next');

        service.onMouseMoveMapTile(mockTile);

        expect(service['signalTileCopy'].next).not.toHaveBeenCalled();
    });

    it('should signal item placement if selected entity is an item and tile is terrain', () => {
        const mockItem = { type: ItemType.Sword, isItem: () => true } as unknown as Item;
        const mockTile = new GrassTile() as TerrainTile;

        service['sideMenuSelectedEntity'] = mockItem;
        spyOn(service['signalItemPlacer'], 'next');

        service.onMapTileMouseUp(mockTile);

        expect(service['signalItemPlacer'].next).toHaveBeenCalledWith({
            item: mockItem,
            entity: mockTile,
        });
    });

    it('should not signal item placement if selected entity is not an item', () => {
        const mockTile = new GrassTile() as TerrainTile;
        const mockNonItemEntity = new DoorTile();

        service['sideMenuSelectedEntity'] = mockNonItemEntity;
        spyOn(service['signalItemPlacer'], 'next');

        service.onMapTileMouseUp(mockTile);

        expect(service['signalItemPlacer'].next).not.toHaveBeenCalled();
    });

    it('should signal item placement with coordinates if lastDraggedItemCoordinates is set', () => {
        const mockItem = { type: ItemType.Sword, isItem: () => true } as unknown as Item;
        const mockCoordinates = { x: 2, y: 2 } as Vec2;

        service['sideMenuSelectedEntity'] = mockItem;
        service['lastDraggedItemCoordinates'] = mockCoordinates;
        spyOn(service['signalItemPlacerWithCoordinates'], 'next');

        service.onMapTileMouseUp(new Tile());

        expect(service['signalItemPlacerWithCoordinates'].next).toHaveBeenCalledWith({
            item: mockItem,
            coordinates: mockCoordinates,
        });
    });

    it('should not signal item placement with coordinates if lastDraggedItemCoordinates is not set', () => {
        const mockItem = { type: ItemType.Sword, isItem: () => true } as unknown as Item;

        service['sideMenuSelectedEntity'] = mockItem;
        service['lastDraggedItemCoordinates'] = null; // No dragged item coordinates
        spyOn(service['signalItemPlacerWithCoordinates'], 'next');

        service.onMapTileMouseUp(new GrassTile());

        expect(service['signalItemPlacerWithCoordinates'].next).not.toHaveBeenCalled();
    });

    beforeEach(() => {
        service['lastDraggedItem'] = { type: 'Sword', isItem: () => true } as unknown as Item;
        service['lastDraggedItemCoordinates'] = { x: 1, y: 1 } as Vec2;
    });

    it('should signal item in place if isItemInPlace is true', () => {
        service['isDraggingItem'] = true;
        service['isItemInPlace'] = true;

        spyOn(service['signalItemInPlace'], 'next');
        spyOn(service, 'cancelSelectionSideMenu');

        service.onMouseUp();

        expect(service['signalItemInPlace'].next).toHaveBeenCalledWith({
            item: service['lastDraggedItem'] as Item,
            coordinates: service['lastDraggedItemCoordinates'] as Vec2,
        });
        expect(service.cancelSelectionSideMenu).toHaveBeenCalled();
        expect(service['isDraggingLeft']).toBeFalse();
        expect(service['isDraggingRight']).toBeFalse();
    });

    it('should signal item placement with coordinates if item is out of map and coordinates are set', () => {
        service['isDraggingItem'] = true;
        service['isItemInPlace'] = false;
        spyOn(service, 'isItemOutOfMap').and.returnValue(true);

        spyOn(service['signalItemPlacerWithCoordinates'], 'next');
        spyOn(service, 'cancelSelectionSideMenu');

        service.onMouseUp();

        expect(service['signalItemPlacerWithCoordinates'].next).toHaveBeenCalledWith({
            item: service['lastDraggedItem'] as Item,
            coordinates: service['lastDraggedItemCoordinates'] as Vec2,
        });
        expect(service.cancelSelectionSideMenu).toHaveBeenCalled();
        expect(service['isDraggingLeft']).toBeFalse();
        expect(service['isDraggingRight']).toBeFalse();
    });

    it('should not signal item placement if not dragging an item', () => {
        service['isDraggingItem'] = false;

        spyOn(service['signalItemInPlace'], 'next');
        spyOn(service['signalItemPlacerWithCoordinates'], 'next');
        spyOn(service, 'cancelSelectionSideMenu');

        service.onMouseUp();

        expect(service['signalItemInPlace'].next).not.toHaveBeenCalled();
        expect(service['signalItemPlacerWithCoordinates'].next).not.toHaveBeenCalled();
        expect(service.cancelSelectionSideMenu).not.toHaveBeenCalled();
        expect(service['isDraggingLeft']).toBeFalse();
        expect(service['isDraggingRight']).toBeFalse();
    });

    it('should return early if entity is disabled', () => {
        const mockEntity = { visibleState: VisibleState.Disabled, isItem: () => false } as unknown as PlaceableEntity;

        spyOn(service, 'cancelSelectionSideMenu');
        spyOn(service, 'makeSelection');

        service.onMouseDownSideMenu(mockEntity);

        expect(service.cancelSelectionSideMenu).not.toHaveBeenCalled();
        expect(service.makeSelection).not.toHaveBeenCalled();
    });

    it('should deselect an already selected entity', () => {
        const mockEntity = { visibleState: VisibleState.Selected, isItem: () => false } as unknown as PlaceableEntity;

        service['sideMenuSelectedEntity'] = mockEntity;

        service.onMouseDownSideMenu(mockEntity);

        expect(mockEntity.visibleState).toBe(VisibleState.NotSelected);
        expect(service['sideMenuSelectedEntity']).toBeNull();
    });

    it('should cancel previous selection and make a new selection when a different entity is selected', () => {
        const mockEntity1 = { visibleState: VisibleState.Selected, isItem: () => false } as unknown as PlaceableEntity;
        const mockEntity2 = { visibleState: VisibleState.NotSelected, isItem: () => false } as unknown as PlaceableEntity;

        service['sideMenuSelectedEntity'] = mockEntity1;

        spyOn(service, 'cancelSelectionSideMenu');
        spyOn(service, 'makeSelection');

        service.onMouseDownSideMenu(mockEntity2);

        expect(service.cancelSelectionSideMenu).toHaveBeenCalled();
        expect(service.makeSelection).toHaveBeenCalledWith(mockEntity2);
    });

    it('should make a new selection if no entity is currently selected', () => {
        const mockEntity = { visibleState: VisibleState.NotSelected, isItem: () => false } as unknown as PlaceableEntity;

        service['sideMenuSelectedEntity'] = null;

        spyOn(service, 'makeSelection');

        service.onMouseDownSideMenu(mockEntity);

        expect(service.makeSelection).toHaveBeenCalledWith(mockEntity);
    });

    it('should set the entity visibleState to Selected and update sideMenuSelectedEntity', () => {
        const mockEntity = { visibleState: VisibleState.NotSelected, isItem: () => false } as unknown as PlaceableEntity;

        service.makeSelection(mockEntity);

        expect(mockEntity.visibleState).toBe(VisibleState.Selected);
        expect(service['sideMenuSelectedEntity']).toBe(mockEntity);
    });

    it('should set isDraggingItem to true and update lastDraggedItem if entity is an item', () => {
        const mockItem = { isItem: () => true } as unknown as Item;

        service.makeSelection(mockItem);

        expect(service['isDraggingItem']).toBeTrue();
        expect(service['lastDraggedItem']).toBe(mockItem);
    });

    it('should set isDraggingItem to false if entity is not an item', () => {
        service['lastDraggedItem'] = null;

        const mockEntity = { isItem: () => false } as unknown as PlaceableEntity;

        service.makeSelection(mockEntity);

        expect(service['isDraggingItem']).toBeFalse();
        expect(service['lastDraggedItem']).toBeNull();
    });

    it('should signal cancel selection and clear sideMenuSelectedEntity when an entity is selected', () => {
        const mockEntity = { visibleState: VisibleState.Selected, isItem: () => false } as unknown as PlaceableEntity;

        service['sideMenuSelectedEntity'] = mockEntity;
        service['isDraggingItem'] = true;

        spyOn(service['signalCancelSelection'], 'next');

        service.cancelSelectionSideMenu();

        expect(service['signalCancelSelection'].next).toHaveBeenCalledWith(mockEntity);
        expect(service['sideMenuSelectedEntity']).toBeNull();
        expect(service['isDraggingItem']).toBeFalse();
    });

    it('should not signal or change anything if no entity is selected', () => {
        service['sideMenuSelectedEntity'] = null;

        spyOn(service['signalCancelSelection'], 'next');

        service.cancelSelectionSideMenu();

        expect(service['signalCancelSelection'].next).not.toHaveBeenCalled();
        expect(service['sideMenuSelectedEntity']).toBeNull();
        expect(service['isDraggingItem']).toBeFalse();
    });

    it('should return the dragged item if isDraggingItem is true and sideMenuSelectedEntity is an item', () => {
        const mockItem = { isItem: () => true } as unknown as Item;
        service['isDraggingItem'] = true;
        service['sideMenuSelectedEntity'] = mockItem;

        const result = service.getDraggedItem();

        expect(result).toBe(mockItem);
    });

    it('should return null if isDraggingItem is false', () => {
        const mockItem = { isItem: () => true } as unknown as Item;
        service['isDraggingItem'] = false;
        service['sideMenuSelectedEntity'] = mockItem;

        const result = service.getDraggedItem();

        expect(result).toBeNull();
    });

    it('should return null if sideMenuSelectedEntity is not an item', () => {
        const mockEntity = { isItem: () => false } as unknown as PlaceableEntity;
        service['isDraggingItem'] = true;
        service['sideMenuSelectedEntity'] = mockEntity;

        const result = service.getDraggedItem();

        expect(result).toBeNull();
    });

    it('should return null if sideMenuSelectedEntity is null', () => {
        service['isDraggingItem'] = true;
        service['sideMenuSelectedEntity'] = null;

        const result = service.getDraggedItem();

        expect(result).toBeNull();
    });

    it('should set isMouseInMap to true', () => {
        service.setMouseInMap(true);
        expect(service['isMouseInMap']).toBeTrue();
    });

    it('should set isMouseInMap to false', () => {
        service.setMouseInMap(false);
        expect(service['isMouseInMap']).toBeFalse();
    });

    it('should set lastDraggedItemCoordinates to the provided value', () => {
        const mockCoordinates = { x: 2, y: 3 } as Vec2;

        service.setLastDraggedItemCoordinates(mockCoordinates);

        expect(service['lastDraggedItemCoordinates']).toEqual(mockCoordinates);
    });

    it('should set lastDraggedItemCoordinates to null', () => {
        service.setLastDraggedItemCoordinates(null);

        expect(service['lastDraggedItemCoordinates']).toBeNull();
    });

    it('should return true if isMouseInMap is false and lastDraggedItem is not null', () => {
        service['isMouseInMap'] = false;
        service['lastDraggedItem'] = { type: 'Sword', isItem: () => true } as unknown as Item;

        const result = service['isItemOutOfMap']();
        expect(result).toBeTrue();
    });

    it('should return false if isMouseInMap is true and lastDraggedItem is not null', () => {
        service['isMouseInMap'] = true;
        service['lastDraggedItem'] = { type: 'Sword', isItem: () => true } as unknown as Item;

        const result = service['isItemOutOfMap']();
        expect(result).toBeFalse();
    });

    it('should return false if lastDraggedItem is null', () => {
        service['isMouseInMap'] = false;
        service['lastDraggedItem'] = null;

        const result = service['isItemOutOfMap']();
        expect(result).toBeFalse();
    });

    it('should signal tile copy when the selected entity is not an item and tile is not a door', () => {
        const mockEntity = new GrassTile(); // Mock tile that is not a door
        const mockSideMenuEntity = new GrassTile(); // Mock sideMenuSelectedEntity that is not an item

        service['sideMenuSelectedEntity'] = mockSideMenuEntity; // Set selected entity
        spyOn(service['signalTileCopy'], 'next'); // Spy on signalTileCopy

        service.leftMouseDownMapTile(mockEntity);

        expect(service['signalTileCopy'].next).toHaveBeenCalledWith({
            tile: mockSideMenuEntity,
            entity: mockEntity,
        });
    });
});
