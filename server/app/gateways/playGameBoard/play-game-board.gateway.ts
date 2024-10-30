import { GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
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
        private readonly gameSocketRoomService: GameSocketRoomService,
        private readonly playGameBoardSocketService: PlayGameBoardSocketService,
    ) {}

    @SubscribeMessage('testRoomMessage')
    testRoomMessage(client: Socket, accessCode: number) {
        this.server.to(accessCode.toString()).emit('roomMessage', {
            message: 'Hello from the room!',
        });
    }
}
