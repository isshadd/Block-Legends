import { Injectable } from '@nestjs/common';
import { GameSocketRoomService } from '../game-socket-room/game-socket-room.service';

@Injectable()
export class PlayGameBoardTimeService {
    constructor(private readonly gameSocketRoomService: GameSocketRoomService) {
        this.startTimer();
    }

    startTimer(): void {
        setInterval(() => {
            this.secondPassed();
        }, 1000);
    }

    secondPassed(): void {
        // this.gameSocketRoomService.rooms.forEach((room) => {
        //     const gameTimer = this.gameSocketRoomService.getGameTimer(room.accessCode);
        //     if (gameTimer && !gameTimer.isPaused) {
        //         gameTimer.time--;
        //         this.gameSocketRoomService.setGameTimer(room.accessCode, gameTimer);
        //         if (gameTimer.time === 0) {
        //             this.gameSocketRoomService.setGameTimer(room.accessCode, { time: 0, isPaused: true });
        //         }
        //     }
        // });
    }
}
