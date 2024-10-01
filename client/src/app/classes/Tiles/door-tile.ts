import { Injectable } from '@angular/core';
import { Tile } from '@app/classes/Tiles/tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { Vec2 } from '@common/interfaces/vec2';
import { TileType } from '../../../../../common/enums/tile-type';

@Injectable({
    providedIn: 'root',
})
export class DoorTile extends Tile {
    type: TileType = TileType.Door;
    description: string = "Porte fermée. Ne peut être franchie que si elle est ouverte. Cliquez avec une autre porte pour l'ouvrir.";
    imageUrl: string = 'assets/images/tiles/door.jpg';
    coordinates: Vec2 = { x: -1, y: -1 };
    visibleState: VisibleState = VisibleState.notSelected;
}
