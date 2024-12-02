import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { DoorTile } from '@common/classes/Tiles/door-tile';
import { OpenDoor } from '@common/classes/Tiles/open-door';
import { Tile } from '@common/classes/Tiles/tile';
import { GameStatistics } from '@common/interfaces/game-statistics';
import { GameMapDataManagerService } from '../game-board-services/game-map-data-manager.service';

export enum SortAttribute {
    Name = 'name',
    TotalCombats = 'totalCombats',
    TotalEvasions = 'totalEvasions',
    FightWins = 'fightWins',
    FightLoses = 'fightLoses',
    TotalLostLife = 'totalLostLife',
    TotalDamageDealt = 'totalDamageDealt',
    DifferentItemsGrabbed = 'differentItemsGrabbed',
    DifferentTerrainTilesVisited = 'differentTerrainTilesVisited',
}

export enum SortDirection {
    Ascending = 'ascending',
    Descending = 'descending',
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

    sortPlayersByNumberAttribute(sortAttribute: SortAttribute, sortDirection: SortDirection) {
        this.gameStatistics.players.sort((a, b) => {
            if (sortDirection === SortDirection.Ascending) {
                return (b[sortAttribute] as number) - (a[sortAttribute] as number);
            } else {
                return (a[sortAttribute] as number) - (b[sortAttribute] as number);
            }
        });
    }

    sortPlayersByOtherAttribute(sortAttribute: SortAttribute, sortDirection: SortDirection) {
        switch (sortAttribute) {
            case SortAttribute.DifferentItemsGrabbed:
                this.gameStatistics.players.sort((a, b) => {
                    if (sortDirection === SortDirection.Ascending) {
                        return b.differentItemsGrabbed.length - a.differentItemsGrabbed.length;
                    } else {
                        return a.differentItemsGrabbed.length - b.differentItemsGrabbed.length;
                    }
                });
                break;
            case SortAttribute.DifferentTerrainTilesVisited:
                this.gameStatistics.players.sort((a, b) => {
                    if (sortDirection === SortDirection.Ascending) {
                        return b.differentTerrainTilesVisited.length - a.differentTerrainTilesVisited.length;
                    } else {
                        return a.differentTerrainTilesVisited.length - b.differentTerrainTilesVisited.length;
                    }
                });
                break;
            case SortAttribute.Name:
                this.gameStatistics.players.sort((a, b) => {
                    if (sortDirection === SortDirection.Ascending) {
                        return b.name.localeCompare(a.name);
                    } else {
                        return a.name.localeCompare(b.name);
                    }
                });
                break;
            default:
                break;
        }
    }

    getGameTilePercentage(): number {
        return Math.round((this.gameStatistics.totalTerrainTilesVisited.length / this.gameMapDataManagerService.getTerrainTilesCount()) * 100);
    }

    getTilePercentageByPlayer(player: PlayerCharacter): number {
        return Math.round((player.differentTerrainTilesVisited.length / this.gameMapDataManagerService.getTerrainTilesCount()) * 100);
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
