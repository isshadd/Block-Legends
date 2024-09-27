import { Injectable } from '@angular/core';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { WallTile } from '@app/classes/Tiles/wall-tile';
import { WaterTile } from '@app/classes/Tiles/water-tile';
import { TileType } from '@common/enums/tile-type';

@Injectable({
    providedIn: 'root',
})
export class TileFactoryService {
    constructor() {}

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
            default:
                return new Tile();
        }
    }

    copyFromTile(tile: Tile): Tile {
        const newTile = this.createTile(tile.type);
        return newTile;
    }
}
