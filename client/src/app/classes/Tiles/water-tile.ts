import { Injectable } from '@angular/core';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { Vec2 } from '@common/interfaces/vec2';
import { Item } from '../Items/item';

@Injectable({
    providedIn: 'root',
})
export class WaterTile extends TerrainTile {
    name: string = 'WaterTile';
    description: string = 'Eau';
    imageUrl: string = 'assets/images/tiles/water.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
    item: Item | null = null;
    visibleState: VisibleState = VisibleState.notSelected;
}
