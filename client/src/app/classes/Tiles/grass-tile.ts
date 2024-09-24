import { Injectable } from '@angular/core';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { VisibleState } from '@common/placeable-entity';
import { Vec2 } from '@common/vec2';
import { Item } from '../Items/item';

@Injectable({
    providedIn: 'root',
})
export class GrassTile extends TerrainTile {
    name: string = 'GrassTile';
    description: string = 'Gazon';
    imageUrl: string = 'assets/images/tiles/grass.png';
    coordinates: Vec2 = { x: -1, y: -1 };
    item: Item | null;
    visibleState: VisibleState = VisibleState.notSelected;
}
