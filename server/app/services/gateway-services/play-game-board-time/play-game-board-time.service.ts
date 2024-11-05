import { GameSocketRoomService, GameTimerState } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class PlayGameBoardTimeService {
    readonly preparingTurnTime = 3;
    readonly activeTurnTime = 30;

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

    setTimerPreparingTurn(accessCode: number): void {
        const gameTimer = this.gameSocketRoomService.gameTimerRooms.get(accessCode);
        gameTimer.state = GameTimerState.PreparingTurn;
        gameTimer.time = this.preparingTurnTime;
    }

    setTimerActiveTurn(accessCode: number): void {
        const gameTimer = this.gameSocketRoomService.gameTimerRooms.get(accessCode);
        gameTimer.state = GameTimerState.ActiveTurn;
        gameTimer.time = this.activeTurnTime;
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
