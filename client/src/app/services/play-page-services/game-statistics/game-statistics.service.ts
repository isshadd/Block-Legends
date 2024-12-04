import { Injectable } from '@angular/core';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager/game-map-data-manager.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Tile } from '@common/classes/Tiles/tile';
import { GameStatistics } from '@common/interfaces/game-statistics';

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

    readonly percentageMutltiplier = 100;

    constructor(public gameMapDataManagerService: GameMapDataManagerService) {}

    initGameStatistics(newGameStatistics: GameStatistics) {
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
        return Math.round(
            (this.gameStatistics.totalTerrainTilesVisited.length / this.gameMapDataManagerService.getTerrainTilesCount()) *
                this.percentageMutltiplier,
        );
    }

    getTilePercentageByPlayer(player: PlayerCharacter): number {
        return Math.round(
            (player.differentTerrainTilesVisited.length / this.gameMapDataManagerService.getTerrainTilesCount()) * this.percentageMutltiplier,
        );
    }

    getGameDoorsInteractedPercentage(): number {
        if (this.gameMapDataManagerService.getDoorsCount() === 0) {
            return 0;
        }

        return Math.round(
            (this.gameStatistics.totalDoorsInteracted.length / this.gameMapDataManagerService.getDoorsCount()) * this.percentageMutltiplier,
        );
    }
}
