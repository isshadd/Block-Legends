import { GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class PlayGameBoardBattleService {
    readonly activeTurnTime = 5;
    readonly noEvadeActiveTurnTime = 3;
    readonly startingEvadeAttempts = 2;

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
            time: this.activeTurnTime,
            firstPlayerId,
            secondPlayerId,
            isFirstPlayerTurn,
            firstPlayerRemainingEvades: this.startingEvadeAttempts,
            secondPlayerRemainingEvades: this.startingEvadeAttempts,
            firstPlayerRemainingLife: firstPlayer.attributes.life,
            secondPlayerRemainingLife: secondPlayer.attributes.life,
        });
    }

    endBattleTurn(accessCode: number): void {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);
        if (!battleRoom) {
            return;
        }

        battleRoom.isFirstPlayerTurn = !battleRoom.isFirstPlayerTurn;
        battleRoom.time = this.activeTurnTime;

        if (battleRoom.isFirstPlayerTurn && battleRoom.firstPlayerRemainingEvades === 0) {
            battleRoom.time = this.noEvadeActiveTurnTime;
        } else if (!battleRoom.isFirstPlayerTurn && battleRoom.secondPlayerRemainingEvades === 0) {
            battleRoom.time = this.noEvadeActiveTurnTime;
        }
    }

    getPlayerBattleTurn(accessCode: number): string {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);
        if (!battleRoom) {
            return '';
        }

        return battleRoom.isFirstPlayerTurn ? battleRoom.firstPlayerId : battleRoom.secondPlayerId;
    }

    userUsedEvade(accessCode: number, playerId: string): boolean {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);
        if (!battleRoom) {
            return false;
        }

        if (battleRoom.firstPlayerId === playerId) {
            if (battleRoom.firstPlayerRemainingEvades === 0) {
                return false;
            }
            battleRoom.firstPlayerRemainingEvades--;
        } else if (battleRoom.secondPlayerId === playerId) {
            if (battleRoom.secondPlayerRemainingEvades === 0) {
                return false;
            }
            battleRoom.secondPlayerRemainingEvades--;
        } else {
            return false;
        }

        return Math.random() < 0.4;
    }

    userSucceededAttack(accessCode: number, playerHasTotem: boolean): boolean {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);
        if (!battleRoom) {
            return false;
        }

        if (battleRoom.isFirstPlayerTurn) {
            if (playerHasTotem) {
                battleRoom.firstPlayerRemainingLife += 1;
            }
            battleRoom.secondPlayerRemainingLife--;
            if (battleRoom.secondPlayerRemainingLife <= 0) {
                return true;
            }
        } else {
            if (playerHasTotem) {
                battleRoom.secondPlayerRemainingLife += 1;
            }
            battleRoom.firstPlayerRemainingLife--;
            if (battleRoom.firstPlayerRemainingLife <= 0) {
                return true;
            }
        }
    }

    battleRoomFinished(accessCode: number): void {
        this.gameSocketRoomService.gameBattleRooms.delete(accessCode);
    }

    getVirtualPlayerBattleData(
        accessCode: number,
        playerId: string,
    ): { playerId: string; enemyId: string; enemyRemainingHealth: number; virtualPlayerRemainingEvasions: number } {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);
        if (!battleRoom) {
            return { playerId: '', enemyId: '', enemyRemainingHealth: 0, virtualPlayerRemainingEvasions: 0 };
        }

        if (battleRoom.firstPlayerId === playerId) {
            return {
                playerId: battleRoom.firstPlayerId,
                enemyId: battleRoom.secondPlayerId,
                enemyRemainingHealth: battleRoom.secondPlayerRemainingLife,
                virtualPlayerRemainingEvasions: battleRoom.firstPlayerRemainingEvades,
            };
        } else if (battleRoom.secondPlayerId === playerId) {
            return {
                playerId: battleRoom.secondPlayerId,
                enemyId: battleRoom.firstPlayerId,
                enemyRemainingHealth: battleRoom.firstPlayerRemainingLife,
                virtualPlayerRemainingEvasions: battleRoom.secondPlayerRemainingEvades,
            };
        }

        return { playerId: '', enemyId: '', enemyRemainingHealth: 0, virtualPlayerRemainingEvasions: 0 };
    }
}
