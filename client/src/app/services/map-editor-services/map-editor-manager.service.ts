import { Injectable } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';

@Injectable({
    providedIn: 'root',
})
export class MapEditorManagerService {
    grid: Tile[][] = [];
    selectedEntity: PlaceableEntity | null;
    sideMenuSelectedEntity: null | PlaceableEntity;

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

    onMouseEnter(entity: PlaceableEntity) {
        if (entity.visibleState !== VisibleState.selected) entity.visibleState = VisibleState.hovered;
    }

    onMouseLeave(entity: PlaceableEntity) {
        if (entity.visibleState !== VisibleState.selected) entity.visibleState = VisibleState.notSelected;
    }

    onMouseDownMapTile(entity: Tile) {
        if (this.sideMenuSelectedEntity) {
            console.log('Side menu entity selected');
            if (this.isItem(this.sideMenuSelectedEntity) && this.isTerrainTile(entity)) {
                entity.item = this.sideMenuSelectedEntity;
                this.sideMenuSelectedEntity.visibleState = VisibleState.notSelected;
                this.sideMenuSelectedEntity = null;
            } else if (!this.isItem(this.sideMenuSelectedEntity)) {
                console.log('Not an item');
                let tileCopy = new Tile(this.sideMenuSelectedEntity as Tile);
                this.grid[entity.coordinates.y][entity.coordinates.x] = tileCopy;
                tileCopy.visibleState = VisibleState.notSelected;
                console.log(tileCopy);
            }
        }
    }

    onMouseDownSideMenu(entity: PlaceableEntity) {
        if (entity.visibleState === VisibleState.selected) {
            entity.visibleState = VisibleState.notSelected;
            this.sideMenuSelectedEntity = null;
            this.cancelSelectionMap();
        } else if (this.sideMenuSelectedEntity && this.sideMenuSelectedEntity !== entity) {
            this.sideMenuSelectedEntity.visibleState = VisibleState.notSelected;
            entity.visibleState = VisibleState.selected;
            this.sideMenuSelectedEntity = entity;
            this.cancelSelectionMap();
        } else {
            entity.visibleState = VisibleState.selected;
            this.sideMenuSelectedEntity = entity;
            this.cancelSelectionMap();
        }
    }
}
