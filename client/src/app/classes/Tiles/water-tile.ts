import { Injectable } from '@angular/core';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { TileType } from '@common/enums/tile-type';

@Injectable({
    providedIn: 'root',
})
export class WaterTile extends TerrainTile {
    type: TileType = TileType.Water;
    description: string = "Eau. Nager consomme plus d'énergie que marcher.";
    imageUrl: string = 'assets/images/tiles/water.jpg';
    moveCost: number = 2;
}
