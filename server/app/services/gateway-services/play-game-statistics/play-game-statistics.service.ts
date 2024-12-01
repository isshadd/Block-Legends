import { GameStatistics } from '@common/interfaces/game-statistics';
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
