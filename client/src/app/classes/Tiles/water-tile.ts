import { Injectable } from '@angular/core';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { TerrainTile } from '@app/interfaces/terrain-tile';
import { Vec2 } from '@app/interfaces/vec2';
import { Item } from '../Items/item';

@Injectable({
    providedIn: 'root',
})
export class WaterTile implements TerrainTile {
    name: string = 'WaterTile';
    description: string = 'WaterTile';
    imageUrl: string = 'assets/images/tiles/water.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
    item: Item;
    visibleState: VisibleState = VisibleState.notSelected;
}
