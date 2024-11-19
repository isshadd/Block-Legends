import { TileType } from '../../enums/tile-type';
import { Tile } from './tile';

export class WallTile extends Tile {
    type: TileType = TileType.Wall;
    description: string = 'Mur. Impossible de passer.';
    imageUrl: string = 'assets/images/tiles/brickwall.jpg';
}
