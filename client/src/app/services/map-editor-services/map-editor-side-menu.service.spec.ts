import { TestBed } from '@angular/core/testing';
import { Flag } from '@app/classes/Items/flag';
import { Item } from '@app/classes/Items/item';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { ItemType } from '@common/enums/item-type';
import { TileType } from '@common/enums/tile-type';
import { MapEditorSideMenuService } from './map-editor-side-menu.service';

describe('MapEditorSideMenuService', () => {
    let service: MapEditorSideMenuService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MapEditorSideMenuService],
        });
        service = TestBed.inject(MapEditorSideMenuService);

        const limit = 5;
        service.init(false, limit);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize placeable entity sections and set item limits', () => {
        spyOn(service, 'resetItemList');

        const limit = 5;
        service.init(true, limit);

        const sections = service.getPlaceableEntitiesSections();
        const length = 2;
        expect(sections.length).toBe(length);
        expect(sections[0].title).toBe('Tuiles');
        expect(sections[1].title).toBe('Objets');
        expect(service.resetItemList).toHaveBeenCalledWith(true, limit);
    });

    it('should add Flag to the item list in CTF mode', () => {
        const itemLimit = 5;
        service.resetItemList(true, itemLimit);

        const items = service.getPlaceableEntitiesSections()[1].entities;
        expect(items.some((item) => item instanceof Flag)).toBeTrue();
    });

    it('should not add Flag to the item list if not in CTF mode', () => {
        const itemLimit = 5;
        service.resetItemList(false, itemLimit);

        const items = service.getPlaceableEntitiesSections()[1].entities;
        expect(items.some((item) => item instanceof Flag)).toBeFalse();
    });

    it('should set the item limit for Random and Spawn items', () => {
        const itemLimit = 5;
        service.resetItemList(false, itemLimit);

        const randomItem = service.sideMenuItemFinder(ItemType.Random);
        const spawnItem = service.sideMenuItemFinder(ItemType.Spawn);

        expect(randomItem?.itemLimit).toBe(itemLimit);
        expect(spawnItem?.itemLimit).toBe(itemLimit);
    });

    it('should update the item limits for Random and Spawn items', () => {
        const itemLimit = 4;
        service.setItemLimit(itemLimit);

        const randomItem = service.sideMenuItemFinder(ItemType.Random);
        const spawnItem = service.sideMenuItemFinder(ItemType.Spawn);

        expect(randomItem?.itemLimit).toBe(itemLimit);
        expect(spawnItem?.itemLimit).toBe(itemLimit);
    });

    it('should return null if the item is not found', () => {
        const mockItem = { type: 'NonExistentItemType' } as unknown as Item;

        const result = service.updateItemLimitCounter(mockItem, 1);

        expect(result).toBeNull();
    });

    it('should update the item limit and set visibleState to Disabled when itemLimit becomes 0', () => {
        const mockItem = service.sideMenuItemFinder(ItemType.Sword);
        const newLimit = -2;
        if (mockItem) {
            mockItem.itemLimit = 2;
            const result = service.updateItemLimitCounter(mockItem, newLimit);
            expect(result?.itemLimit).toBe(0);
            expect(result?.visibleState).toBe(VisibleState.Disabled);
        }
    });

    it('should call updateTotalItemLimitCounter if the item is normal', () => {
        const mockItem = service.sideMenuItemFinder(ItemType.Sword);
        spyOn(service, 'updateTotalItemLimitCounter');

        if (mockItem) {
            if (mockItem) {
                service.updateItemLimitCounter(mockItem, 1);
            }
        }

        expect(service.updateTotalItemLimitCounter).toHaveBeenCalledWith(1);
    });

    it('should not call updateTotalItemLimitCounter if the item is not normal (e.g., Spawn or Flag)', () => {
        const mockItem = service.sideMenuItemFinder(ItemType.Spawn);
        spyOn(service, 'updateTotalItemLimitCounter');

        if (mockItem) {
            service.updateItemLimitCounter(mockItem, 1);
        }

        expect(service.updateTotalItemLimitCounter).not.toHaveBeenCalled();
    });

    it('should set visibleState to NotSelected when itemLimit is greater than 0', () => {
        const mockItem = service.sideMenuItemFinder(ItemType.Sword);
        if (mockItem) {
            mockItem.itemLimit = 0;
            const result = service.updateItemLimitCounter(mockItem, 1);

            expect(result?.itemLimit).toBe(1);
            expect(result?.visibleState).toBe(VisibleState.NotSelected);
        }
    });

    it('should call sideMenuItemsDisabler when totalItemLimitCounter reaches 0', () => {
        spyOn(service, 'sideMenuItemsDisabler');

        const newLimit = -5;
        service.updateTotalItemLimitCounter(newLimit);

        expect(service['sideMenuItemsDisabler']).toHaveBeenCalled();
    });

    it('should not call sideMenuItemsDisabler when totalItemLimitCounter is greater than 0', () => {
        spyOn(service, 'sideMenuItemsDisabler');

        const newLimit = -4;
        service.updateTotalItemLimitCounter(newLimit);

        expect(service['sideMenuItemsDisabler']).not.toHaveBeenCalled();
    });

    it('should return the correct tile when the tile type is found', () => {
        const result = service.sideMenuTileFinder(TileType.Water);
        expect(result).toBeTruthy();
        expect(result?.type).toBe(TileType.Water);
    });

    it('should return null when the tile type is not found', () => {
        const result = service.sideMenuTileFinder(TileType.Grass);
        expect(result).toBeNull();
    });

    it('should return the correct tile when a tile entity is found', () => {
        const mockTile = { type: TileType.Water } as unknown as PlaceableEntity;
        const result = service.sideMenuEntityFinder(mockTile);
        expect(result).toBeTruthy();
        expect(result?.type).toBe(TileType.Water);
    });

    it('should return the correct item when an item entity is found', () => {
        const mockItem = { type: ItemType.Sword } as unknown as PlaceableEntity;
        const result = service.sideMenuEntityFinder(mockItem);
        expect(result).toBeTruthy();
        expect(result?.type).toBe(ItemType.Sword);
    });

    it('should return null if no matching tile or item is found', () => {
        const mockEntity = { type: 'NonExistentType' } as unknown as PlaceableEntity;
        const result = service.sideMenuEntityFinder(mockEntity);
        expect(result).toBeNull();
    });

    it('should disable items that are not selected and not of type Spawn', () => {
        const mockItem1 = service.sideMenuItemFinder(ItemType.Sword);
        const mockItem2 = service.sideMenuItemFinder(ItemType.Random);
        const mockSpawnItem = service.sideMenuItemFinder(ItemType.Spawn);

        if (mockItem1) {
            mockItem1.itemLimit = 0;
        }
        if (mockItem2) {
            mockItem2.itemLimit = 0;
        }

        if (mockSpawnItem) {
            mockSpawnItem.visibleState = VisibleState.NotSelected;
            mockSpawnItem.itemLimit = 5;
        }

        service['sideMenuItemsDisabler']();

        expect(mockItem1?.visibleState).toBe(VisibleState.Disabled);
        expect(mockItem2?.visibleState).toBe(VisibleState.Disabled);
        expect(mockSpawnItem?.visibleState).toBe(VisibleState.NotSelected);
    });

    it('should not disable items that are already Disabled', () => {
        const mockItem = service.sideMenuItemFinder(ItemType.Sword);
        if (mockItem) {
            mockItem.visibleState = VisibleState.Disabled;
        }

        service['sideMenuItemsDisabler']();

        expect(mockItem?.visibleState).toBe(VisibleState.Disabled);
    });

    it('should emit the correct entity when mouse enters a side menu item', () => {
        spyOn(service['signalSideMenuMouseEnter'], 'next');
        const mockEntity = { visibleState: 0 } as unknown as PlaceableEntity;

        service.onSideMenuMouseEnter(mockEntity);

        expect(service['signalSideMenuMouseEnter'].next).toHaveBeenCalledWith(mockEntity);
    });

    it('should emit the correct entity when mouse leaves a side menu item', () => {
        spyOn(service['signalSideMenuMouseLeave'], 'next');
        const mockEntity = { visibleState: 0 } as unknown as PlaceableEntity;

        service.onSideMenuMouseLeave(mockEntity);

        expect(service['signalSideMenuMouseLeave'].next).toHaveBeenCalledWith(mockEntity);
    });

    it('should emit the correct entity when mouse clicks a side menu item', () => {
        spyOn(service['signalSideMenuMouseDown'], 'next');
        const mockEntity = { visibleState: 0 } as unknown as PlaceableEntity;

        service.onSideMenuMouseDown(mockEntity);

        expect(service['signalSideMenuMouseDown'].next).toHaveBeenCalledWith(mockEntity);
    });
});
