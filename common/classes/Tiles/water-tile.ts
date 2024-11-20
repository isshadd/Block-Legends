import { TileType } from '../../enums/tile-type';
import { TerrainTile } from './terrain-tile';

export class WaterTile extends TerrainTile {
    type: TileType = TileType.Water;
    moveCost: number = 2;
    description: string = `Eau. Nager consomme ${this.moveCost} movement.`;
    imageUrl: string = 'assets/images/tiles/water.jpg';
}
