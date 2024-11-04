import { Injectable } from '@angular/core';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { TileType } from '@common/enums/tile-type';

@Injectable({
    providedIn: 'root',
})
export class IceTile extends TerrainTile {
    type: TileType = TileType.Ice;
    moveCost: number = 0;
    description: string = `Glace. 10% de risque de chute en marchant dessus. Consomme ${this.moveCost} movement.`;
    imageUrl: string = 'assets/images/tiles/ice.jpg';
}
