import { TestBed } from '@angular/core/testing';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Tile } from '@common/classes/Tiles/tile';
import { ItemType } from '@common/enums/item-type';
import { GameStatistics } from '@common/interfaces/game-statistics';
import { GameStatisticsService, SortAttribute, SortDirection } from './game-statistics.service';

describe('GameStatisticsService', () => {
    let service: GameStatisticsService;
    let mockGameMapDataManagerService: jasmine.SpyObj<GameMapDataManagerService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('GameMapDataManagerService', ['getTerrainTilesCount', 'getDoorsCount']);

        TestBed.configureTestingModule({
            providers: [GameStatisticsService, { provide: GameMapDataManagerService, useValue: spy }],
        });

        service = TestBed.inject(GameStatisticsService);
        mockGameMapDataManagerService = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;
    });

    describe('Initialization', () => {
        it('should initialize game statistics correctly', () => {
            const initialStats: GameStatistics = {
                players: [
                    {
                        name: 'Player1',
                        totalCombats: 5,
                        totalEvasions: 2,
                        fightWins: 3,
                        fightLoses: 2,
                        totalLostLife: 10,
                        totalDamageDealt: 150,
                        differentItemsGrabbed: [ItemType.Sword],
                        differentTerrainTilesVisited: [new Tile()],
                    } as unknown as PlayerCharacter,
                ],
                isGameOn: true,
                totalGameTime: 120,
                totalPlayerTurns: 30,
                totalTerrainTilesVisited: [
                    { x: 0, y: 0 },
                    { x: 0, y: 1 },
                ],
                totalDoorsInteracted: [{ x: 0, y: 2 }],
                totalPlayersThatGrabbedFlag: ['Player1'],
            };

            service.initGameStatistics(initialStats);
            expect(service.gameStatistics).toEqual(initialStats);
        });
    });

    describe('sortPlayersByNumberAttribute', () => {
        beforeEach(() => {
            service.gameStatistics.players = [
                {
                    name: 'Alice',
                    totalCombats: 10,
                    totalEvasions: 5,
                    fightWins: 7,
                    fightLoses: 3,
                    totalLostLife: 20,
                    totalDamageDealt: 300,
                    differentItemsGrabbed: [],
                    differentTerrainTilesVisited: [],
                } as unknown as PlayerCharacter,
                {
                    name: 'Bob',
                    totalCombats: 8,
                    totalEvasions: 6,
                    fightWins: 5,
                    fightLoses: 3,
                    totalLostLife: 15,
                    totalDamageDealt: 250,
                    differentItemsGrabbed: [],
                    differentTerrainTilesVisited: [],
                } as unknown as PlayerCharacter,
                {
                    name: 'Charlie',
                    totalCombats: 12,
                    totalEvasions: 4,
                    fightWins: 9,
                    fightLoses: 3,
                    totalLostLife: 25,
                    totalDamageDealt: 400,
                    differentItemsGrabbed: [],
                    differentTerrainTilesVisited: [],
                } as unknown as PlayerCharacter,
            ];
        });

        it('should sort players by totalCombats in ascending order', () => {
            service.sortPlayersByNumberAttribute(SortAttribute.TotalCombats, SortDirection.Ascending);
            expect(service.gameStatistics.players.map((p) => p.totalCombats)).toEqual([
                service.gameStatistics.players[0].totalCombats,
                service.gameStatistics.players[1].totalCombats,
                service.gameStatistics.players[2].totalCombats,
            ]);
        });

        it('should sort players by totalCombats in descending order', () => {
            service.sortPlayersByNumberAttribute(SortAttribute.TotalCombats, SortDirection.Descending);
            expect(service.gameStatistics.players.map((p) => p.totalCombats)).toEqual([
                service.gameStatistics.players[0].totalCombats,
                service.gameStatistics.players[1].totalCombats,
                service.gameStatistics.players[2].totalCombats,
            ]);
        });

        it('should sort players by totalDamageDealt in ascending order', () => {
            service.sortPlayersByNumberAttribute(SortAttribute.TotalDamageDealt, SortDirection.Ascending);
            expect(service.gameStatistics.players.map((p) => p.totalDamageDealt)).toEqual([
                service.gameStatistics.players[0].totalDamageDealt,
                service.gameStatistics.players[1].totalDamageDealt,
                service.gameStatistics.players[2].totalDamageDealt,
            ]);
        });

        it('should sort players by fightWins in descending order', () => {
            service.sortPlayersByNumberAttribute(SortAttribute.FightWins, SortDirection.Descending);
            expect(service.gameStatistics.players.map((p) => p.fightWins)).toEqual([
                service.gameStatistics.players[0].fightWins,
                service.gameStatistics.players[1].fightWins,
                service.gameStatistics.players[2].fightWins,
            ]);
        });
    });

    describe('sortPlayersByOtherAttribute', () => {
        beforeEach(() => {
            service.gameStatistics.players = [
                {
                    name: 'Charlie',
                    totalCombats: 12,
                    totalEvasions: 4,
                    fightWins: 9,
                    fightLoses: 3,
                    totalLostLife: 25,
                    totalDamageDealt: 400,
                    differentItemsGrabbed: ['sword', 'shield'],
                    differentTerrainTilesVisited: [new Tile(), new Tile(), new Tile()],
                } as unknown as PlayerCharacter,
                {
                    name: 'Alice',
                    totalCombats: 10,
                    totalEvasions: 5,
                    fightWins: 7,
                    fightLoses: 3,
                    totalLostLife: 20,
                    totalDamageDealt: 300,
                    differentItemsGrabbed: ['potion'],
                    differentTerrainTilesVisited: [new Tile()],
                } as unknown as PlayerCharacter,
                {
                    name: 'Bob',
                    totalCombats: 8,
                    totalEvasions: 6,
                    fightWins: 5,
                    fightLoses: 3,
                    totalLostLife: 15,
                    totalDamageDealt: 250,
                    differentItemsGrabbed: ['axe', 'helmet', 'boots'],
                    differentTerrainTilesVisited: [new Tile(), new Tile()],
                } as unknown as PlayerCharacter,
            ];
        });

        it('should sort players by DifferentItemsGrabbed in ascending order', () => {
            service.sortPlayersByOtherAttribute(SortAttribute.DifferentItemsGrabbed, SortDirection.Ascending);
            expect(service.gameStatistics.players.map((p) => p.differentItemsGrabbed.length)).toEqual([
                service.gameStatistics.players[0].differentItemsGrabbed.length,
                service.gameStatistics.players[1].differentItemsGrabbed.length,
                service.gameStatistics.players[2].differentItemsGrabbed.length,
            ]);
        });

        it('should sort players by DifferentItemsGrabbed in descending order', () => {
            service.sortPlayersByOtherAttribute(SortAttribute.DifferentItemsGrabbed, SortDirection.Descending);
            expect(service.gameStatistics.players.map((p) => p.differentItemsGrabbed.length)).toEqual([
                service.gameStatistics.players[0].differentItemsGrabbed.length,
                service.gameStatistics.players[1].differentItemsGrabbed.length,
                service.gameStatistics.players[2].differentItemsGrabbed.length,
            ]);
        });

        it('should sort players by DifferentTerrainTilesVisited in ascending order', () => {
            service.sortPlayersByOtherAttribute(SortAttribute.DifferentTerrainTilesVisited, SortDirection.Ascending);
            expect(service.gameStatistics.players.map((p) => p.differentTerrainTilesVisited.length)).toEqual([
                service.gameStatistics.players[0].differentTerrainTilesVisited.length,
                service.gameStatistics.players[1].differentTerrainTilesVisited.length,
                service.gameStatistics.players[2].differentTerrainTilesVisited.length,
            ]);
        });

        it('should sort players by DifferentTerrainTilesVisited in descending order', () => {
            service.sortPlayersByOtherAttribute(SortAttribute.DifferentTerrainTilesVisited, SortDirection.Descending);
            expect(service.gameStatistics.players.map((p) => p.differentTerrainTilesVisited.length)).toEqual([
                service.gameStatistics.players[0].differentTerrainTilesVisited.length,
                service.gameStatistics.players[1].differentTerrainTilesVisited.length,
                service.gameStatistics.players[2].differentTerrainTilesVisited.length,
            ]);
        });

        it('should sort players by Name in ascending order', () => {
            service.sortPlayersByOtherAttribute(SortAttribute.Name, SortDirection.Ascending);
            expect(service.gameStatistics.players.map((p) => p.name)).toEqual([
                service.gameStatistics.players[0].name,
                service.gameStatistics.players[1].name,
                service.gameStatistics.players[2].name,
            ]);
        });

        it('should sort players by Name in descending order', () => {
            service.sortPlayersByOtherAttribute(SortAttribute.Name, SortDirection.Descending);
            expect(service.gameStatistics.players.map((p) => p.name)).toEqual([
                service.gameStatistics.players[0].name,
                service.gameStatistics.players[1].name,
                service.gameStatistics.players[2].name,
            ]);
        });

        it('should not sort players when an unsupported attribute is provided', () => {
            service.sortPlayersByOtherAttribute(SortAttribute.TotalCombats, SortDirection.Ascending);
            expect(service.gameStatistics.players.map((p) => p.name)).toEqual([
                service.gameStatistics.players[0].name,
                service.gameStatistics.players[1].name,
                service.gameStatistics.players[2].name,
            ]);
        });
    });

    describe('Percentage Calculations', () => {
        beforeEach(() => {
            service.gameStatistics.totalTerrainTilesVisited = [
                { x: 0, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: 2 },
            ];
            service.gameStatistics.totalDoorsInteracted = [
                { x: 0, y: 3 },
                { x: 0, y: 4 },
            ];
            const player1: PlayerCharacter = {
                name: 'Alice',
                totalCombats: 10,
                totalEvasions: 5,
                fightWins: 7,
                fightLoses: 3,
                totalLostLife: 20,
                totalDamageDealt: 300,
                differentItemsGrabbed: ['potion'],
                differentTerrainTilesVisited: [new Tile(), new Tile()],
            } as unknown as PlayerCharacter;
            const player2: PlayerCharacter = {
                name: 'Bob',
                totalCombats: 8,
                totalEvasions: 6,
                fightWins: 5,
                fightLoses: 3,
                totalLostLife: 15,
                totalDamageDealt: 250,
                differentItemsGrabbed: ['axe', 'helmet', 'boots'],
                differentTerrainTilesVisited: [new Tile()],
            } as unknown as PlayerCharacter;
            service.gameStatistics.players = [player1, player2];
        });

        it('should calculate game tile percentage correctly', () => {
            const totalTiles = 10;
            mockGameMapDataManagerService.getTerrainTilesCount.and.returnValue(totalTiles);
            const percentage = service.getGameTilePercentage();
            expect(percentage).toBe((service.gameStatistics.totalTerrainTilesVisited.length / totalTiles) * service.percentageMutltiplier);
        });

        it('should calculate tile percentage by player correctly', () => {
            const totalTiles = 10;
            mockGameMapDataManagerService.getTerrainTilesCount.and.returnValue(totalTiles);
            const player = service.gameStatistics.players[0];
            const percentage = service.getTilePercentageByPlayer(player);
            expect(percentage).toBe((player.differentTerrainTilesVisited.length / totalTiles) * service.percentageMutltiplier);
        });

        it('should calculate game doors interacted percentage correctly', () => {
            const totalDoors = 5;
            mockGameMapDataManagerService.getDoorsCount.and.returnValue(totalDoors);
            const percentage = service.getGameDoorsInteractedPercentage();
            expect(percentage).toBe((service.gameStatistics.totalDoorsInteracted.length / totalDoors) * service.percentageMutltiplier);
        });

        it('should handle division by zero in getGameTilePercentage', () => {
            const totalTiles = 0;
            mockGameMapDataManagerService.getTerrainTilesCount.and.returnValue(totalTiles);
            const percentage = service.getGameTilePercentage();
            expect(percentage).toBePositiveInfinity();
        });

        it('should handle zero doors getGameDoorsInteractedPercentage', () => {
            const totalDoors = 0;
            mockGameMapDataManagerService.getDoorsCount.and.returnValue(totalDoors);
            const percentage = service.getGameDoorsInteractedPercentage();
            expect(percentage).toBe(0);
        });
    });
});
