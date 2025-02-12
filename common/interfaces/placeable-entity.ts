import { Vec2 } from '../../common/interfaces/vec2';

export enum VisibleState {
    NotSelected,
    Selected,
    Hovered,
    Valid,
    Invalid,
    Disabled,
    Action,
}
export interface PlaceableEntity {
    description: string;
    imageUrl: string;
    coordinates: Vec2;
    visibleState: VisibleState;

    isItem(): boolean;
}
