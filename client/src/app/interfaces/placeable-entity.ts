import { Vec2 } from './vec2';

export enum VisibleState {
    notSelected,
    selected,
    hovered,
    valid,
    invalid,
}
export interface PlaceableEntity {
    name: string;
    description: string;
    imageUrl: string;
    coordinates: Vec2;
    visibleState: VisibleState;
}
