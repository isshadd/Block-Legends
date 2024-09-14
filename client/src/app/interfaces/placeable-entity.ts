import { Vec2 } from './vec2';

export interface PlaceableEntity {
    name: String;
    description: String;
    imageUrl: String;
    coordinates: Vec2;
}
