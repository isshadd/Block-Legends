import { Injectable } from '@angular/core';
import { GameStatistics } from '@common/interfaces/game-statistics';

@Injectable({
    providedIn: 'root',
})
export class GameStatisticsService {
    gameStatistics: GameStatistics;

    constructor() {}

    initGameStatistics(newGameStatistics: GameStatistics) {
        console.log(newGameStatistics);
        this.gameStatistics = newGameStatistics;
    }
}
