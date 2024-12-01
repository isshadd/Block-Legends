import { Vec2 } from './vec2';

export interface GameStatistics {
    totalGameTime: number;
    totalPlayerTurns: number;
    totalTerrainTilesVisited: Vec2[];
    totalDoorsInteracted: Vec2[];
    totalPlayersThatGrabbedFlag: string[];
}
