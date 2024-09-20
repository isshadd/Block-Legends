import { Injectable } from '@angular/core';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { TerrainTile } from '@app/interfaces/terrain-tile';
import { Vec2 } from '@app/interfaces/vec2';
import { Item } from '../Items/item';

@Injectable({
    providedIn: 'root',
})
export class IceTile implements TerrainTile {
    name: string = 'IceTile';
    description: string = 'Glace';
    imageUrl: string = 'assets/images/tiles/ice.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
    item: Item;
    visibleState: VisibleState = VisibleState.notSelected;
}
