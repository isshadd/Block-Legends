import { TileType } from '../../enums/tile-type';
import { PlaceableEntity, VisibleState } from '../../interfaces/placeable-entity';
import { Vec2 } from '../../interfaces/vec2';

export class Tile implements PlaceableEntity {
    type: TileType;
    description: string;
    imageUrl: string;
    coordinates: Vec2 = { x: -1, y: -1 };
    visibleState: VisibleState = VisibleState.NotSelected;

    isItem(): boolean {
        return false;
    }

    isTerrain(): boolean {
        return false;
    }

    isWalkable(): boolean {
        return false;
    }

    isDoor(): boolean {
        return false;
    }
}
