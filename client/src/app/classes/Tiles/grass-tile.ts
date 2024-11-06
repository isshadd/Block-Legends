import { Injectable } from '@angular/core';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { TileType } from '@common/enums/tile-type';

@Injectable({
    providedIn: 'root',
})
export class GrassTile extends TerrainTile {
    type: TileType = TileType.Grass;
    description: string = "Gazon, pas d'effet";
    imageUrl: string = 'assets/images/tiles/grass.png';
}
