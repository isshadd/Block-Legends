import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { DoorTile } from '@common/classes/Tiles/door-tile';
import { GrassTile } from '@common/classes/Tiles/grass-tile';
import { OpenDoor } from '@common/classes/Tiles/open-door';
import { Tile } from '@common/classes/Tiles/tile';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { ItemType } from '@common/enums/item-type';
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

    constructor(public gameMapDataManagerService: GameMapDataManagerService) {
        const player1 = new PlayerCharacter('Player 1');
        const player2 = new PlayerCharacter('Player 2');

        player1.avatar = AvatarEnum.Alex;
        player1.totalCombats = 2;
        player1.totalEvasions = 2;
        player1.fightWins = 1;
        player1.fightLoses = 1;
        player1.totalLostLife = 10;
        player1.totalDamageDealt = 11;
        player1.differentItemsGrabbed = [ItemType.Totem, ItemType.Flag];
        player1.differentTerrainTilesVisited = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];

        player2.avatar = AvatarEnum.Arlina;
        player2.totalCombats = 3;
        player2.totalEvasions = 3;
        player2.fightWins = 2;
        player2.fightLoses = 0;
        player2.totalLostLife = 5;
        player2.totalDamageDealt = 20;
        player2.differentItemsGrabbed = [ItemType.Totem];
        player2.differentTerrainTilesVisited = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
        ];

        this.gameStatistics.players.push(player1);
        this.gameStatistics.players.push(player2);
        this.gameStatistics.isGameOn = true;
        this.gameStatistics.totalGameTime = 3600;
        this.gameStatistics.totalPlayerTurns = 2;
        this.gameStatistics.totalTerrainTilesVisited = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 2, y: 2 },
        ];
        this.gameStatistics.totalDoorsInteracted = [{ x: 2, y: 2 }];
        this.gameStatistics.totalPlayersThatGrabbedFlag = ['Player 1'];

        this.currentGrid = [
            [new GrassTile(), new GrassTile(), new GrassTile(), new DoorTile()],
            [new GrassTile(), new DoorTile(), new GrassTile(), new GrassTile()],
            [new GrassTile(), new GrassTile(), new DoorTile(), new GrassTile()],
        ];
    }

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

    getTotalTilePercentage() {
        let gridLength: number = 0;
        for (let column of this.gameMapDataManagerService.getCurrentGrid()) {
            gridLength += column.length;
        }
        return gridLength === 0 ? 0 : Math.round((this.gameStatistics.totalTerrainTilesVisited.length / gridLength) * 100);
    }

    totalDoorsInMap() {
        const door = this.gameMapDataManagerService
            .getCurrentGrid()
            .reduce((count, row) => count + row.filter((tile) => tile instanceof DoorTile || tile instanceof OpenDoor).length, 0);
        console.log(door);
        return door;
    }

    getTotalDoorsInteractedPercentage() {
        let totalDoors = this.totalDoorsInMap();
        return totalDoors === 0 ? 0 : Math.round((this.gameStatistics.totalDoorsInteracted.length / totalDoors) * 100);
    }

    getTotalPlayersThatGrabbedFlagPercentage() {
        return Math.round((this.gameStatistics.totalPlayersThatGrabbedFlag.length / this.gameStatistics.players.length) * 100);
    }
}
