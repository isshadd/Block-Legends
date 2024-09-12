import { Injectable } from '@angular/core';
import { MapCoordinateService } from '@app/services/map-coordinate.service';
import { BaseTile } from './base-tile';

@Injectable({
    providedIn: 'root',
})
export class DoorTile extends BaseTile {
    name: String = 'DoorTile';
    description: String = 'DoorTile';
    imageUrl: String = 'assets/images/tiles/door.jpg';
    coordinates: MapCoordinateService = new MapCoordinateService();
}
