import { Injectable } from '@angular/core';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { VisibleState } from '@common/placeable-entity';
import { Vec2 } from '@common/vec2';
import { Item } from '../Items/item';

@Injectable({
    providedIn: 'root',
})
export class IceTile extends TerrainTile {
    name: string = 'IceTile';
    description: string = 'Glace';
    imageUrl: string = 'assets/images/tiles/ice.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
    item: Item | null = null;
    visibleState: VisibleState = VisibleState.notSelected;
}
