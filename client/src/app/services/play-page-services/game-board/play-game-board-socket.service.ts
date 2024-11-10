import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BattleManagerService } from '@app/services/play-page-services/game-board/battle-manager.service';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayPageMouseHandlerService } from '@app/services/play-page-services/play-page-mouse-handler.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { SocketEvents } from '@common/enums/gateway-events/socket-events';
import { GameBoardParameters } from '@common/interfaces/game-board-parameters';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject, takeUntil } from 'rxjs';
import { Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class PlayGameBoardSocketService implements OnDestroy {
    socket: Socket;
    private destroy$ = new Subject<void>();

    constructor(
        public webSocketService: WebSocketService,
        public playGameBoardManagerService: PlayGameBoardManagerService,
        public playPageMouseHandlerService: PlayPageMouseHandlerService,
        public battleManagerService: BattleManagerService,
        public router: Router,
    ) {
        this.socket = this.webSocketService.socket;
        this.setupSocketListeners();
        this.playGameBoardManagerService.signalUserMoved$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.socket.emit(SocketEvents.USER_MOVED, { ...data, accessCode: this.webSocketService.getRoomInfo().accessCode });
        });
        this.playGameBoardManagerService.signalUserRespawned$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.socket.emit(SocketEvents.USER_RESPAWNED, { ...data, accessCode: this.webSocketService.getRoomInfo().accessCode });
        });
        this.playGameBoardManagerService.signalUserStartedMoving$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.socket.emit(SocketEvents.USER_STARTED_MOVING, this.webSocketService.getRoomInfo().accessCode);
        });
        this.playGameBoardManagerService.signalUserFinishedMoving$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.socket.emit(SocketEvents.USER_FINISHED_MOVING, this.webSocketService.getRoomInfo().accessCode);
        });
        this.playGameBoardManagerService.signalUserGotTurnEnded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.endTurn();
        });
        this.playGameBoardManagerService.signalUserDidDoorAction$.pipe(takeUntil(this.destroy$)).subscribe((tileCoordinate) => {
            this.socket.emit(SocketEvents.USER_DID_DOOR_ACTION, { tileCoordinate, accessCode: this.webSocketService.getRoomInfo().accessCode });
        });
        this.playGameBoardManagerService.signalUserDidBattleAction$.pipe(takeUntil(this.destroy$)).subscribe((enemyPlayerId) => {
            this.socket.emit(SocketEvents.USER_DID_BATTLE_ACTION, { enemyPlayerId, accessCode: this.webSocketService.getRoomInfo().accessCode });
        });
        this.playGameBoardManagerService.signalUserWon$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.socket.emit(SocketEvents.USER_WON, this.webSocketService.getRoomInfo().accessCode);
        });

        this.battleManagerService.signalUserAttacked$.pipe(takeUntil(this.destroy$)).subscribe((attackResult: number) => {
            this.socket.emit(SocketEvents.USER_ATTACKED, { attackResult, accessCode: this.webSocketService.getRoomInfo().accessCode });
        });
        this.battleManagerService.signalUserTriedEscape$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.socket.emit(SocketEvents.USER_TRIED_ESCAPE, this.webSocketService.getRoomInfo().accessCode);
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    init() {
        this.initGameBoard(this.webSocketService.getRoomInfo().accessCode);
    }

    initGameBoard(accessCode: number): void {
        this.socket.emit(SocketEvents.INIT_GAME_BOARD, accessCode);
    }

    endTurn(): void {
        if (this.playGameBoardManagerService.isUserTurn) {
            this.socket.emit(SocketEvents.USER_END_TURN, this.webSocketService.getRoomInfo().accessCode);
        }
    }

    leaveGame(): void {
        this.socket.disconnect();
        this.battleManagerService.clearBattle();
        this.playGameBoardManagerService.resetManager();
        this.playPageMouseHandlerService.clearUI();
        this.router.navigate(['/home']);
    }

    private setupSocketListeners(): void {
        this.socket.on(SocketEvents.INIT_GAME_BOARD_PARAMETERS, (gameBoardParameters: GameBoardParameters) => {
            this.playGameBoardManagerService.init(gameBoardParameters);
        });

        this.socket.on(SocketEvents.SET_TIME, (time: number) => {
            this.playGameBoardManagerService.currentTime = time;
        });

        this.socket.on(SocketEvents.END_TURN, () => {
            if (this.playGameBoardManagerService.isUserTurn) {
                this.playGameBoardManagerService.endTurn();
                this.playPageMouseHandlerService.endTurn();
            }
            this.playGameBoardManagerService.currentPlayerIdTurn = '';
            this.playGameBoardManagerService.isUserTurn = false;
        });

        this.socket.on(SocketEvents.START_TURN, (playerIdTurn: string) => {
            this.playGameBoardManagerService.currentPlayerIdTurn = playerIdTurn;
            this.playGameBoardManagerService.isUserTurn = playerIdTurn === this.socket.id;
            if (this.playGameBoardManagerService.isUserTurn && !this.playGameBoardManagerService.winnerPlayer) {
                this.playGameBoardManagerService.startTurn();
            }
        });

        this.socket.on(SocketEvents.GAME_BOARD_PLAYER_LEFT, (playerId: string) => {
            this.playGameBoardManagerService.removePlayerFromMap(playerId);
        });

        this.socket.on(SocketEvents.ROOM_USER_MOVED, (data: { playerId: string; fromTile: Vec2; toTile: Vec2 }) => {
            this.playGameBoardManagerService.movePlayer(data.playerId, data.fromTile, data.toTile);
        });

        this.socket.on(SocketEvents.ROOM_USER_RESPAWNED, (data: { playerId: string; fromTile: Vec2; toTile: Vec2 }) => {
            this.playGameBoardManagerService.movePlayer(data.playerId, data.fromTile, data.toTile);
            this.playGameBoardManagerService.continueTurn();
        });

        this.socket.on(SocketEvents.ROOM_USER_DID_DOOR_ACTION, (tileCoordinate: Vec2) => {
            this.playGameBoardManagerService.toggleDoor(tileCoordinate);
        });

        this.socket.on(SocketEvents.ROOM_USER_DID_BATTLE_ACTION, (data: { playerId: string; enemyPlayerId: string }) => {
            this.playGameBoardManagerService.startBattle(data.playerId, data.enemyPlayerId);
        });

        this.socket.on(SocketEvents.START_BATTLE_TURN, (playerIdTurn: string) => {
            this.playGameBoardManagerService.currentPlayerIdTurn = playerIdTurn;
            this.playGameBoardManagerService.isUserTurn = playerIdTurn === this.socket.id;
            this.battleManagerService.currentPlayerIdTurn = playerIdTurn;
            this.battleManagerService.isUserTurn = playerIdTurn === this.socket.id;
        });

        this.socket.on(SocketEvents.OPPONENT_ATTACKED, (attackResult: number) => {
            this.battleManagerService.onOpponentAttack(attackResult);
        });

        this.socket.on(SocketEvents.OPPONENT_TRIED_ESCAPE, () => {
            this.battleManagerService.onOpponentEscape();
        });

        this.socket.on(SocketEvents.AUTOMATIC_ATTACK, () => {
            this.battleManagerService.onUserAttack();
        });

        this.socket.on(SocketEvents.SUCCESSFUL_ATTACK, () => {
            this.battleManagerService.onSuccessfulAttack();
        });

        this.socket.on(SocketEvents.BATTLE_ENDED_BY_ESCAPE, (playerIdTurn: string) => {
            this.playGameBoardManagerService.currentPlayerIdTurn = playerIdTurn;
            this.playGameBoardManagerService.isUserTurn = playerIdTurn === this.socket.id;
            this.battleManagerService.endBattle();
            this.playGameBoardManagerService.continueTurn();
        });

        this.socket.on(SocketEvents.FIRST_PLAYER_WON_BATTLE, (data: { firstPlayer: string; loserPlayer: string }) => {
            this.playGameBoardManagerService.currentPlayerIdTurn = data.firstPlayer;
            this.playGameBoardManagerService.isUserTurn = data.firstPlayer === this.socket.id;
            this.battleManagerService.endBattle();
            this.playGameBoardManagerService.endBattleByDeath(data.firstPlayer, data.loserPlayer);
        });

        this.socket.on(SocketEvents.SECOND_PLAYER_WON_BATTLE, (data: { winnerPlayer: string; loserPlayer: string }) => {
            this.battleManagerService.endBattle();
            this.playGameBoardManagerService.endBattleByDeath(data.winnerPlayer, data.loserPlayer);
        });

        this.socket.on(SocketEvents.GAME_BOARD_PLAYER_WON, (playerId: string) => {
            this.playGameBoardManagerService.endGame(playerId);
            const wait = 5000;
            setTimeout(() => {
                this.leaveGame();
            }, wait);
        });

        this.socket.on(SocketEvents.LAST_PLAYER_STANDING, () => {
            alert('Tous les autres joueurs ont quitté la partie. Fin de partie');
            this.leaveGame();
        });
    }
}
