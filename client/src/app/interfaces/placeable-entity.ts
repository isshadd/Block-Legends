import { MapCoordinateService } from '@app/services/map-coordinate.service';

export interface PlaceableEntity {
    nom: String;
    description: String;
    imageUrl: String;
    coordinates: MapCoordinateService;
}
