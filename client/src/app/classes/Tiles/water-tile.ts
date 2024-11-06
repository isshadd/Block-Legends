import { Injectable } from '@angular/core';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { TileType } from '@common/enums/tile-type';

@Injectable({
    providedIn: 'root',
})
export class WaterTile extends TerrainTile {
    type: TileType = TileType.Water;
    moveCost: number = 2;
    description: string = `Eau. Nager consomme ${this.moveCost} movement.`;
    imageUrl: string = 'assets/images/tiles/water.jpg';
}
