import { Injectable } from '@angular/core';
import { Chestplate } from '@app/classes/Items/chestplate';
import { DiamondSword } from '@app/classes/Items/diamond-sword';
import { Elytra } from '@app/classes/Items/elytra';
import { EnchantedBook } from '@app/classes/Items/enchanted-book';
import { Flag } from '@app/classes/Items/flag';
import { Item } from '@app/classes/Items/item';
import { Potion } from '@app/classes/Items/potion';
import { Spawn } from '@app/classes/Items/spawn';
import { Totem } from '@app/classes/Items/totem';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { WallTile } from '@app/classes/Tiles/wall-tile';
import { WaterTile } from '@app/classes/Tiles/water-tile';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '../game-board-services/game-map-data-manager.service';
import { ItemFactoryService } from '../game-board-services/item-factory.service';
import { TileFactoryService } from '../game-board-services/tile-factory.service';

class PlaceableEntitySection {
    title: string;
    entities: PlaceableEntity[];
}

@Injectable({
    providedIn: 'root',
})
export class MapEditorManagerService {
    constructor(
        public tileFactoryService: TileFactoryService,
        public itemFactoryService: ItemFactoryService,
        public gameMapDataManagerService: GameMapDataManagerService,
    ) {}

    placeableEntitiesSections: PlaceableEntitySection[] = [
        {
            title: 'Tuiles',
            entities: [new WaterTile(), new DoorTile(), new IceTile(), new WallTile()],
        },
        {
            title: 'Objets',
            entities: [new DiamondSword(), new Chestplate(), new Elytra(), new EnchantedBook(), new Totem(), new Potion(), new Flag(), new Spawn()],
        },
    ];

    selectedEntity: PlaceableEntity | null;
    sideMenuSelectedEntity: null | PlaceableEntity;
    isDraggingLeft: boolean = false;
    isDraggingRight: boolean = false;

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
    cancelSelectionSideMenu() {
        if (this.sideMenuSelectedEntity) {
            this.sideMenuSelectedEntity.visibleState = VisibleState.notSelected;
            this.sideMenuSelectedEntity = null;
        }
    }

    cancelSelectionMap() {
        if (this.selectedEntity) {
            this.selectedEntity.visibleState = VisibleState.notSelected;
            this.selectedEntity = null;
        }
    }

    makeSelection(entity: PlaceableEntity) {
        entity.visibleState = VisibleState.selected; //selection of the entity
        this.sideMenuSelectedEntity = entity;
        console.log(this.sideMenuSelectedEntity?.description, 'selected');
        this.cancelSelectionMap();
    }

    onMouseEnter(entity: PlaceableEntity) {
        if (entity.visibleState === VisibleState.notSelected) entity.visibleState = VisibleState.hovered;
    }

    onMouseLeave(entity: PlaceableEntity) {
        if (entity.visibleState !== VisibleState.selected && entity.visibleState !== VisibleState.disabled)
            entity.visibleState = VisibleState.notSelected;
    }

    tileCopyCreator(copiedTile: Tile, selectedTile: Tile) {
        let tileCopy = this.tileFactoryService.copyFromTile(copiedTile);
        tileCopy.coordinates = { x: selectedTile.coordinates.x, y: selectedTile.coordinates.y };
        if (
            this.gameMapDataManagerService.isTerrainTile(selectedTile) &&
            selectedTile.item &&
            this.gameMapDataManagerService.isTerrainTile(tileCopy)
        ) {
            tileCopy.item = this.itemFactoryService.copyItem(selectedTile.item);
        }
        this.gameMapDataManagerService.currentGrid[selectedTile.coordinates.x][selectedTile.coordinates.y] = tileCopy;
        tileCopy.visibleState = VisibleState.notSelected;
    }

    itemPlacer(item: Item, selectedTile: TerrainTile) {
        if (selectedTile.item) {
            this.itemRemover(selectedTile);
        }
        if (item.itemLimit >= 1 && this.sideMenuSelectedEntity) {
            console.log(item.description, 'limit is', item.itemLimit);
            item.itemLimit--;
            selectedTile.item = this.itemFactoryService.copyItem(item);
            console.log(selectedTile.item?.description, 'placed');
            if (item.itemLimit === 0) {
                this.sideMenuSelectedEntity.visibleState = VisibleState.disabled;
            }
            this.sideMenuSelectedEntity = null;
        }
    }

    itemRemover(selectedTile: Tile) {
        if (!this.gameMapDataManagerService.isTerrainTile(selectedTile) || !selectedTile.item) return;
        const foundItem = this.sideMenuItemFinder(selectedTile.item) as Item | null;
        if (foundItem) {
            foundItem.itemLimit++;
            if (foundItem.visibleState === VisibleState.disabled) {
                foundItem.visibleState = VisibleState.notSelected;
            }
        }
        selectedTile.item = null;
    }

    leftClickMapTile(entity: Tile) {
        this.isDraggingLeft = true;
        if (!this.sideMenuSelectedEntity) return;
        if (entity.type === (this.sideMenuSelectedEntity as Tile)?.type) {
            return;
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
        if (this.sideMenuSelectedEntity && this.isDraggingLeft) {
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
        if (entity.visibleState === VisibleState.selected) {
            //already selected
            entity.visibleState = VisibleState.notSelected;
            this.sideMenuSelectedEntity = null;
            this.cancelSelectionMap();
        } else if (entity.visibleState === VisibleState.disabled) return; //item limit reached
        else if (this.sideMenuSelectedEntity && this.sideMenuSelectedEntity !== entity) {
            //another entity selected
            this.sideMenuSelectedEntity.visibleState = VisibleState.notSelected;
            this.makeSelection(entity);
        } else {
            this.makeSelection(entity);
        }
    }
}
