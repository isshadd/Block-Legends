import { GameBoardParameters, GameSocketRoomService, GameTimerState } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { PlayGameBoardSocketService } from '@app/services/gateway-services/play-game-board-socket/play-game-board-socket.service';
import { PlayGameBoardTimeService } from '@app/services/gateway-services/play-game-board-time/play-game-board-time.service';
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
            this.handleTimePassed(accessCode);
        });
        this.playGameBoardTimeService.signalRoomTimeOut$.subscribe((accessCode) => {
            this.handleTimeOut(accessCode);
        });
    }

    @SubscribeMessage('initGameBoard')
    handleInitGameBoard(client: Socket, accessCode: number) {
        const gameBoardParameters: GameBoardParameters = this.gameSocketRoomService.gameBoardRooms.get(accessCode);

        if (gameBoardParameters) {
            client.emit('initGameBoardParameters', gameBoardParameters);
            this.playGameBoardTimeService.setTimerPreparingTurn(accessCode);
            this.handleTimePassed(accessCode);
            this.playGameBoardTimeService.resumeTimer(accessCode);
        } else {
            client.emit('error', { message: 'Room pas trouvé' });
        }
    }

    startRoomGame(accessCode: number) {
        this.playGameBoardSocketService.initRoomGameBoard(accessCode);
        this.server.to(accessCode.toString()).emit('gameStarted');
    }

    handleTimePassed(accessCode: number) {
        this.server.to(accessCode.toString()).emit('setTime', this.gameSocketRoomService.gameTimerRooms.get(accessCode).time);
    }

    handleTimeOut(accessCode: number) {
        const gameTimer = this.gameSocketRoomService.gameTimerRooms.get(accessCode);

        switch (gameTimer.state) {
            case GameTimerState.ACTIVE_TURN:
                this.playGameBoardTimeService.setTimerPreparingTurn(accessCode);
                this.handleTimePassed(accessCode);
                break;
            case GameTimerState.PREPARING_TURN:
                this.playGameBoardTimeService.setTimerActiveTurn(accessCode);
                this.handleTimePassed(accessCode);
                break;
            case GameTimerState.WAITING_BATTLE:
                break;
        }
    }
}
