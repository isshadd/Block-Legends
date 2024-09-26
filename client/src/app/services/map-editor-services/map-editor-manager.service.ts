import { Injectable } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { WallTile } from '@app/classes/Tiles/wall-tile';
import { WaterTile } from '@app/classes/Tiles/water-tile';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { MapShared } from '@common/interfaces/map-shared';

@Injectable({
    providedIn: 'root',
})
export class MapEditorManagerService {
    map: MapShared = {
        name: '',
        description: '',
        size: 10,
        tiles: [],
    };

    grid: Tile[][] = [];
    selectedEntity: PlaceableEntity | null;
    sideMenuSelectedEntity: null | PlaceableEntity;
    isDraggingLeft: boolean = false;
    isDraggingRight: boolean = false;

    newMap() {
        this.map = {
            name: '',
            description: '',
            size: 10,
            tiles: [],
        };
    }

    loadMap(map: MapShared) {
        this.map = map;
    }

    gridCreator(tileNumber: number) {
        for (let i = 0; i < tileNumber; i++) {
            this.grid.push([]);
            for (let j = 0; j < tileNumber; j++) {
                const newTile = new GrassTile();
                this.grid[i].push(newTile);
                newTile.coordinates = { x: j, y: i };
            }
        }
    }

    setMapSize(size: number) {
        this.grid = [];
        this.gridCreator(size);
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

    isTerrainTile(tile: Tile): tile is TerrainTile {
        return (tile as TerrainTile).item !== undefined;
    }

    isItem(placeableEntity: PlaceableEntity): placeableEntity is Item {
        return (placeableEntity as Item).testItem !== undefined;
    }

    copyTypeTile(tile: Tile): Tile {
        if (tile instanceof GrassTile) {
            return new GrassTile(tile);
        } else if (tile instanceof IceTile) {
            return new IceTile(tile);
        } else if (tile instanceof WaterTile) {
            return new WaterTile(tile);
        } else if (tile instanceof WallTile) {
            return new WallTile(tile);
        } else if (tile instanceof DoorTile) {
            return new DoorTile(tile);
        } else {
            return new Tile(tile);
        }
    }

    createATileCopy(sideMenuSelectedEntity: Tile, entity: PlaceableEntity): Tile {
        let tileCopy = this.copyTypeTile(sideMenuSelectedEntity);
        tileCopy.coordinates = { x: entity.coordinates.x, y: entity.coordinates.y };
        return tileCopy;
    }

    onMouseEnter(entity: PlaceableEntity) {
        if (entity.visibleState !== VisibleState.selected) entity.visibleState = VisibleState.hovered;
    }

    onMouseLeave(entity: PlaceableEntity) {
        if (entity.visibleState !== VisibleState.selected) entity.visibleState = VisibleState.notSelected;
    }

    tileCopyCreator(copiedTile: Tile, selectedTile: Tile) {
        let tileCopy = this.createATileCopy(copiedTile, selectedTile);
        tileCopy.coordinates = { x: selectedTile.coordinates.x, y: selectedTile.coordinates.y };
        this.grid[selectedTile.coordinates.y][selectedTile.coordinates.x] = tileCopy;
        tileCopy.visibleState = VisibleState.notSelected;
    }

    onMouseDownMapTile(event: MouseEvent, entity: Tile) {
        if (event.button === 0) {
            if (this.sideMenuSelectedEntity) {
                if (this.isItem(this.sideMenuSelectedEntity) && this.isTerrainTile(entity)) {
                    entity.item = this.sideMenuSelectedEntity;
                    this.sideMenuSelectedEntity.visibleState = VisibleState.notSelected;
                    this.sideMenuSelectedEntity = null;
                } else if (!this.isItem(this.sideMenuSelectedEntity)) {
                    this.isDraggingLeft = true;
                    this.tileCopyCreator(this.sideMenuSelectedEntity as Tile, entity);
                }
            }
        } else if (event.button === 2) {
            if (!this.isItem(entity) && !(entity instanceof GrassTile)) {
                this.isDraggingRight = true;
                event.preventDefault();
                this.tileCopyCreator(new GrassTile(), entity);
            } else if (this.isTerrainTile(entity)) {
                entity.item = null;
                console.log('Item deleted');
            }
            console.log('Dragging ended');
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
        } else if (this.sideMenuSelectedEntity && this.sideMenuSelectedEntity !== entity) {
            //another entity selected
            this.sideMenuSelectedEntity.visibleState = VisibleState.notSelected;
            entity.visibleState = VisibleState.selected;
            this.sideMenuSelectedEntity = entity;
            this.cancelSelectionMap();
        } else {
            entity.visibleState = VisibleState.selected; //selection of the entity
            this.sideMenuSelectedEntity = entity;
            this.cancelSelectionMap();
        }
    }

    onRightClick(event: MouseEvent) {
        event.preventDefault();
    }
}
