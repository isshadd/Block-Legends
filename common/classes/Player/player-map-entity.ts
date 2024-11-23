import { PlaceableEntity, VisibleState } from '../../interfaces/placeable-entity';
import { Vec2 } from '../../interfaces/vec2';

export class PlayerMapEntity implements PlaceableEntity {
    description: string = '';
    imageUrl: string;
    coordinates: Vec2 = { x: -1, y: -1 };
    spawnCoordinates: Vec2;
    visibleState: VisibleState = VisibleState.NotSelected;
    isPlayerOnIce: boolean = false;

    constructor(imageUrl: string) {
        this.imageUrl = imageUrl;
    }

    isItem(): boolean {
        return false;
    }

    setCoordinates(coordinates: Vec2, isPlayerOnIce: boolean) {
        this.coordinates = coordinates;
        this.isPlayerOnIce = isPlayerOnIce;
    }

    setSpawnCoordinates(spawnCoordinates: Vec2) {
        this.spawnCoordinates = spawnCoordinates;
    }

    isOnSpawn(): boolean {
        return this.coordinates.x === this.spawnCoordinates.x && this.coordinates.y === this.spawnCoordinates.y;
    }
}
