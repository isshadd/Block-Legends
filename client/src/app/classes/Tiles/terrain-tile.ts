import { Injectable } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { Tile } from './tile';

@Injectable({
    providedIn: 'root',
})
export class TerrainTile extends Tile {
    item: Item | null = null;
    selectedTile: import("c:/Users/iremy/OneDrive/Documents/University/LOG2990/Projet2/LOG2990-104/client/src/app/interfaces/placeable-entity").PlaceableEntity;
}
