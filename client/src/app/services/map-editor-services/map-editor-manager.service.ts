import { Injectable } from '@angular/core';
import { Chestplate } from '@app/classes/Items/chestplate';
import { DiamondSword } from '@app/classes/Items/diamond-sword';
import { Elytra } from '@app/classes/Items/elytra';
import { EnchantedBook } from '@app/classes/Items/enchanted-book';
import { Flag } from '@app/classes/Items/flag';
import { Item } from '@app/classes/Items/item';
import { Potion } from '@app/classes/Items/potion';
import { RandomItem } from '@app/classes/Items/random-item';
import { Spawn } from '@app/classes/Items/spawn';
import { Totem } from '@app/classes/Items/totem';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { OpenDoor } from '@app/classes/Tiles/open-door';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { WallTile } from '@app/classes/Tiles/wall-tile';
import { WaterTile } from '@app/classes/Tiles/water-tile';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { ItemFactoryService } from '@app/services/game-board-services/item-factory.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { ItemType } from '@common/enums/item-type';
import { TileType } from '@common/enums/tile-type';

class PlaceableEntitySection {
    title: string;
    entities: PlaceableEntity[];
}

@Injectable({
    providedIn: 'root',
})
export class MapEditorManagerService {
    placeableEntitiesSections: PlaceableEntitySection[] = [];
    selectedEntity: PlaceableEntity | null;
    sideMenuSelectedEntity: null | PlaceableEntity;
    isDraggingLeft: boolean = false;
    isDraggingRight: boolean = false;
    draggedEntity: PlaceableEntity | null;
    itemLimitCounter: number = 0;

    constructor(
        public tileFactoryService: TileFactoryService,
        public itemFactoryService: ItemFactoryService,
        public gameMapDataManagerService: GameMapDataManagerService,
    ) {}

    init() {
        this.placeableEntitiesSections = [
            {
                title: 'Tuiles',
                entities: [new WaterTile(), new DoorTile(), new IceTile(), new WallTile()],
            },
            {
                title: 'Objets',
                entities: [],
            },
        ];

        this.resetItemList();
    }

    resetItemList() {
        this.itemLimitCounter = 0;
        this.placeableEntitiesSections[1] = {
            title: 'Objets',
            entities: [
                new DiamondSword(),
                new Chestplate(),
                new Elytra(),
                new EnchantedBook(),
                new Totem(),
                new Potion(),
                new Spawn(),
                new RandomItem(),
            ],
        };
        if (this.gameMapDataManagerService.isGameModeCTF()) {
            this.placeableEntitiesSections[1].entities.push(new Flag());
        }
        this.setItemLimit();
    }

    getRandomItemItemInMenu(): RandomItem | null {
        for (const entities of this.placeableEntitiesSections) {
            for (const item of entities.entities) {
                if ((item as Item).type === ItemType.Random) return item as RandomItem;
            }
        }
        return null;
    }

    getSpawnItemInMenu(): Spawn | null {
        for (const entities of this.placeableEntitiesSections) {
            for (const item of entities.entities) {
                if ((item as Item).type === ItemType.Spawn) return item as Spawn;
            }
        }
        return null;
    }

    setItemLimit() {
        this.itemLimitCounter = this.gameMapDataManagerService.itemLimit();

        const itemsToUpdate = [this.getRandomItemItemInMenu(), this.getSpawnItemInMenu()];
        for (const item of itemsToUpdate) {
            if (item) {
                item.itemLimit = this.itemLimitCounter;
            }
        }
    }

    updateItemLimitCounter(amount: number) {
        this.itemLimitCounter += amount;
        const randomItem = this.getRandomItemItemInMenu();
        if (randomItem) {
            randomItem.itemLimit = this.itemLimitCounter;
        }
    }

    startDrag(entity: PlaceableEntity) {
        this.draggedEntity = entity;
    }

    endDrag() {
        this.draggedEntity = null;
    }

    sideMenuTileFinder(tile: Tile) {
        for (const searchedTile of this.placeableEntitiesSections[0].entities) {
            if ((searchedTile as Tile).type === tile.type) {
                return searchedTile;
            }
        }
        return null;
    }

    sideMenuItemFinder(item: Item) {
        for (const searchedItem of this.placeableEntitiesSections[1].entities) {
            if ((searchedItem as Item).type === item.type) {
                return searchedItem;
            }
        }
        return null;
    }

    sideMenuEntityFinder(entity: PlaceableEntity) {
        const foundTile = this.sideMenuTileFinder(entity as Tile) as Tile | null;
        if (foundTile) return foundTile;

        const foundItem = this.sideMenuItemFinder(entity as Item) as Item | null;
        if (foundItem) return foundItem;

        return null;
    }

    cancelSelectionSideMenu() {
        if (this.sideMenuSelectedEntity) {
            let foundEntity = this.sideMenuEntityFinder(this.sideMenuSelectedEntity as PlaceableEntity);
            if (foundEntity) foundEntity.visibleState = VisibleState.NotSelected;

            this.selectedEntity = null;
            this.sideMenuSelectedEntity = null;
        }
    }

    cancelSelectionMap() {
        if (this.selectedEntity) {
            let foundEntity = this.sideMenuEntityFinder(this.selectedEntity as PlaceableEntity)?.visibleState;
            if (foundEntity) foundEntity = VisibleState.NotSelected;

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
        if (this.gameMapDataManagerService.isTerrainTile(selectedTile)) {
            if (selectedTile?.item) {
                const foundItem = selectedTile.item ? (this.sideMenuItemFinder(selectedTile.item) as Item | null) : null;
                if (this.gameMapDataManagerService.isTerrainTile(tileCopy)) {
                    tileCopy.item = foundItem;
                } else {
                    this.itemRemover(selectedTile);
                }
            }
        }

        this.gameMapDataManagerService.currentGrid[selectedTile.coordinates.x][selectedTile.coordinates.y] = tileCopy;
        tileCopy.visibleState = VisibleState.NotSelected;
    }

    itemPlacer(item: Item, selectedTile: Tile) {
        if (!this.gameMapDataManagerService.isTerrainTile(selectedTile)) return;
        if (selectedTile.item) {
            this.itemRemover(selectedTile);
        }
        const foundItem = this.sideMenuItemFinder(item) as Item | null;
        if (!foundItem) return;
        if (foundItem.itemLimit >= 1) {
            foundItem.itemLimit--;
            if (item.type !== ItemType.Spawn) this.updateItemLimitCounter(-1);
            selectedTile.item = this.itemFactoryService.copyItem(item);
            this.gameMapDataManagerService.isGameUpdated = true;
            if (foundItem.itemLimit === 0) {
                foundItem.visibleState = VisibleState.Disabled;
                this.sideMenuSelectedEntity = null;
            }
            if (this.itemLimitCounter === 0) {
                this.sideMenuItemsDisabler();
            }
            if (this.itemLimitCounter > 0) {
                this.sideMenuItemsEnabler();
            }
        }
    }

    itemRemover(selectedTile: Tile) {
        if (!this.gameMapDataManagerService.isTerrainTile(selectedTile) || !selectedTile.item) return;
        const foundItem = this.sideMenuItemFinder(selectedTile.item) as Item | null;
        if (foundItem) {
            foundItem.itemLimit++;
            if (foundItem.type !== ItemType.Spawn) this.updateItemLimitCounter(1);
            else {
                foundItem.visibleState = VisibleState.NotSelected;
            }
            if (foundItem.itemLimit === 0) {
                foundItem.visibleState = VisibleState.Disabled;
                this.sideMenuSelectedEntity = null;
            }
            if (this.itemLimitCounter === 0) {
                this.sideMenuItemsDisabler();
            }
            if (this.itemLimitCounter > 0) {
                this.sideMenuItemsEnabler();
            }
        }
        selectedTile.item = null;
        this.gameMapDataManagerService.isGameUpdated = true;
    }

    leftClickMapTile(entity: Tile) {
        this.isDraggingLeft = true;
        if (!this.sideMenuSelectedEntity) return;
        if (entity.type === (this.sideMenuSelectedEntity as Tile)?.type && entity.type !== TileType.Door && entity.type !== TileType.OpenDoor) return;
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
        this.resetItemList();
        this.mapItemCheckup();
    }

    mapItemCheckup() {
        this.gameMapDataManagerService.currentGrid.forEach((row) => {
            row.forEach((tile) => {
                if (this.gameMapDataManagerService.isTerrainTile(tile) && tile.item) {
                    const foundItem = this.sideMenuItemFinder(tile.item) as Item | null;

                    if (foundItem) {
                        foundItem.itemLimit--;
                        if (foundItem.type !== ItemType.Spawn) {
                            this.updateItemLimitCounter(-1);
                        }
                        if (foundItem.itemLimit === 0) {
                            foundItem.visibleState = VisibleState.Disabled;
                        }
                    }
                    if (this.itemLimitCounter === 0) {
                        this.sideMenuItemsDisabler();
                    }
                    if (this.itemLimitCounter > 0) {
                        this.sideMenuItemsEnabler();
                    }
                }
            });
        });
    }

    sideMenuItemsDisabler() {
        for (const item of this.placeableEntitiesSections[1].entities) {
            if (item.visibleState === VisibleState.NotSelected && (item as Item).type !== ItemType.Spawn) {
                item.visibleState = VisibleState.Disabled;
            }
        }
    }

    sideMenuItemsEnabler() {
        for (const item of this.placeableEntitiesSections[1].entities) {
            if ((item as Item).itemLimit > 0) {
                item.visibleState = VisibleState.NotSelected;
            }
        }
    }
}
