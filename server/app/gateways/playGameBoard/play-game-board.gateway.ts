import { GameBoardParameters, GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { PlayGameBoardSocketService } from '@app/services/gateway-services/play-game-board-socket/play-game-board-socket.service';
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
        private readonly gameSocketRoomService: GameSocketRoomService,
    ) {
        this.playGameBoardSocketService.signalGameBoardSetupDone$.subscribe((accessCode) => {
            this.onGameBoardSetupDone(accessCode);
        });
    }

    @SubscribeMessage('initGameBoard')
    handleInitGameBoard(client: Socket, accessCode: number) {
        const gameBoardParameters: GameBoardParameters = this.gameSocketRoomService.getGameBoardParameters(accessCode);

        if (gameBoardParameters) {
            client.emit('gameBoardParameters', gameBoardParameters);
        } else {
            client.emit('error', { message: 'Room pas trouvé' });
        }
    }

    startRoomGame(accessCode: number) {
        this.playGameBoardSocketService.initRoomGameBoard(accessCode);
    }

    onGameBoardSetupDone(accessCode: number) {
        this.server.to(accessCode.toString()).emit('gameStarted');
    }
}
