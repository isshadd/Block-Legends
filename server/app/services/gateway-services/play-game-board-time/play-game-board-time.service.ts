import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { GameSocketRoomService } from '../game-socket-room/game-socket-room.service';

@Injectable()
export class PlayGameBoardTimeService {
    signalRoomTimeOut = new Subject<number>();
    signalRoomTimeOut$ = this.signalRoomTimeOut.asObservable();

    signalRoomTimePassed = new Subject<number>();
    signalRoomTimePassed$ = this.signalRoomTimePassed.asObservable();

    constructor(private readonly gameSocketRoomService: GameSocketRoomService) {
        this.startTimer();
    }

    startTimer(): void {
        setInterval(() => {
            this.secondPassed();
        }, 1000);
    }

    secondPassed(): void {
        this.gameSocketRoomService.gameTimerRooms.forEach((gameTimer, accessCode) => {
            if (!gameTimer.isPaused) {
                if (gameTimer.time > 0) {
                    gameTimer.time--;
                    this.signalRoomTimePassed.next(accessCode);
                } else {
                    this.signalRoomTimeOut.next(accessCode);
                }
            }
        });
    }

    pauseTimer(accessCode: number): void {
        const gameTimer = this.gameSocketRoomService.gameTimerRooms.get(accessCode);
        gameTimer.isPaused = true;
    }

    resumeTimer(accessCode: number): void {
        const gameTimer = this.gameSocketRoomService.gameTimerRooms.get(accessCode);
        gameTimer.isPaused = false;
    }
}
