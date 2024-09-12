import { Injectable } from '@angular/core';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';
import { MapCoordinateService } from '@app/services/map-coordinate.service';

@Injectable({
    providedIn: 'root',
})
export class BaseTile implements PlaceableEntity {
    nom: String = 'BaseTile';
    description: String = 'BaseTile';
    imageUrl: String = 'BaseTile';
    coordinates: MapCoordinateService = new MapCoordinateService();
    constructor() {}
}
