import { Injectable } from '@angular/core';
import { TerrainTile } from '@app/interfaces/terrain-tile';
import { Vec2 } from '@app/interfaces/vec2';
import { Item } from '../Items/item';

@Injectable({
    providedIn: 'root',
})
export class GrassTile implements TerrainTile {
    name: string = 'GrassTile';
    description: string = 'GrassTile';
    imageUrl: string = 'assets/images/tiles/grass.png';
    coordinates: Vec2 = { x: -1, y: -1 };
    item: Item;
}
