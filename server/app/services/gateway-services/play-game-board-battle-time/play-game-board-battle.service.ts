import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { GameSocketRoomService } from '../game-socket-room/game-socket-room.service';

@Injectable()
export class PlayGameBoardBattleService {
    readonly ACTIVE_TURN_TIME = 5;

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
        this.gameSocketRoomService.gameBattleRooms.forEach((gameTimer, accessCode) => {
            if (gameTimer.time > 0) {
                gameTimer.time--;
                this.signalRoomTimePassed.next(accessCode);
            } else {
                this.signalRoomTimeOut.next(accessCode);
            }
        });
    }

    createBattleTimer(accessCode: number, firstPlayerId: string, secondPlayerId: string): void {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        if (!room) {
            return;
        }

        const firstPlayer = room.players.find((player) => player.socketId === firstPlayerId);
        const secondPlayer = room.players.find((player) => player.socketId === secondPlayerId);
        if (!firstPlayer || !secondPlayer) {
            return;
        }

        let isFirstPlayerTurn = true;
        if (firstPlayer.attributes.speed < secondPlayer.attributes.speed) {
            isFirstPlayerTurn = false;
        }

        this.gameSocketRoomService.gameBattleRooms.set(accessCode, {
            time: this.ACTIVE_TURN_TIME,
            firstPlayerId: firstPlayerId,
            secondPlayerId: secondPlayerId,
            isFirstPlayerTurn: isFirstPlayerTurn,
        });
    }

    endBattleTurn(accessCode: number): void {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);
        if (!battleRoom) {
            return;
        }

        battleRoom.isFirstPlayerTurn = !battleRoom.isFirstPlayerTurn;
        battleRoom.time = this.ACTIVE_TURN_TIME;
    }

    getPlayerBattleTurn(accessCode: number): string {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);
        if (!battleRoom) {
            return '';
        }

        return battleRoom.isFirstPlayerTurn ? battleRoom.firstPlayerId : battleRoom.secondPlayerId;
    }
}
