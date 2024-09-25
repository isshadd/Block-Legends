import { Injectable } from '@angular/core';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { Vec2 } from '@common/interfaces/vec2';
import { TileType } from '../../../../../common/enums/tile-type';
import { Item } from '../Items/item';

@Injectable({
    providedIn: 'root',
})
export class IceTile extends TerrainTile {
    type: TileType = TileType.Ice;
    description: string = 'Glace';
    imageUrl: string = 'assets/images/tiles/ice.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
    item: Item | null = null;
    visibleState: VisibleState = VisibleState.notSelected;
}
