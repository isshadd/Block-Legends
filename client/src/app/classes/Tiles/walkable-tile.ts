import { TileType } from '@common/enums/tile-type';
import { PlayerMapEntity } from '../Characters/player-map-entity';
import { Tile } from './tile';

export class WalkableTile extends Tile {
    player: PlayerMapEntity | null = null;
    moveCost: number = 1;

    isWalkable(): boolean {
        return true;
    }

    hasPlayer(): boolean {
        return !!this.player;
    }

    setPlayer(player: PlayerMapEntity) {
        this.player = player;
        player.setCoordinates(this.coordinates, this.type === TileType.Ice);
    }

    removePlayer() {
        this.player = null;
    }
}
