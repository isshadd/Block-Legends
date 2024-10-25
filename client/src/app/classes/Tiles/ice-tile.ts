import { Injectable } from '@angular/core';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { TileType } from '@common/enums/tile-type';

@Injectable({
    providedIn: 'root',
})
export class IceTile extends TerrainTile {
    type: TileType = TileType.Ice;
    description: string = 'Glace. Risque de chute en marchant dessus.';
    imageUrl: string = 'assets/images/tiles/ice.jpg';
}
