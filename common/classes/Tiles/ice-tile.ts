import { TileType } from '../../enums/tile-type';
import { TerrainTile } from './terrain-tile';

export class IceTile extends TerrainTile {
    type: TileType = TileType.Ice;
    moveCost: number = 0;
    description: string = `Glace. 10% de risque de chute en marchant dessus. Consomme ${this.moveCost} movement. 
    Pénalité de -2 sur l'attaque et la défense `;
    imageUrl: string = 'assets/images/tiles/ice.jpg';
}
