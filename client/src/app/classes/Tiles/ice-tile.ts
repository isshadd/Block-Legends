import { Injectable } from '@angular/core';
import { MapCoordinateService } from '@app/services/map-coordinate.service';
import { BaseTile } from './base-tile';

@Injectable({
    providedIn: 'root',
})
export class IceTile extends BaseTile {
    name: String = 'IceTile';
    description: String = 'IceTile';
    imageUrl: String = 'assets/images/tiles/ice.jpg';
    coordinates: MapCoordinateService = new MapCoordinateService();
}
