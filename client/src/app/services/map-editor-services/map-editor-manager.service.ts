import { Injectable } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { OpenDoor } from '@app/classes/Tiles/open-door';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { ItemFactoryService } from '@app/services/game-board-services/item-factory.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { ItemType } from '@common/enums/item-type';
import { MapEditorSideMenuService } from './map-editor-side-menu.service';

@Injectable({
    providedIn: 'root',
})
export class MapEditorManagerService {
    selectedEntity: PlaceableEntity | null;
    sideMenuSelectedEntity: null | PlaceableEntity;
    isDraggingLeft: boolean = false;
    isDraggingRight: boolean = false;

    constructor(
        public tileFactoryService: TileFactoryService,
        public itemFactoryService: ItemFactoryService,
        public gameMapDataManagerService: GameMapDataManagerService,
        public sideMenuService: MapEditorSideMenuService,
    ) {
        this.sideMenuService.signalSideMenuMouseEnter$.subscribe((entity) => this.onMouseEnter(entity));
        this.sideMenuService.signalSideMenuMouseLeave$.subscribe((entity) => this.onMouseLeave(entity));
        this.sideMenuService.signalSideMenuMouseDown$.subscribe((entity) => this.onMouseDownSideMenu(entity));
    }

    init() {
        this.sideMenuService.init(this.gameMapDataManagerService.isGameModeCTF(), this.gameMapDataManagerService.itemLimit());
    }

    cancelSelectionSideMenu() {
        if (this.sideMenuSelectedEntity) {
            const foundEntity = this.sideMenuService.sideMenuEntityFinder(this.sideMenuSelectedEntity as PlaceableEntity);
            if (foundEntity) foundEntity.visibleState = VisibleState.NotSelected;

            this.selectedEntity = null;
            this.sideMenuSelectedEntity = null;
        }
    }

    cancelSelectionMap() {
        if (this.selectedEntity) {
            const foundEntity = this.sideMenuService.sideMenuEntityFinder(this.selectedEntity as PlaceableEntity);
            if (foundEntity) foundEntity.visibleState = VisibleState.NotSelected;

            this.selectedEntity = null;
        }
    }

    makeSelection(entity: PlaceableEntity) {
        entity.visibleState = VisibleState.Selected; // selection of the entity
        this.sideMenuSelectedEntity = entity;
        this.cancelSelectionMap();
    }

    onMouseEnter(entity: PlaceableEntity) {
        if (entity.visibleState === VisibleState.NotSelected) entity.visibleState = VisibleState.Hovered;
    }

    onMouseLeave(entity: PlaceableEntity) {
        if (entity.visibleState !== VisibleState.Selected && entity.visibleState !== VisibleState.Disabled)
            entity.visibleState = VisibleState.NotSelected;
    }

    tileCopyCreator(copiedTile: Tile, selectedTile: Tile) {
        const tileCopy = this.tileFactoryService.copyFromTile(copiedTile);
        this.gameMapDataManagerService.isGameUpdated = true;
        tileCopy.coordinates = { x: selectedTile.coordinates.x, y: selectedTile.coordinates.y };

        if (this.gameMapDataManagerService.isTerrainTile(selectedTile) && selectedTile.item) {
            const foundItem = this.sideMenuService.sideMenuItemFinder(selectedTile.item.type) as Item | null;
            if (this.gameMapDataManagerService.isTerrainTile(tileCopy)) {
                tileCopy.item = foundItem;
            } else {
                this.itemRemover(selectedTile);
            }
        }

        this.gameMapDataManagerService.currentGrid[selectedTile.coordinates.x][selectedTile.coordinates.y] = tileCopy;
        tileCopy.visibleState = VisibleState.NotSelected;
    }

    itemPlacer(item: Item, selectedTile: Tile): void {
        if (!this.gameMapDataManagerService.isTerrainTile(selectedTile)) {
            return;
        }

        if (selectedTile.item) {
            this.itemRemover(selectedTile);
        }

        const foundItem = this.sideMenuService.sideMenuItemFinder(item.type) as Item | null;
        if (!foundItem || foundItem.itemLimit < 1) {
            return;
        }

        foundItem.itemLimit--;
        if (item.type !== ItemType.Spawn && item.type !== ItemType.Flag) {
            this.sideMenuService.updateItemLimitCounter(-1);
        }

        selectedTile.item = this.itemFactoryService.copyItem(item);
        this.gameMapDataManagerService.isGameUpdated = true;

        if (foundItem.itemLimit === 0) {
            foundItem.visibleState = VisibleState.Disabled;
            if (this.sideMenuSelectedEntity === foundItem) {
                this.sideMenuSelectedEntity = null;
            }
        }
    }

    itemRemover(selectedTile: Tile) {
        if (!this.gameMapDataManagerService.isTerrainTile(selectedTile) || !selectedTile.item) return;
        const foundItem = this.sideMenuService.sideMenuItemFinder(selectedTile.item.type) as Item | null;
        if (foundItem) {
            foundItem.itemLimit++;
            if (foundItem.type !== ItemType.Spawn && foundItem.type !== ItemType.Flag) this.sideMenuService.updateItemLimitCounter(1);
            else {
                foundItem.visibleState = VisibleState.NotSelected;
            }
        }
        selectedTile.item = null;
        this.gameMapDataManagerService.isGameUpdated = true;
    }

    leftClickMapTile(entity: Tile) {
        this.isDraggingLeft = true;
        if (!this.sideMenuSelectedEntity) return;
        if (this.gameMapDataManagerService.isDoor(entity) && this.gameMapDataManagerService.isDoor(this.sideMenuSelectedEntity as Tile)) {
            if (entity instanceof DoorTile) {
                this.tileCopyCreator(new OpenDoor(), entity);
                return;
            } else if (entity instanceof OpenDoor) {
                this.tileCopyCreator(new DoorTile(), entity);
                return;
            }
        }

        if (this.gameMapDataManagerService.isItem(this.sideMenuSelectedEntity) && this.gameMapDataManagerService.isTerrainTile(entity)) {
            this.itemPlacer(this.sideMenuSelectedEntity, entity);
            this.cancelSelectionSideMenu();
        } else if (!this.gameMapDataManagerService.isItem(this.sideMenuSelectedEntity)) {
            this.tileCopyCreator(this.sideMenuSelectedEntity as Tile, entity);
        }
    }

    rightClickMapTile(event: MouseEvent, entity: Tile) {
        this.isDraggingRight = true;
        event.preventDefault();
        if (entity instanceof GrassTile && !entity.item) return;

        if ((entity as TerrainTile)?.item) {
            this.itemRemover(entity);
        } else if (!this.gameMapDataManagerService.isTerrainTile(entity) || (this.gameMapDataManagerService.isTerrainTile(entity) && !entity.item)) {
            this.tileCopyCreator(new GrassTile(), entity);
        }
    }

    onMouseDownMapTile(event: MouseEvent, entity: Tile) {
        if (event.button === 0) {
            this.leftClickMapTile(entity);
        } else if (event.button === 2) {
            this.rightClickMapTile(event, entity);
        }
    }
    onMouseMoveMapTile(entity: Tile) {
        if (this.sideMenuSelectedEntity && !this.gameMapDataManagerService.isItem(this.sideMenuSelectedEntity) && this.isDraggingLeft) {
            this.tileCopyCreator(this.sideMenuSelectedEntity as Tile, entity);
        }
        if (this.isDraggingRight) {
            if (this.gameMapDataManagerService.isTerrainTile(entity)) {
                this.itemRemover(entity);
            }
            if (!(entity instanceof GrassTile)) {
                this.tileCopyCreator(new GrassTile(), entity);
            }
        }
    }

    onMouseUpMapTile() {
        this.isDraggingLeft = false;
        this.isDraggingRight = false;
    }

    onMouseDownSideMenu(entity: PlaceableEntity) {
        if (entity.visibleState === VisibleState.Selected) {
            // already selected
            entity.visibleState = VisibleState.NotSelected;
            this.sideMenuSelectedEntity = null;
            this.cancelSelectionMap();
        } else if (entity.visibleState === VisibleState.Disabled) return; // item limit reached
        else if (this.sideMenuSelectedEntity && this.sideMenuSelectedEntity !== entity) {
            // another entity selected
            this.cancelSelectionSideMenu();
            this.makeSelection(entity);
        } else {
            this.makeSelection(entity);
        }
    }

    itemCheckup() {
        this.sideMenuService.resetItemList(this.gameMapDataManagerService.isGameModeCTF(), this.gameMapDataManagerService.itemLimit());
        this.mapItemCheckup();
    }

    mapItemCheckup() {
        this.gameMapDataManagerService.currentGrid.forEach((row) => {
            row.forEach((tile) => {
                if (this.gameMapDataManagerService.isTerrainTile(tile) && tile.item) {
                    const foundItem = this.sideMenuService.sideMenuItemFinder(tile.item.type) as Item | null;

                    if (foundItem) {
                        foundItem.itemLimit--;
                        if (foundItem.type !== ItemType.Spawn && foundItem.type !== ItemType.Flag) {
                            this.sideMenuService.updateItemLimitCounter(-1);
                        }
                        if (foundItem.itemLimit === 0) {
                            foundItem.visibleState = VisibleState.Disabled;
                        }
                    }
                }
            });
        });
    }
}
