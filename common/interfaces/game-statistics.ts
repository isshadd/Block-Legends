import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Vec2 } from './vec2';

export interface GameStatistics {
    players: PlayerCharacter[];
    isGameOn: boolean;
    totalGameTime: number;
    totalPlayerTurns: number;
    totalTerrainTilesVisited: Vec2[];
    totalDoorsInteracted: Vec2[];
    totalPlayersThatGrabbedFlag: string[];
}
