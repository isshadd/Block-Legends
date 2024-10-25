import { Injectable } from '@angular/core';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { OpenDoor } from '@app/classes/Tiles/open-door';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { WallTile } from '@app/classes/Tiles/wall-tile';
import { WaterTile } from '@app/classes/Tiles/water-tile';
import { TileType } from '@common/enums/tile-type';
import { TileShared } from '@common/interfaces/tile-shared';
import { ItemFactoryService } from './item-factory.service';

@Injectable({
    providedIn: 'root',
})
export class TileFactoryService {
    constructor(public itemFactoryService: ItemFactoryService) {}

    createTile(type: TileType): Tile {
        switch (type) {
            case TileType.Grass:
                return new GrassTile();
            case TileType.Ice:
                return new IceTile();
            case TileType.Water:
                return new WaterTile();
            case TileType.Wall:
                return new WallTile();
            case TileType.Door:
                return new DoorTile();
            case TileType.OpenDoor:
                return new OpenDoor();
            default:
                return new Tile();
        }
    }

    copyFromTile(tile: Tile): Tile {
        const newTile = this.createTile(tile.type);
        return newTile;
    }

    loadGridFromJSON(jsonGrid: TileShared[][]): Tile[][] {
        const grid: Tile[][] = [];
        for (let i = 0; i < jsonGrid.length; i++) {
            grid.push([]);
            for (let j = 0; j < jsonGrid[i].length; j++) {
                const newTile: Tile = this.createTile(jsonGrid[i][j].type);
                grid[i].push(newTile);
                newTile.coordinates = { x: i, y: j };

                if (newTile.isTerrain()) {
                    const itemType = jsonGrid[i][j].item?.type;
                    if (itemType) (newTile as TerrainTile).item = this.itemFactoryService.createItem(itemType);
                }
            }
        }
        return grid;
    }
}
