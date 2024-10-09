import { Injectable } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { ItemFactoryService } from '@app/services/game-board-services/item-factory.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { ItemType } from '@common/enums/item-type';
import { MapEditorMouseHandlerService } from './map-editor-mouse-handler.service';
import { MapEditorSideMenuService } from './map-editor-side-menu.service';

@Injectable({
    providedIn: 'root',
})
export class MapEditorManagerService {
    constructor(
        public tileFactoryService: TileFactoryService,
        public itemFactoryService: ItemFactoryService,
        public gameMapDataManagerService: GameMapDataManagerService,
        public sideMenuService: MapEditorSideMenuService,
        public mouseHandlerService: MapEditorMouseHandlerService,
    ) {
        this.sideMenuService.signalSideMenuMouseEnter$.subscribe((entity) => this.onMouseEnter(entity));
        this.sideMenuService.signalSideMenuMouseLeave$.subscribe((entity) => this.onMouseLeave(entity));
        this.sideMenuService.signalSideMenuMouseDown$.subscribe((entity) => this.onMouseDownSideMenu(entity));

        this.mouseHandlerService.signalTileCopy$.subscribe((data) => this.tileCopyCreator(data.tile, data.entity));
        this.mouseHandlerService.signalItemPlacer$.subscribe((data) => this.itemPlacer(data.item, data.entity));
        this.mouseHandlerService.signalItemRemover$.subscribe((entity) => this.itemRemover(entity));
        this.mouseHandlerService.signalCancelSelection$.subscribe((entity) => this.cancelSelection(entity));
    }

    init() {
        this.sideMenuService.init(this.gameMapDataManagerService.isGameModeCTF(), this.gameMapDataManagerService.itemLimit());
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

    onMouseUpMapTile() {
        this.mouseHandlerService.onMouseUpMapTile();
    }

    onMouseDownSideMenu(entity: PlaceableEntity) {
        this.mouseHandlerService.onMouseDownSideMenu(entity);
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
        if (!selectedTile.isTerrain()) {
            return;
        }
        const terrainTile = selectedTile as TerrainTile;

        if (terrainTile.item) {
            this.itemRemover(selectedTile);
        }

        const foundItem = this.sideMenuService.sideMenuItemFinder(item.type) as Item | null;
        if (!foundItem || foundItem.itemLimit < 1) {
            return;
        }

        foundItem.itemLimit--;
        if (this.isNormalItem(foundItem)) {
            this.sideMenuService.updateItemLimitCounter(-1);
        }

        terrainTile.item = this.itemFactoryService.copyItem(item);

        if (foundItem.itemLimit === 0) {
            foundItem.visibleState = VisibleState.Disabled;
            if (this.mouseHandlerService.sideMenuSelectedEntity === foundItem) {
                this.mouseHandlerService.sideMenuSelectedEntity = null;
            }
        }
    }

    itemRemover(selectedTile: Tile) {
        if (!selectedTile.isTerrain()) return;
        const terrainTile = selectedTile as TerrainTile;
        if (!terrainTile.item) return;

        const foundItem = this.sideMenuService.sideMenuItemFinder(terrainTile.item.type) as Item | null;
        if (foundItem) {
            foundItem.itemLimit++;
            if (this.isNormalItem(foundItem)) this.sideMenuService.updateItemLimitCounter(1);
            else {
                foundItem.visibleState = VisibleState.NotSelected;
            }
        }
        terrainTile.item = null;
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
                        const foundItem = this.sideMenuService.sideMenuItemFinder(terrainTile.item.type) as Item | null;

                        if (foundItem) {
                            foundItem.itemLimit--;
                            if (this.isNormalItem(foundItem)) {
                                this.sideMenuService.updateItemLimitCounter(-1);
                            }
                            if (foundItem.itemLimit === 0) {
                                foundItem.visibleState = VisibleState.Disabled;
                            }
                        }
                    }
                }
            });
        });
    }

    isNormalItem(item: Item): boolean {
        return item.type !== ItemType.Spawn && item.type !== ItemType.Flag;
    }
}
