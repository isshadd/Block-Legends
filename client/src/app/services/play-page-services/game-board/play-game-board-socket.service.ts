/* eslint-disable max-params*/ // impossible to instantiate the service without these parameters

import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BattleManagerService } from '@app/services/play-page-services/game-board/battle-manager.service';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { GameStatisticsService } from '@app/services/play-page-services/game-statistics.service';
import { PlayPageMouseHandlerService } from '@app/services/play-page-services/play-page-mouse-handler.service';
import { WebSocketService } from '@app/services/socket-service/websocket-service/websocket.service';
import { WAIT_TIME } from '@common/constants/game_constants';
import { SocketEvents } from '@common/enums/gateway-events/socket-events';
import { ItemType } from '@common/enums/item-type';
import { GameBoardParameters } from '@common/interfaces/game-board-parameters';
import { GameStatistics } from '@common/interfaces/game-statistics';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject, takeUntil } from 'rxjs';
import { Socket } from 'socket.io-client';
import { VirtualPlayerBattleManagerService } from './virtual-player-battle-manager.service';
import { VirtualPlayerManagerService } from './virtual-player-manager.service';

@Injectable({
    providedIn: 'root',
})
export class PlayGameBoardSocketService implements OnDestroy {
    socket: Socket;
    signalPlayerLeft = new Subject<string>();
    signalPlayerLeft$ = this.signalPlayerLeft.asObservable();
    private destroy$ = new Subject<void>();

    constructor(
        public webSocketService: WebSocketService,
        public playGameBoardManagerService: PlayGameBoardManagerService,
        public playPageMouseHandlerService: PlayPageMouseHandlerService,
        public battleManagerService: BattleManagerService,
        public router: Router,
        public virtualPlayerManagerService: VirtualPlayerManagerService,
        public virtualPlayerBattleManagerService: VirtualPlayerBattleManagerService,
        public gameStatisticsService: GameStatisticsService,
    ) {
        this.playGameBoardManagerService.signalUserMoved$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.socket.emit(SocketEvents.USER_MOVED, data);
        });
        this.playGameBoardManagerService.signalUserRespawned$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.socket.emit(SocketEvents.USER_RESPAWNED, data);
        });
        this.playGameBoardManagerService.signalUserStartedMoving$.pipe(takeUntil(this.destroy$)).subscribe((playerTurnId: string) => {
            this.socket.emit(SocketEvents.USER_STARTED_MOVING, playerTurnId);
        });
        this.playGameBoardManagerService.signalUserFinishedMoving$.pipe(takeUntil(this.destroy$)).subscribe((playerTurnId: string) => {
            this.socket.emit(SocketEvents.USER_FINISHED_MOVING, playerTurnId);
        });
        this.playGameBoardManagerService.signalUserGotTurnEnded$.pipe(takeUntil(this.destroy$)).subscribe((playerTurnId: string) => {
            this.endTurn(playerTurnId);
        });
        this.playGameBoardManagerService.signalUserDidDoorAction$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.socket.emit(SocketEvents.USER_DID_DOOR_ACTION, data);
        });
        this.playGameBoardManagerService.signalUserDidBattleAction$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.socket.emit(SocketEvents.USER_DID_BATTLE_ACTION, data);
        });
        this.playGameBoardManagerService.signalUserWon$.pipe(takeUntil(this.destroy$)).subscribe((playerTurnId) => {
            this.socket.emit(SocketEvents.USER_WON, playerTurnId);
        });
        this.playGameBoardManagerService.signalUserGrabbedItem$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.socket.emit(SocketEvents.USER_GRABBED_ITEM, data);
        });
        this.playGameBoardManagerService.signalUserThrewItem$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.socket.emit(SocketEvents.USER_THREW_ITEM, data);
        });

        this.battleManagerService.signalUserAttacked$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.socket.emit(SocketEvents.USER_ATTACKED, data);
        });
        this.battleManagerService.signalUserTriedEscape$.pipe(takeUntil(this.destroy$)).subscribe((playerTurnId) => {
            this.socket.emit(SocketEvents.USER_TRIED_ESCAPE, playerTurnId);
        });

        this.virtualPlayerManagerService.signalMoveVirtualPlayer$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.socket.emit(SocketEvents.VIRTUAL_PLAYER_CHOOSED_DESTINATION, data);
        });
        this.virtualPlayerManagerService.signalVirtualPlayerContinueTurn$.pipe(takeUntil(this.destroy$)).subscribe((playerTurnId) => {
            this.socket.emit(SocketEvents.VIRTUAL_PLAYER_CONTINUE_TURN, playerTurnId);
        });
        this.virtualPlayerManagerService.signalVirtualPlayerEndedTurn$.pipe(takeUntil(this.destroy$)).subscribe((playerTurnId) => {
            this.endTurn(playerTurnId);
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    init() {
        this.socket = this.webSocketService.socket;
        this.setupSocketListeners();
        this.socket.emit(SocketEvents.INIT_GAME_BOARD);
    }

    endTurn(playerTurnId: string): void {
        this.socket.emit(SocketEvents.USER_END_TURN, playerTurnId);
    }

    leaveGame(): void {
        this.webSocketService.resetValues();
        this.battleManagerService.clearBattle();
        this.playGameBoardManagerService.resetManager();
        this.playPageMouseHandlerService.clearUI();
        this.router.navigate(['/home']);
    }

    goToStatisticsPage(): void {
        this.router.navigate(['/statistics-page']);
    }

    private setupSocketListeners(): void {
        this.socket.on(SocketEvents.INIT_GAME_BOARD_PARAMETERS, (gameBoardParameters: GameBoardParameters) => {
            this.playGameBoardManagerService.init(gameBoardParameters);
        });

        this.socket.on(SocketEvents.SET_TIME, (time: number) => {
            this.playGameBoardManagerService.currentTime = time;
        });

        this.socket.on(SocketEvents.END_TURN, () => {
            this.playGameBoardManagerService.endTurn();
            this.playPageMouseHandlerService.endTurn();
            this.playGameBoardManagerService.currentPlayerIdTurn = '';
            this.playGameBoardManagerService.isUserTurn = false;
        });

        this.socket.on(SocketEvents.START_TURN, (playerIdTurn: string) => {
            this.playGameBoardManagerService.currentPlayerIdTurn = playerIdTurn;
            this.playGameBoardManagerService.isUserTurn = playerIdTurn === this.socket.id;
            if (!this.playGameBoardManagerService.winnerPlayer) {
                this.playGameBoardManagerService.startTurn();
            }
        });

        this.socket.on(SocketEvents.START_VIRTUAL_PLAYER_TURN, (playerIdTurn: string) => {
            this.virtualPlayerManagerService.startTurn(playerIdTurn);
        });

        this.socket.on(SocketEvents.CONTINUE_VIRTUAL_PLAYER_TURN, (playerIdTurn: string) => {
            this.virtualPlayerManagerService.continueTurn(playerIdTurn);
        });

        this.socket.on(SocketEvents.GAME_BOARD_PLAYER_LEFT, (playerId: string) => {
            this.playGameBoardManagerService.removePlayerFromMap(playerId);
            this.signalPlayerLeft.next(playerId);
        });

        this.socket.on(SocketEvents.ROOM_USER_MOVED, (data: { playerId: string; fromTile: Vec2; toTile: Vec2; isTeleport: boolean }) => {
            this.playGameBoardManagerService.movePlayer(data.playerId, data.fromTile, data.toTile, data.isTeleport);
        });

        this.socket.on(SocketEvents.VIRTUAL_PLAYER_MOVED, (data: { destination: Vec2; virtualPlayerId: string }) => {
            this.virtualPlayerManagerService.moveVirtualPlayer(data.virtualPlayerId, data.destination);
        });

        this.socket.on(SocketEvents.ROOM_USER_GRABBED_ITEM, (data: { playerId: string; itemType: ItemType; tileCoordinate: Vec2 }) => {
            this.playGameBoardManagerService.grabItem(data.playerId, data.itemType, data.tileCoordinate);
        });

        this.socket.on(SocketEvents.ROOM_USER_THREW_ITEM, (data: { playerId: string; itemType: ItemType; tileCoordinate: Vec2 }) => {
            this.playGameBoardManagerService.throwItem(data.playerId, data.itemType, data.tileCoordinate);
        });

        this.socket.on(SocketEvents.ROOM_USER_RESPAWNED, (data: { playerId: string; fromTile: Vec2; toTile: Vec2 }) => {
            this.playGameBoardManagerService.movePlayer(data.playerId, data.fromTile, data.toTile, false);
            this.playGameBoardManagerService.continueTurn();
        });

        this.socket.on(SocketEvents.ROOM_USER_DID_DOOR_ACTION, (data: { tileCoordinate: Vec2; playerId: string }) => {
            this.playGameBoardManagerService.playerUsedAction(data.playerId);
            this.playGameBoardManagerService.toggleDoor(data.tileCoordinate);
        });

        this.socket.on(SocketEvents.ROOM_USER_DID_BATTLE_ACTION, (data: { playerId: string; enemyPlayerId: string }) => {
            this.playGameBoardManagerService.playerUsedAction(data.playerId);
            this.playGameBoardManagerService.startBattle(data.playerId, data.enemyPlayerId);
        });

        this.socket.on(SocketEvents.START_BATTLE_TURN, (playerIdTurn: string) => {
            this.playGameBoardManagerService.currentPlayerIdTurn = playerIdTurn;
            this.playGameBoardManagerService.isUserTurn = playerIdTurn === this.socket.id;
            this.battleManagerService.currentPlayerIdTurn = playerIdTurn;
            this.battleManagerService.isUserTurn = playerIdTurn === this.socket.id;
        });

        this.socket.on(
            SocketEvents.START_VIRTUAL_PLAYER_BATTLE_TURN,
            (data: {
                playerId: string;
                enemyId: string;
                virtualPlayerRemainingHealth: number;
                enemyRemainingHealth: number;
                virtualPlayerRemainingEvasions: number;
            }) => {
                this.virtualPlayerBattleManagerService.startTurn(
                    data.playerId,
                    data.enemyId,
                    data.virtualPlayerRemainingHealth,
                    data.enemyRemainingHealth,
                    data.virtualPlayerRemainingEvasions,
                );
            },
        );

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
            this.playGameBoardManagerService.areOtherPlayersInBattle = false;
            this.battleManagerService.endBattle();
            this.playGameBoardManagerService.continueTurn();
        });

        this.socket.on(SocketEvents.FIRST_PLAYER_WON_BATTLE, (data: { firstPlayer: string; loserPlayer: string }) => {
            this.playGameBoardManagerService.currentPlayerIdTurn = data.firstPlayer;
            this.playGameBoardManagerService.isUserTurn = data.firstPlayer === this.socket.id;
            this.playGameBoardManagerService.areOtherPlayersInBattle = false;
            this.battleManagerService.endBattle();
            this.playGameBoardManagerService.endBattleByDeath(data.firstPlayer, data.loserPlayer);
        });

        this.socket.on(SocketEvents.SECOND_PLAYER_WON_BATTLE, (data: { winnerPlayer: string; loserPlayer: string }) => {
            this.playGameBoardManagerService.areOtherPlayersInBattle = false;
            this.battleManagerService.endBattle();
            this.playGameBoardManagerService.endBattleByDeath(data.winnerPlayer, data.loserPlayer);
        });

        this.socket.on(SocketEvents.VIRTUAL_PLAYER_WON_BATTLE, (playerId: string) => {
            this.virtualPlayerManagerService.wonBattle(playerId);
        });

        this.socket.on(SocketEvents.VIRTUAL_PLAYER_LOST_BATTLE, (playerId: string) => {
            this.virtualPlayerManagerService.lostBattle(playerId);
        });

        this.socket.on(SocketEvents.GAME_BOARD_PLAYER_WON, (data: { playerTurnId: string; gameStatistics: GameStatistics }) => {
            this.playGameBoardManagerService.endGame(data.playerTurnId);
            this.gameStatisticsService.initGameStatistics(data.gameStatistics);
            this.webSocketService.isGameFinished = true;

            setTimeout(() => {
                this.goToStatisticsPage();
            }, WAIT_TIME);
        });

        this.socket.on(SocketEvents.LAST_PLAYER_STANDING, () => {
            if (!this.playGameBoardManagerService.winnerPlayer) {
                alert('Tous les autres joueurs ont quitté la partie. Fin de partie');
                this.leaveGame();
            }
        });
    }
}
