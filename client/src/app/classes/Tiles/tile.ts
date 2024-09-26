import { Injectable } from '@angular/core';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { TileType } from '@common/enums/tile-type';
import { Vec2 } from '@common/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class Tile implements PlaceableEntity {
    type: TileType;
    description: string;
    imageUrl: string;
    coordinates: Vec2;
    visibleState: VisibleState;
}
