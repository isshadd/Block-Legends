import { MapCoordinateService } from '@app/services/map-coordinate.service';

export interface PlaceableEntity {
    name: String;
    description: String;
    imageUrl: String;
    coordinates: MapCoordinateService;
}
