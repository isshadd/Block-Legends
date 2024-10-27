import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { Vec2 } from '@common/interfaces/vec2';

export class PlayerMapEntity implements PlaceableEntity {
    description: string = '';
    imageUrl: string;
    coordinates: Vec2 = { x: -1, y: -1 };
    spawnCoordinates: Vec2;
    visibleState: VisibleState = VisibleState.NotSelected;

    constructor(imageUrl: string) {
        this.imageUrl = imageUrl;
    }

    isItem(): boolean {
        return false;
    }

    setCoordinates(coordinates: Vec2) {
        this.coordinates = coordinates;
    }

    setSpawnCoordinates(spawnCoordinates: Vec2) {
        this.spawnCoordinates = spawnCoordinates;
    }
}
