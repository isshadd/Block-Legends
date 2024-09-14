import { Injectable } from '@angular/core';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';
import { MapCoordinateService } from '@app/services/map-coordinate.service';

@Injectable({
    providedIn: 'root',
})
export class Item implements PlaceableEntity {
    name: String = 'Item';
    description: String = 'Item';
    imageUrl: String = 'assets/images/item/baseItem.png'; //minecraftWiki
    coordinates: MapCoordinateService = new MapCoordinateService();
    constructor() {}
}
