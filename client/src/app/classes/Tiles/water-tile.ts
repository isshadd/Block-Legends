import { Injectable } from '@angular/core';
import { MapCoordinateService } from '@app/services/map-coordinate.service';
import { BaseTile } from './base-tile';

@Injectable({
    providedIn: 'root',
})
export class WaterTile extends BaseTile {
    name: String = 'WaterTile';
    description: String = 'WaterTile';
    imageUrl: String = 'assets/images/tiles/water.jpg';
    coordinates: MapCoordinateService = new MapCoordinateService();
}
