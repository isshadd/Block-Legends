import { Injectable } from '@angular/core';
import { GameStatistics } from '@common/interfaces/game-statistics';

export enum SortCharacters {
    Name = 'name',
    Fights = 'fights',
    FightWins = 'fightWins',
    FightLoses = 'fightLoses',
}
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

    sortPlayersIncreasing(sort: SortCharacters) {
        switch (sort) {
            case SortCharacters.Fights:
                this.gameStatistics.players.sort((a, b) => b.fightWins + b.fightLoses - (a.fightWins + a.fightLoses));
                break;
            case SortCharacters.Name:
                this.gameStatistics.players.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case SortCharacters.FightWins:
                this.gameStatistics.players.sort((a, b) => b.fightWins - a.fightWins);
                break;
            case SortCharacters.FightLoses:
                this.gameStatistics.players.sort((a, b) => b.fightLoses - a.fightLoses);
                break;
            default:
                break;
        }
    }

    sortPlayersDecreasing(sort: SortCharacters) {
        switch (sort) {
            case SortCharacters.Fights:
                this.gameStatistics.players.sort((a, b) => a.fightWins + a.fightLoses - (b.fightWins + b.fightLoses));
                break;
            case SortCharacters.Name:
                this.gameStatistics.players.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case SortCharacters.FightWins:
                this.gameStatistics.players.sort((a, b) => a.fightWins - b.fightWins);
                break;
            case SortCharacters.FightLoses:
                this.gameStatistics.players.sort((a, b) => a.fightLoses - b.fightLoses);
                break;
            default:
                break;
        }
    }
}
