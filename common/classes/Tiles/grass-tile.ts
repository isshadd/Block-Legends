import { TileType } from '../../enums/tile-type';
import { TerrainTile } from './terrain-tile';

export class GrassTile extends TerrainTile {
    type: TileType = TileType.Grass;
    description: string = "Gazon, pas d'effet";
    imageUrl: string = 'assets/images/tiles/grass.png';
}
