import { Injectable } from '@angular/core';
import { MapCoordinateService } from '@app/services/map-coordinate.service';
import { BaseTile } from './base-tile';

@Injectable({
    providedIn: 'root',
})
export class WallTile extends BaseTile {
    name: String = 'WallTile';
    description: String = 'WallTile';
    imageUrl: String = '@assets/images/tiles/brickwall.jpg';
    coordinates: MapCoordinateService = new MapCoordinateService();
}
