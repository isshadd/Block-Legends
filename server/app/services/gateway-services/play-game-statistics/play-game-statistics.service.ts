import { PlayerCharacter } from '@common/classes/Player/player-character';
import { ItemType } from '@common/enums/item-type';
import { TileType } from '@common/enums/tile-type';
import { GameStatistics } from '@common/interfaces/game-statistics';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable, Logger } from '@nestjs/common';
import { GameSocketRoomService } from '../game-socket-room/game-socket-room.service';

@Injectable()
export class PlayGameStatisticsService {
    private readonly logger = new Logger(PlayGameStatisticsService.name);

    constructor(private readonly gameSocketRoomService: GameSocketRoomService) {
        this.startTimer();
    }

    startTimer(): void {
        setInterval(() => {
            this.secondPassed();
        }, 1000);
    }

    secondPassed(): void {
        this.gameSocketRoomService.gameStatisticsRooms.forEach((gameStatisticsTimer) => {
            if (gameStatisticsTimer.isGameOn) {
                gameStatisticsTimer.totalGameTime++;
            }
        });
    }

    initGameStatistics(accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        const gameStatisticsRoom = this.gameSocketRoomService.gameStatisticsRooms.get(accessCode);

        if (!room || !gameStatisticsRoom) {
            this.logger.error(`Room pas trouve pour code: ${accessCode}`);
            return;
        }

        gameStatisticsRoom.players = [...room.players];
        gameStatisticsRoom.isGameOn = true;
        gameStatisticsRoom.totalGameTime = 0;
    }

    getPlayerStatisticsById(accessCode: number, playerId: string): PlayerCharacter | undefined {
        const gameStatisticsRoom = this.gameSocketRoomService.gameStatisticsRooms.get(accessCode);

        if (!gameStatisticsRoom) {
            this.logger.error(`Room pas trouve pour code: ${accessCode}`);
            return;
        }

        return gameStatisticsRoom.players.find((player) => player.socketId === playerId);
    }

    increasePlayerStatistic(accessCode: number, playerId: string, statistic: keyof PlayerCharacter) {
        const player = this.getPlayerStatisticsById(accessCode, playerId);

        if (!player) {
            this.logger.error(`Player pas trouve pour id: ${playerId}`);
            return;
        }

        if (typeof player[statistic] === 'number') {
            player[statistic]++;
        } else {
            this.logger.error(`Statistic ${statistic} is not a number for player id: ${playerId}`);
        }
    }

    addDifferentItemGrabbed(accessCode: number, playerId: string, itemType: ItemType) {
        const player = this.getPlayerStatisticsById(accessCode, playerId);

        if (!player) {
            this.logger.error(`Player pas trouve pour id: ${playerId}`);
            return;
        }

        if (!player.differentItemsGrabbed.includes(itemType)) {
            player.differentItemsGrabbed.push(itemType);
        }
    }

    addDifferentTerrainTileVisited(accessCode: number, playerId: string, tilePosition: Vec2) {
        const player = this.getPlayerStatisticsById(accessCode, playerId);
        const gameBoardRoom = this.gameSocketRoomService.gameBoardRooms.get(accessCode);

        if (!player || !gameBoardRoom) {
            this.logger.error(`Player pas trouve pour id: ${playerId}`);
            return;
        }

        const terrainTilesTypes = [TileType.Grass, TileType.Water, TileType.Ice];
        const tile = gameBoardRoom.game.tiles[tilePosition.y][tilePosition.x];

        if (
            terrainTilesTypes.includes(tile.type) &&
            !player.differentTerrainTilesVisited.some((position) => position.x === tilePosition.x && position.y === tilePosition.y)
        ) {
            player.differentTerrainTilesVisited.push(tilePosition);
        }
    }

    endGameStatistics(accessCode: number): GameStatistics {
        const gameStatisticsRoom = this.gameSocketRoomService.gameStatisticsRooms.get(accessCode);

        if (!gameStatisticsRoom) {
            this.logger.error(`Room pas trouve pour code: ${accessCode}`);
            return;
        }

        gameStatisticsRoom.isGameOn = false;
        return gameStatisticsRoom;
    }
}
