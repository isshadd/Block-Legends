import { GameBoardParameters, GameSocketRoomService, GameTimerState } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { PlayGameBoardBattleService } from '@app/services/gateway-services/play-game-board-battle-time/play-game-board-battle.service';
import { PlayGameBoardSocketService } from '@app/services/gateway-services/play-game-board-socket/play-game-board-socket.service';
import { PlayGameBoardTimeService } from '@app/services/gateway-services/play-game-board-time/play-game-board-time.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class PlayGameBoardGateway {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(PlayGameBoardGateway.name);

    constructor(
        private readonly playGameBoardSocketService: PlayGameBoardSocketService,
        private readonly playGameBoardTimeService: PlayGameBoardTimeService,
        private readonly playGameBoardBattleService: PlayGameBoardBattleService,
        private readonly gameSocketRoomService: GameSocketRoomService,
    ) {
        this.playGameBoardTimeService.signalRoomTimePassed$.subscribe((accessCode) => {
            this.updateRoomTime(accessCode);
        });
        this.playGameBoardTimeService.signalRoomTimeOut$.subscribe((accessCode) => {
            this.handleTimeOut(accessCode);
        });
        this.gameSocketRoomService.signalPlayerLeftRoom$.subscribe(({ accessCode, playerSocketId }) => {
            this.handlePlayerLeftRoom(accessCode, playerSocketId);
        });
        this.playGameBoardBattleService.signalRoomTimeOut$.subscribe((accessCode) => {
            this.handleBattleTimeOut(accessCode);
        });
        this.playGameBoardBattleService.signalRoomTimePassed$.subscribe((accessCode) => {
            this.handleBattleSecondPassed(accessCode);
        });
    }

    @SubscribeMessage('initGameBoard')
    handleInitGameBoard(client: Socket) {
        const room = this.gameSocketRoomService.getRoomBySocketId(client.id);
        const gameBoardParameters: GameBoardParameters = this.gameSocketRoomService.gameBoardRooms.get(room.accessCode);

        if (gameBoardParameters) {
            client.emit('initGameBoardParameters', gameBoardParameters);
            this.playGameBoardTimeService.setTimerPreparingTurn(room.accessCode);
            this.updateRoomTime(room.accessCode);
            this.playGameBoardTimeService.resumeTimer(room.accessCode);
        } else {
            client.emit('error', { message: 'Room pas trouvé' });
        }
    }

    @SubscribeMessage('userEndTurn')
    handleUserEndTurn(client: Socket) {
        if (!this.isClientTurn(client)) {
            return;
        }

        const room = this.gameSocketRoomService.getRoomBySocketId(client.id);
        this.handleTimeOut(room.accessCode);
    }

    @SubscribeMessage('userStartedMoving')
    handleUserStartedMoving(client: Socket) {
        if (!this.isClientTurn(client)) {
            return;
        }

        const room = this.gameSocketRoomService.getRoomBySocketId(client.id);
        this.playGameBoardTimeService.pauseTimer(room.accessCode);
    }

    @SubscribeMessage('userFinishedMoving')
    handleUserFinishedMoving(client: Socket) {
        if (!this.isClientTurn(client)) {
            return;
        }

        const room = this.gameSocketRoomService.getRoomBySocketId(client.id);
        this.playGameBoardTimeService.resumeTimer(room.accessCode);
    }

    @SubscribeMessage('userMoved')
    handleUserMoved(client: Socket, data: { fromTile: Vec2; toTile: Vec2 }) {
        if (!this.isClientTurn(client)) {
            return;
        }

        const room = this.gameSocketRoomService.getRoomBySocketId(client.id);
        this.server.to(room.accessCode.toString()).emit('roomUserMoved', { playerId: client.id, fromTile: data.fromTile, toTile: data.toTile });
    }

    @SubscribeMessage('userRespawned')
    handleUserRespawned(client: Socket, data: { fromTile: Vec2; toTile: Vec2 }) {
        const room = this.gameSocketRoomService.getRoomBySocketId(client.id);
        this.server.to(room.accessCode.toString()).emit('roomUserRespawned', { playerId: client.id, fromTile: data.fromTile, toTile: data.toTile });
    }

    @SubscribeMessage('userDidDoorAction')
    handleUserDidDoorAction(client: Socket, tileCoordinate: Vec2) {
        if (!this.isClientTurn(client)) {
            return;
        }

        const room = this.gameSocketRoomService.getRoomBySocketId(client.id);
        this.server.to(room.accessCode.toString()).emit('roomUserDidDoorAction', tileCoordinate);
    }

    @SubscribeMessage('userDidBattleAction')
    handleUserDidBattleAction(client: Socket, enemyPlayerId: string) {
        if (!this.isClientTurn(client)) {
            return;
        }

        const room = this.gameSocketRoomService.getRoomBySocketId(client.id);
        this.handleStartBattle(room.accessCode, client.id, enemyPlayerId);
        this.server.to(room.accessCode.toString()).emit('roomUserDidBattleAction', { playerId: client.id, enemyPlayerId: enemyPlayerId });
    }

    @SubscribeMessage('userAttacked')
    handleUserAttacked(client: Socket, attackResult: number) {
        const room = this.gameSocketRoomService.getRoomBySocketId(client.id);
        this.server.to(room.accessCode.toString()).emit('opponentAttacked', attackResult);

        if (attackResult > 0) {
            const isPlayerDead = this.playGameBoardBattleService.userSuccededAttack(room.accessCode);

            this.server.to(room.accessCode.toString()).emit('successfulAttack');

            if (isPlayerDead) {
                this.handleBattleEndedByDeath(room.accessCode, client.id);
                return;
            }
        }

        this.endBattleTurn(room.accessCode);
    }

    @SubscribeMessage('userTriedEscape')
    handleUserTriedEscape(client: Socket) {
        const room = this.gameSocketRoomService.getRoomBySocketId(client.id);
        this.server.to(room.accessCode.toString()).emit('opponentTriedEscape');

        if (this.playGameBoardBattleService.userUsedEvade(room.accessCode, client.id)) {
            this.handleBattleEndedByEscape(room.accessCode);
            return;
        }

        this.endBattleTurn(room.accessCode);
    }

    @SubscribeMessage('userWon')
    handleUserWon(client: Socket) {
        const room = this.gameSocketRoomService.getRoomBySocketId(client.id);
        this.playGameBoardTimeService.pauseTimer(room.accessCode);
        this.server.to(room.accessCode.toString()).emit('gameBoardPlayerWon', client.id);
    }

    isClientTurn(client: Socket) {
        const room = this.gameSocketRoomService.getRoomBySocketId(client.id);
        const gameTimer = this.gameSocketRoomService.gameTimerRooms.get(room.accessCode);

        if (room.currentPlayerTurn !== client.id || gameTimer.state !== GameTimerState.ActiveTurn) {
            this.logger.error(`Ce n'est pas le tour du joueur: ${client.id}`);
            return false;
        }

        return true;
    }

    startRoomGame(accessCode: number) {
        this.playGameBoardSocketService.initRoomGameBoard(accessCode);
        this.server.to(accessCode.toString()).emit('gameStarted');
    }

    updateRoomTime(accessCode: number) {
        this.server.to(accessCode.toString()).emit('setTime', this.gameSocketRoomService.gameTimerRooms.get(accessCode).time);
    }

    endRoomTurn(accessCode: number) {
        this.server.to(accessCode.toString()).emit('endTurn');
    }

    startRoomTurn(accessCode: number, playerIdTurn: string) {
        this.server.to(accessCode.toString()).emit('startTurn', playerIdTurn);
    }

    startBattleTurn(accessCode: number, playerId: string) {
        this.server.to(accessCode.toString()).emit('startBattleTurn', playerId);
    }

    handleStartBattle(accessCode: number, playerId: string, enemyPlayerId: string) {
        this.playGameBoardTimeService.pauseTimer(accessCode);
        this.playGameBoardBattleService.createBattleTimer(accessCode, playerId, enemyPlayerId);

        const playerTurn = this.playGameBoardBattleService.getPlayerBattleTurn(accessCode);
        this.startBattleTurn(accessCode, playerTurn);
    }

    handleBattleSecondPassed(accessCode: number) {
        this.server.to(accessCode.toString()).emit('setTime', this.gameSocketRoomService.gameBattleRooms.get(accessCode).time);
    }

    handleBattleTimeOut(accessCode: number) {
        this.server.to(accessCode.toString()).emit('automaticAttack');
    }

    endBattleTurn(accessCode: number) {
        this.playGameBoardBattleService.endBattleTurn(accessCode);
        this.handleBattleSecondPassed(accessCode);

        const playerTurn = this.playGameBoardBattleService.getPlayerBattleTurn(accessCode);
        this.startBattleTurn(accessCode, playerTurn);
    }

    handleBattleEndedByEscape(accessCode: number) {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);
        const firstPlayer = battleRoom.firstPlayerId;

        this.handleEndBattle(accessCode);
        this.server.to(accessCode.toString()).emit('battleEndedByEscape', firstPlayer);
    }

    handleBattleEndedByDeath(accessCode: number, winnerPlayer: string) {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);
        const firstPlayer = battleRoom.firstPlayerId;
        const secondPlayer = battleRoom.secondPlayerId;

        this.handleEndBattle(accessCode);
        if (winnerPlayer === firstPlayer) {
            this.server.to(accessCode.toString()).emit('firstPlayerWonBattle', { firstPlayer, loserPlayer: secondPlayer });
        } else {
            this.server.to(accessCode.toString()).emit('secondPlayerWonBattle', { winnerPlayer: secondPlayer, loserPlayer: firstPlayer });
            this.handleTimeOut(accessCode);
        }
    }

    handleEndBattle(accessCode: number) {
        this.playGameBoardBattleService.battleRoomFinished(accessCode);
        this.playGameBoardTimeService.resumeTimer(accessCode);
    }

    handleTimeOut(accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        const gameTimer = this.gameSocketRoomService.gameTimerRooms.get(accessCode);

        switch (gameTimer.state) {
            case GameTimerState.ActiveTurn:
                this.endRoomTurn(accessCode);
                this.playGameBoardSocketService.changeTurn(accessCode);
                this.playGameBoardTimeService.setTimerPreparingTurn(accessCode);
                this.updateRoomTime(accessCode);
                break;

            case GameTimerState.PreparingTurn:
                this.startRoomTurn(accessCode, room.currentPlayerTurn);
                this.playGameBoardTimeService.setTimerActiveTurn(accessCode);
                this.updateRoomTime(accessCode);
                break;
        }
    }

    handlePlayerLeftRoom(accessCode: number, socketId: string) {
        const gameBoardRoom = this.gameSocketRoomService.gameBoardRooms.get(accessCode);
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);

        if (battleRoom) {
            if (battleRoom.firstPlayerId === socketId) {
                this.handleBattleEndedByDeath(accessCode, battleRoom.secondPlayerId);
            } else if (battleRoom.secondPlayerId === socketId) {
                this.handleBattleEndedByDeath(accessCode, battleRoom.firstPlayerId);
            }
        }

        if (gameBoardRoom) {
            if (room.currentPlayerTurn === socketId) {
                switch (this.gameSocketRoomService.gameTimerRooms.get(accessCode).state) {
                    case GameTimerState.ActiveTurn:
                        this.handleTimeOut(accessCode);
                        break;

                    case GameTimerState.PreparingTurn:
                        this.playGameBoardSocketService.changeTurn(accessCode);
                }
            }

            gameBoardRoom.spawnPlaces = gameBoardRoom.spawnPlaces.filter(([, id]) => id !== socketId);
            gameBoardRoom.turnOrder = gameBoardRoom.turnOrder.filter((id) => id !== socketId);

            if (gameBoardRoom.turnOrder.length === 1) {
                this.playGameBoardTimeService.pauseTimer(accessCode);
                this.server.to(accessCode.toString()).emit('lastPlayerStanding');
            } else {
                this.server.to(accessCode.toString()).emit('gameBoardPlayerLeft', socketId);
            }
        }
    }
}
