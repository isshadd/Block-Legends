import { ItemType } from '../../enums/item-type';
import { PlaceableEntity, VisibleState } from '../../interfaces/placeable-entity';
import { Vec2 } from '../../interfaces/vec2';

export class Item implements PlaceableEntity {
    type: ItemType;
    description: string;
    imageUrl: string; // minecraftWiki
    coordinates: Vec2 = { x: -1, y: -1 };
    visibleState: VisibleState = VisibleState.NotSelected;
    isPlaced: boolean = false;
    itemLimit: number = 1;

    isItem(): boolean {
        return true;
    }

    setCoordinates(coordinates: Vec2) {
        this.coordinates = coordinates;
    }

    isGrabbable(): boolean {
        return true;
    }
}
