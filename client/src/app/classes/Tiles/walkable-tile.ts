import { PlayerMapEntity } from '../Characters/player-map-entity';
import { Tile } from './tile';

export class WalkableTile extends Tile {
    player: PlayerMapEntity | null = null;

    isWalkable(): boolean {
        return true;
    }

    setPlayer(player: PlayerMapEntity) {
        this.player = player;
        player.setCoordinates(this.coordinates);
    }

    removePlayer() {
        this.player = null;
    }
}
