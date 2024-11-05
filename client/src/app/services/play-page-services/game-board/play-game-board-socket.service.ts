import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameBoardParameters, WebSocketService } from '@app/services/SocketService/websocket.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject, takeUntil } from 'rxjs';
import { Socket } from 'socket.io-client';
import { PlayPageMouseHandlerService } from '../play-page-mouse-handler.service';
import { BattleManagerService } from './battle-manager.service';
import { PlayGameBoardManagerService } from './play-game-board-manager.service';

@Injectable({
    providedIn: 'root',
})
export class PlayGameBoardSocketService {
    private destroy$ = new Subject<void>();

    socket: Socket;

    constructor(
        public webSocketService: WebSocketService,
        public playGameBoardManagerService: PlayGameBoardManagerService,
        public playPageMouseHandlerService: PlayPageMouseHandlerService,
        public battleManagerService: BattleManagerService,
        public router: Router,
    ) {
        this.playGameBoardManagerService.signalUserMoved$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.socket.emit('userMoved', { ...data, accessCode: this.webSocketService.getRoomInfo().accessCode });
        });
        this.playGameBoardManagerService.signalUserRespawned$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.socket.emit('userRespawned', { ...data, accessCode: this.webSocketService.getRoomInfo().accessCode });
        });
        this.playGameBoardManagerService.signalUserStartedMoving$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.socket.emit('userStartedMoving', this.webSocketService.getRoomInfo().accessCode);
        });
        this.playGameBoardManagerService.signalUserFinishedMoving$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.socket.emit('userFinishedMoving', this.webSocketService.getRoomInfo().accessCode);
        });
        this.playGameBoardManagerService.signalUserGotTurnEnded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.endTurn();
        });
        this.playGameBoardManagerService.signalUserDidDoorAction$.pipe(takeUntil(this.destroy$)).subscribe((tileCoordinate) => {
            this.socket.emit('userDidDoorAction', { tileCoordinate, accessCode: this.webSocketService.getRoomInfo().accessCode });
        });
        this.playGameBoardManagerService.signalUserDidBattleAction$.pipe(takeUntil(this.destroy$)).subscribe((enemyPlayerId) => {
            this.socket.emit('userDidBattleAction', { enemyPlayerId, accessCode: this.webSocketService.getRoomInfo().accessCode });
        });
        this.playGameBoardManagerService.signalUserWon$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.socket.emit('userWon', this.webSocketService.getRoomInfo().accessCode);
        });

        this.battleManagerService.signalUserAttacked$.pipe(takeUntil(this.destroy$)).subscribe((attackResult: number) => {
            this.socket.emit('userAttacked', { attackResult, accessCode: this.webSocketService.getRoomInfo().accessCode });
        });
        this.battleManagerService.signalUserTriedEscape$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.socket.emit('userTriedEscape', this.webSocketService.getRoomInfo().accessCode);
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    init() {
        this.socket = this.webSocketService.socket;
        this.setupSocketListeners();
        this.initGameBoard(this.webSocketService.getRoomInfo().accessCode);
    }

    initGameBoard(accessCode: number): void {
        this.socket.emit('initGameBoard', accessCode);
    }

    endTurn(): void {
        if (this.playGameBoardManagerService.isUserTurn) {
            this.socket.emit('userEndTurn', this.webSocketService.getRoomInfo().accessCode);
        }
    }

    leaveGame(): void {
        this.socket.disconnect();
        this.router.navigate(['/home']);
    }

    private setupSocketListeners(): void {
        this.socket.on('initGameBoardParameters', (gameBoardParameters: GameBoardParameters) => {
            this.playGameBoardManagerService.init(gameBoardParameters);
        });

        this.socket.on('setTime', (time: number) => {
            this.playGameBoardManagerService.currentTime = time;
        });

        this.socket.on('endTurn', () => {
            if (this.playGameBoardManagerService.isUserTurn) {
                this.playGameBoardManagerService.endTurn();
                this.playPageMouseHandlerService.endTurn();
            }
            this.playGameBoardManagerService.currentPlayerIdTurn = '';
            this.playGameBoardManagerService.isUserTurn = false;
        });

        this.socket.on('startTurn', (playerIdTurn: string) => {
            this.playGameBoardManagerService.currentPlayerIdTurn = playerIdTurn;
            this.playGameBoardManagerService.isUserTurn = playerIdTurn === this.socket.id;
            if (this.playGameBoardManagerService.isUserTurn && !this.playGameBoardManagerService.winnerPlayer) {
                this.playGameBoardManagerService.startTurn();
            }
        });

        this.socket.on('gameBoardPlayerLeft', (playerId: string) => {
            this.playGameBoardManagerService.removePlayerFromMap(playerId);
        });

        this.socket.on('roomUserMoved', (data: { playerId: string; fromTile: Vec2; toTile: Vec2 }) => {
            this.playGameBoardManagerService.movePlayer(data.playerId, data.fromTile, data.toTile);
        });

        this.socket.on('roomUserRespawned', (data: { playerId: string; fromTile: Vec2; toTile: Vec2 }) => {
            this.playGameBoardManagerService.movePlayer(data.playerId, data.fromTile, data.toTile);
            this.playGameBoardManagerService.continueTurn();
        });

        this.socket.on('roomUserDidDoorAction', (tileCoordinate: Vec2) => {
            this.playGameBoardManagerService.toggleDoor(tileCoordinate);
        });

        this.socket.on('roomUserDidBattleAction', (data: { playerId: string; enemyPlayerId: string }) => {
            this.playGameBoardManagerService.startBattle(data.playerId, data.enemyPlayerId);
        });

        this.socket.on('startBattleTurn', (playerIdTurn: string) => {
            this.playGameBoardManagerService.currentPlayerIdTurn = playerIdTurn;
            this.playGameBoardManagerService.isUserTurn = playerIdTurn === this.socket.id;
            this.battleManagerService.currentPlayerIdTurn = playerIdTurn;
            this.battleManagerService.isUserTurn = playerIdTurn === this.socket.id;
        });

        this.socket.on('opponentAttacked', (attackResult: number) => {
            this.battleManagerService.onOpponentAttack(attackResult);
        });

        this.socket.on('opponentTriedEscape', () => {
            this.battleManagerService.onOpponentEscape();
        });

        this.socket.on('automaticAttack', () => {
            this.battleManagerService.onUserAttack();
        });

        this.socket.on('successfulAttack', () => {
            this.battleManagerService.onSuccessfulAttack();
        });

        this.socket.on('battleEndedByEscape', (playerIdTurn: string) => {
            this.playGameBoardManagerService.currentPlayerIdTurn = playerIdTurn;
            this.playGameBoardManagerService.isUserTurn = playerIdTurn === this.socket.id;
            this.battleManagerService.endBattle();
            this.playGameBoardManagerService.continueTurn();
        });

        this.socket.on('firstPlayerWonBattle', (data: { firstPlayer: string; loserPlayer: string }) => {
            this.playGameBoardManagerService.currentPlayerIdTurn = data.firstPlayer;
            this.playGameBoardManagerService.isUserTurn = data.firstPlayer === this.socket.id;
            this.battleManagerService.endBattle();
            this.playGameBoardManagerService.endBattleByDeath(data.firstPlayer, data.loserPlayer);
        });

        this.socket.on('secondPlayerWonBattle', (data: { winnerPlayer: string; loserPlayer: string }) => {
            this.battleManagerService.endBattle();
            this.playGameBoardManagerService.endBattleByDeath(data.winnerPlayer, data.loserPlayer);
        });

        this.socket.on('gameBoardPlayerWon', (playerId: string) => {
            this.playGameBoardManagerService.endGame(playerId);

            setTimeout(() => {
                this.leaveGame();
            }, 5000);
        });

        this.socket.on('lastPlayerStanding', () => {
            alert('Tous les autres joueurs ont quitté la partie. Fin de partie');
            this.leaveGame();
        });
    }
}
