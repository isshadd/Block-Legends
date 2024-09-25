import { Injectable } from '@angular/core';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { Vec2 } from '@common/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class Tile implements PlaceableEntity {
    name: string;
    description: string;
    imageUrl: string;
    coordinates: Vec2;
    visibleState: VisibleState;

    constructor(copy?: Tile) {
        if (copy) {
            this.name = copy.name;
            this.description = copy.description;
            this.imageUrl = copy.imageUrl;
            this.coordinates = copy.coordinates;
            this.visibleState = copy.visibleState;
        }
    }
}
