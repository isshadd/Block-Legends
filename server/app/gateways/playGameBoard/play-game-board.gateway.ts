import { GameBoardParameters, GameSocketRoomService, GameTimerState } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
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
        private readonly gameSocketRoomService: GameSocketRoomService,
    ) {
        this.playGameBoardTimeService.signalRoomTimePassed$.subscribe((accessCode) => {
            this.updateRoomTime(accessCode);
        });
        this.playGameBoardTimeService.signalRoomTimeOut$.subscribe((accessCode) => {
            this.handleTimeOut(accessCode);
        });
        this.gameSocketRoomService.signalPlayerLeftRoom$.subscribe(({ accessCode, playerSocketId }) => {
            this.handlePlayerLeftRoom(playerSocketId);
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

    handlePlayerLeftRoom(socketId: string) {
        const accessCode = this.gameSocketRoomService.playerRooms.get(socketId);

        if (accessCode) {
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
}
