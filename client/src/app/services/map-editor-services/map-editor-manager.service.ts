import { Injectable, OnDestroy } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { ItemFactoryService } from '@app/services/game-board-services/item-factory.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { ItemType } from '@common/enums/item-type';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject, takeUntil } from 'rxjs';
import { MapEditorMouseHandlerService } from './map-editor-mouse-handler.service';
import { MapEditorSideMenuService } from './map-editor-side-menu.service';

@Injectable({
    providedIn: 'root',
})
export class MapEditorManagerService implements OnDestroy {
    private destroy$ = new Subject<void>();

    constructor(
        public tileFactoryService: TileFactoryService,
        public itemFactoryService: ItemFactoryService,
        public gameMapDataManagerService: GameMapDataManagerService,
        public sideMenuService: MapEditorSideMenuService,
        public mouseHandlerService: MapEditorMouseHandlerService,
    ) {
        this.sideMenuService.signalSideMenuMouseEnter$.pipe(takeUntil(this.destroy$)).subscribe((entity) => this.onMouseEnter(entity));
        this.sideMenuService.signalSideMenuMouseLeave$.pipe(takeUntil(this.destroy$)).subscribe((entity) => this.onMouseLeave(entity));
        this.sideMenuService.signalSideMenuMouseDown$.pipe(takeUntil(this.destroy$)).subscribe((entity) => this.onMouseDownSideMenu(entity));

        this.mouseHandlerService.signalTileCopy$.pipe(takeUntil(this.destroy$)).subscribe((data) => this.tileCopyCreator(data.tile, data.entity));
        this.mouseHandlerService.signalItemPlacer$.pipe(takeUntil(this.destroy$)).subscribe((data) => this.itemPlacer(data.item, data.entity));
        this.mouseHandlerService.signalItemRemover$.pipe(takeUntil(this.destroy$)).subscribe((entity) => this.itemRemover(entity));
        this.mouseHandlerService.signalCancelSelection$.pipe(takeUntil(this.destroy$)).subscribe((entity) => this.cancelSelection(entity));
        this.mouseHandlerService.signalItemDragged$.pipe(takeUntil(this.destroy$)).subscribe((itemType) => this.onMapItemDragged(itemType));
        this.mouseHandlerService.signalItemPlacerWithCoordinates$
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => this.itemPlacerWithCoordinates(data.item, data.coordinates));
        this.mouseHandlerService.signalItemInPlace$
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => this.itemPlacedInSideMenu(data.item, data.coordinates));
    }

    init() {
        this.sideMenuService.init(this.gameMapDataManagerService.isGameModeCTF(), this.gameMapDataManagerService.itemLimit());
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    itemCheckup() {
        this.sideMenuService.resetItemList(this.gameMapDataManagerService.isGameModeCTF(), this.gameMapDataManagerService.itemLimit());
        this.mapItemCheckup();
    }

    mapItemCheckup() {
        this.gameMapDataManagerService.getCurrentGrid().forEach((row) => {
            row.forEach((tile) => {
                if (tile.isTerrain()) {
                    const terrainTile = tile as TerrainTile;

                    if (terrainTile.item) {
                        this.sideMenuService.updateItemLimitCounter(terrainTile.item, -1);
                    }
                }
            });
        });
    }

    onMapMouseEnter() {
        this.mouseHandlerService.setMouseInMap(true);
    }

    onMapMouseLeave() {
        if (this.mouseHandlerService.getDraggedItem()) {
            this.mouseHandlerService.setMouseInMap(false);
        }
    }

    onMouseEnter(entity: PlaceableEntity) {
        this.mouseHandlerService.onMouseEnter(entity);
    }

    onMouseLeave(entity: PlaceableEntity) {
        this.mouseHandlerService.onMouseLeave(entity);
    }

    onMouseDownMapTile(event: MouseEvent, entity: Tile) {
        this.mouseHandlerService.onMouseDownMapTile(event, entity);
    }

    onMouseMoveMapTile(entity: Tile) {
        this.mouseHandlerService.onMouseMoveMapTile(entity);
    }

    onMouseUp() {
        this.mouseHandlerService.onMouseUp();
    }

    onMouseUpMapTile(entity: Tile) {
        this.mouseHandlerService.onMapTileMouseUp(entity);
    }

    onMouseDownSideMenu(entity: PlaceableEntity) {
        this.mouseHandlerService.onMouseDownSideMenu(entity);
    }

    onMapItemDragged(itemType: ItemType) {
        const foundItem = this.sideMenuService.sideMenuItemFinder(itemType) as Item | null;
        if (foundItem) this.mouseHandlerService.onMouseDownSideMenu(foundItem);
    }

    getDraggedItem() {
        return this.mouseHandlerService.getDraggedItem();
    }

    cancelSelection(sideMenuSelectedEntity: PlaceableEntity) {
        const foundEntity = this.sideMenuService.sideMenuEntityFinder(sideMenuSelectedEntity as PlaceableEntity);
        if (foundEntity) foundEntity.visibleState = VisibleState.NotSelected;
    }

    tileCopyCreator(copiedTile: Tile, selectedTile: Tile) {
        const tileCopy = this.tileFactoryService.copyFromTile(copiedTile);
        tileCopy.coordinates = { x: selectedTile.coordinates.x, y: selectedTile.coordinates.y };

        if (selectedTile.isTerrain()) {
            const terrainTile = selectedTile as TerrainTile;

            if (terrainTile.item) {
                const foundItem = this.sideMenuService.sideMenuItemFinder(terrainTile.item.type) as Item | null;
                if (tileCopy.isTerrain()) {
                    (tileCopy as TerrainTile).item = foundItem;
                } else {
                    this.itemRemover(selectedTile);
                }
            }
        }

        this.gameMapDataManagerService.getCurrentGrid()[selectedTile.coordinates.x][selectedTile.coordinates.y] = tileCopy;
        tileCopy.visibleState = VisibleState.NotSelected;
    }

    itemPlacer(item: Item, selectedTile: Tile): void {
        if (!selectedTile.isTerrain()) return;
        const terrainTile = selectedTile as TerrainTile;

        if (terrainTile.item) {
            this.itemRemover(selectedTile);
        }

        const foundItem = this.sideMenuService.updateItemLimitCounter(item, -1);

        terrainTile.item = this.itemFactoryService.copyItem(item);
        terrainTile.item.setCoordinates(selectedTile.coordinates);
        this.mouseHandlerService.setLastDraggedItemCoordinates(null);

        if (foundItem?.itemLimit === 0) {
            if (this.mouseHandlerService.sideMenuSelectedEntity === foundItem) {
                this.mouseHandlerService.sideMenuSelectedEntity = null;
            }
        }
    }

    itemPlacerWithCoordinates(item: Item, coordinates: Vec2): void {
        const selectedTile = this.gameMapDataManagerService.getTileAt(coordinates);
        if (!selectedTile) return;
        this.itemPlacer(item, selectedTile);
    }

    itemRemover(selectedTile: Tile) {
        if (!selectedTile.isTerrain()) return;
        const terrainTile = selectedTile as TerrainTile;
        if (!terrainTile.item) return;

        this.sideMenuService.updateItemLimitCounter(terrainTile.item, 1);
        terrainTile.item = null;
    }

    itemPlacedInSideMenu(item: Item, coordinates: Vec2) {
        const foundEntity = this.sideMenuService.sideMenuEntityFinder(item);
        const foundTile = this.gameMapDataManagerService.getTileAt(coordinates);
        if (foundEntity instanceof Item) {
            this.itemRemover(foundTile as TerrainTile);
        }
    }
}
