import { Injectable } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { MapShared } from '@common/interfaces/map-shared';
import { ItemFactoryService } from '../game-board-services/item-factory.service';
import { TileFactoryService } from '../game-board-services/tile-factory.service';

@Injectable({
    providedIn: 'root',
})
export class MapEditorManagerService {
    constructor(
        public tileFactoryService: TileFactoryService,
        public itemFactoryService: ItemFactoryService,
    ) {
        this.createNewGrid();
    }

    map: MapShared = {
        name: '',
        description: '',
        size: 20,
        tiles: [],
    };

    grid: Tile[][] = [];
    selectedEntity: PlaceableEntity | null;
    sideMenuSelectedEntity: null | PlaceableEntity;
    isDraggingLeft: boolean = false;
    isDraggingRight: boolean = false;

    newMap(size: number) {
        this.grid = [];
        this.map = {
            name: '',
            description: '',
            size: size,
            tiles: [],
        };
        this.createNewGrid();
    }

    loadMap(map: MapShared) {
        this.grid = [];
        this.map = map;
        this.loadGrid();
    }

    createNewGrid() {
        for (let i = 0; i < this.map.size; i++) {
            this.grid.push([]);
            for (let j = 0; j < this.map.size; j++) {
                const newTile: GrassTile = new GrassTile();
                this.grid[i].push(newTile);
                newTile.coordinates = { x: i, y: j };
            }
        }
    }

    loadGrid() {
        for (let i = 0; i < this.map.tiles.length; i++) {
            this.grid.push([]);
            for (let j = 0; j < this.map.tiles[i].length; j++) {
                const newTile: Tile = this.tileFactoryService.createTile(this.map.tiles[i][j].type);
                this.grid[i].push(newTile);
                newTile.coordinates = { x: i, y: j };

                if (this.isTerrainTile(newTile)) {
                    const itemType = this.map.tiles[i][j].item?.type;
                    if (itemType) newTile.item = this.itemFactoryService.createItem(itemType);
                }
            }
        }
    }

    saveMap() {
        this.map.tiles = [];
        for (let i = 0; i < this.grid.length; i++) {
            this.map.tiles.push([]);
            for (let j = 0; j < this.grid[i].length; j++) {
                this.map.tiles[i].push({
                    type: this.grid[i][j].type,
                    item:
                        this.isTerrainTile(this.grid[i][j]) && (this.grid[i][j] as TerrainTile).item?.type !== undefined
                            ? { type: (this.grid[i][j] as TerrainTile).item!.type }
                            : null,
                });
            }
        }
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
        this.cancelSelectionMap();
    }

    isTerrainTile(tile: Tile): tile is TerrainTile {
        return (tile as TerrainTile).item !== undefined;
    }

    isItem(placeableEntity: PlaceableEntity): placeableEntity is Item {
        return (placeableEntity as Item).testItem !== undefined;
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
        this.grid[selectedTile.coordinates.x][selectedTile.coordinates.y] = tileCopy;
        tileCopy.visibleState = VisibleState.notSelected;
    }

    itemPlacer(item: Item, selectedTile: TerrainTile) {
        if (item.itemLimit >= 1 && this.sideMenuSelectedEntity) {
            console.log('Item added');
            item.itemLimit--;
            selectedTile.item = this.sideMenuSelectedEntity as Item;
            this.sideMenuSelectedEntity.visibleState = VisibleState.notSelected;
            if (item.itemLimit === 0 && this.sideMenuSelectedEntity) {
                console.log('Item limit reached');
                this.sideMenuSelectedEntity.visibleState = VisibleState.disabled;
            }
            this.sideMenuSelectedEntity = null;
        }
    }
    onMouseDownMapTile(event: MouseEvent, entity: Tile) {
        console.log('entity', entity);
        if (event.button === 0) {
            if (this.sideMenuSelectedEntity) {
                if (this.isItem(this.sideMenuSelectedEntity) && this.isTerrainTile(entity)) {
                    this.itemPlacer(this.sideMenuSelectedEntity, entity);
                } else if (this.sideMenuSelectedEntity && !this.isItem(this.sideMenuSelectedEntity)) {
                    this.isDraggingLeft = true;
                    this.tileCopyCreator(this.sideMenuSelectedEntity as Tile, entity);
                }
            }
        } else if (event.button === 2) {
            this.isDraggingRight = true;
            if (!(entity instanceof GrassTile) && ((this.isTerrainTile(entity) && !entity.item) || !this.isTerrainTile(entity))) {
                this.isDraggingRight = true;
                event.preventDefault();
                this.tileCopyCreator(new GrassTile(), entity);
            } else if (this.isTerrainTile(entity)) {
                entity.item = null;
                console.log('Item deleted');
            } else {
            }
        }
    }
    onMouseMoveMapTile(entity: Tile) {
        if (this.isDraggingLeft) {
            if (this.sideMenuSelectedEntity && this.isDraggingLeft) {
                this.tileCopyCreator(this.sideMenuSelectedEntity as Tile, entity);
            }
        } else if (this.isDraggingRight) {
            if (this.isDraggingRight && !(entity instanceof GrassTile)) {
                this.tileCopyCreator(new GrassTile(), entity);
            }

            if (entity instanceof GrassTile && entity.item) {
                console.log('Item deleted dragging');
                entity.item = null;
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
        } else if (entity.visibleState === VisibleState.disabled) {
            //item limit reached
            console.log('Item limit reached and disabled');
            return;
        } else if (this.sideMenuSelectedEntity && this.sideMenuSelectedEntity !== entity) {
            //another entity selected
            this.sideMenuSelectedEntity.visibleState = VisibleState.notSelected;
            this.makeSelection(entity);
        } else {
            this.makeSelection(entity);
        }
    }
}
