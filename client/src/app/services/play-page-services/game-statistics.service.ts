import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { DoorTile } from '@common/classes/Tiles/door-tile';
import { OpenDoor } from '@common/classes/Tiles/open-door';
import { Tile } from '@common/classes/Tiles/tile';
import { GameStatistics } from '@common/interfaces/game-statistics';
import { GameMapDataManagerService } from '../game-board-services/game-map-data-manager.service';

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
    gameStatistics: GameStatistics = {
        players: [],
        isGameOn: false,
        totalGameTime: 0,
        totalPlayerTurns: 0,
        totalTerrainTilesVisited: [],
        totalDoorsInteracted: [],
        totalPlayersThatGrabbedFlag: [],
    };
    currentGrid: Tile[][] = [];

    constructor(public gameMapDataManagerService: GameMapDataManagerService) {}

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

    getTilePercentage(player?: PlayerCharacter): number {
        let gridLength: number = 0;
        for (let column of this.gameMapDataManagerService.getCurrentGrid()) {
            gridLength += column.length;
        }
        if (player) {
            return gridLength === 0 ? 0 : Math.round((player.differentTerrainTilesVisited.length / gridLength) * 100);
        }

        return gridLength === 0 ? 0 : Math.round((this.gameStatistics.totalTerrainTilesVisited.length / gridLength) * 100);
    }

    totalDoorsInMap() {
        const door = this.gameMapDataManagerService
            .getCurrentGrid()
            .reduce((count, row) => count + row.filter((tile) => tile instanceof DoorTile || tile instanceof OpenDoor).length, 0);
        return door;
    }

    getTotalDoorsInteractedPercentage() {
        let totalDoors = this.totalDoorsInMap();
        return totalDoors === 0 ? 0 : Math.round((this.gameStatistics.totalDoorsInteracted.length / totalDoors) * 100);
    }
}
