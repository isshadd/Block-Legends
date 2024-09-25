import { Vec2 } from '@common/interfaces/vec2';

export enum VisibleState {
    notSelected,
    selected,
    hovered,
    valid,
    invalid,
    disabled,
}
export interface PlaceableEntity {
    description: string;
    imageUrl: string;
    coordinates: Vec2;
    visibleState: VisibleState;
}
