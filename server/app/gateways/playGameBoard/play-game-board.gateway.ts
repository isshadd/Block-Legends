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
    handleInitGameBoard(client: Socket, accessCode: number) {
        const gameBoardParameters: GameBoardParameters = this.gameSocketRoomService.gameBoardRooms.get(accessCode);

        if (gameBoardParameters) {
            client.emit('initGameBoardParameters', gameBoardParameters);
            this.playGameBoardTimeService.setTimerPreparingTurn(accessCode);
            this.updateRoomTime(accessCode);
            this.playGameBoardTimeService.resumeTimer(accessCode);
        } else {
            client.emit('error', { message: 'Room pas trouvé' });
        }
    }

    @SubscribeMessage('userEndTurn')
    handleUserEndTurn(client: Socket, accessCode: number) {
        if (!this.isClientTurn(client, accessCode)) {
            return;
        }
        this.handleTimeOut(accessCode);
    }

    @SubscribeMessage('userStartedMoving')
    handleUserStartedMoving(client: Socket, accessCode: number) {
        if (!this.isClientTurn(client, accessCode)) {
            return;
        }
        this.playGameBoardTimeService.pauseTimer(accessCode);
    }

    @SubscribeMessage('userFinishedMoving')
    handleUserFinishedMoving(client: Socket, accessCode: number) {
        if (!this.isClientTurn(client, accessCode)) {
            return;
        }
        this.playGameBoardTimeService.resumeTimer(accessCode);
    }

    @SubscribeMessage('userMoved')
    handleUserMoved(client: Socket, data: { fromTile: Vec2; toTile: Vec2; accessCode: number }) {
        if (!this.isClientTurn(client, data.accessCode)) {
            return;
        }
        this.server.to(data.accessCode.toString()).emit('roomUserMoved', { playerId: client.id, fromTile: data.fromTile, toTile: data.toTile });
    }

    @SubscribeMessage('userDidDoorAction')
    handleUserDidDoorAction(client: Socket, data: { tileCoordinate: Vec2; accessCode: number }) {
        if (!this.isClientTurn(client, data.accessCode)) {
            return;
        }
        this.server.to(data.accessCode.toString()).emit('roomUserDidDoorAction', data.tileCoordinate);
    }

    @SubscribeMessage('userDidBattleAction')
    handleUserDidBattleAction(client: Socket, data: { enemyPlayerId: string; accessCode: number }) {
        if (!this.isClientTurn(client, data.accessCode)) {
            return;
        }
        this.handleStartBattle(data.accessCode, client.id, data.enemyPlayerId);
        this.server.to(data.accessCode.toString()).emit('roomUserDidBattleAction', { playerId: client.id, enemyPlayerId: data.enemyPlayerId });
    }

    @SubscribeMessage('userAttacked')
    handleUserAttacked(client: Socket, accessCode: number) {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);

        if (!battleRoom) {
            this.logger.error(`Room pas trouvé pour code: ${accessCode}`);
            return;
        }

        const playerIdTurn = this.playGameBoardBattleService.getPlayerBattleTurn(accessCode);
        this.server.to(accessCode.toString()).emit('opponentAttacked', { playerId: playerIdTurn });

        this.endBattleTurn(accessCode);
    }

    @SubscribeMessage('userTriedEscape')
    handleUserTriedEscape(client: Socket, accessCode: number) {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);

        if (!battleRoom) {
            this.logger.error(`Room pas trouvé pour code: ${accessCode}`);
            return;
        }

        const playerIdTurn = this.playGameBoardBattleService.getPlayerBattleTurn(accessCode);
        this.server.to(accessCode.toString()).emit('opponentTriedEscape', { playerId: playerIdTurn });

        if (this.playGameBoardBattleService.userUsedEvade(accessCode, client.id)) {
            this.handleBattleEndedByEscape(accessCode);
            return;
        }

        this.endBattleTurn(accessCode);
    }

    isClientTurn(client: Socket, accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        const gameTimer = this.gameSocketRoomService.gameTimerRooms.get(accessCode);

        if (!room) {
            this.logger.error(`Room pas trouvé pour code: ${accessCode}`);
            return false;
        }

        if (room.currentPlayerTurn !== client.id || gameTimer.state !== GameTimerState.ACTIVE_TURN) {
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
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);

        if (!room) {
            this.logger.error(`Room pas trouvé pour code: ${accessCode}`);
            return;
        }

        this.playGameBoardTimeService.pauseTimer(accessCode);
        this.playGameBoardBattleService.createBattleTimer(accessCode, playerId, enemyPlayerId);

        const playerTurn = this.playGameBoardBattleService.getPlayerBattleTurn(accessCode);
        this.startBattleTurn(accessCode, playerTurn);
    }

    handleBattleSecondPassed(accessCode: number) {
        this.server.to(accessCode.toString()).emit('setTime', this.gameSocketRoomService.gameBattleRooms.get(accessCode).time);
    }

    handleBattleTimeOut(accessCode: number) {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);

        if (!battleRoom) {
            this.logger.error(`Room pas trouvé pour code: ${accessCode}`);
            return;
        }

        const playerIdTurn = this.playGameBoardBattleService.getPlayerBattleTurn(accessCode);
        this.server.to(accessCode.toString()).emit('opponentAttacked', { playerId: playerIdTurn });

        this.server.to(accessCode.toString()).emit('automaticAttack');
    }

    endBattleTurn(accessCode: number) {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);

        if (!battleRoom) {
            this.logger.error(`Room pas trouvé pour code: ${accessCode}`);
            return;
        }

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

    handleEndBattle(accessCode: number) {
        this.playGameBoardBattleService.battleRoomFinished(accessCode);
        this.playGameBoardTimeService.resumeTimer(accessCode);
    }

    handleTimeOut(accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);

        if (!room) {
            this.logger.error(`Room pas trouvé pour code: ${accessCode}`);
            return;
        }

        const gameTimer = this.gameSocketRoomService.gameTimerRooms.get(accessCode);

        switch (gameTimer.state) {
            case GameTimerState.ACTIVE_TURN:
                this.endRoomTurn(accessCode);
                this.playGameBoardSocketService.changeTurn(accessCode);
                this.playGameBoardTimeService.setTimerPreparingTurn(accessCode);
                this.updateRoomTime(accessCode);
                break;

            case GameTimerState.PREPARING_TURN:
                this.startRoomTurn(accessCode, room.currentPlayerTurn);
                this.playGameBoardTimeService.setTimerActiveTurn(accessCode);
                this.updateRoomTime(accessCode);
                break;
        }
    }

    handlePlayerLeftRoom(accessCode: number, socketId: string) {
        const gameBoardRoom = this.gameSocketRoomService.gameBoardRooms.get(accessCode);
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);

        if (gameBoardRoom) {
            if (room.currentPlayerTurn === socketId) {
                switch (this.gameSocketRoomService.gameTimerRooms.get(accessCode).state) {
                    case GameTimerState.ACTIVE_TURN:
                        this.handleTimeOut(accessCode);
                        break;

                    case GameTimerState.PREPARING_TURN:
                        this.playGameBoardSocketService.changeTurn(accessCode);
                }
            }

            gameBoardRoom.spawnPlaces = gameBoardRoom.spawnPlaces.filter(([, id]) => id !== socketId);
            gameBoardRoom.turnOrder = gameBoardRoom.turnOrder.filter((id) => id !== socketId);

            this.server.to(accessCode.toString()).emit('gameBoardPlayerLeft', socketId);
        }
    }
}
