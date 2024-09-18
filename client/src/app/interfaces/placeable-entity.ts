import { Vec2 } from './vec2';

export interface PlaceableEntity {
    name: string;
    description: string;
    imageUrl: string;
    coordinates: Vec2;
}
