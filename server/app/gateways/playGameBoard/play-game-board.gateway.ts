import { GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/play-game-board', cors: { origin: '*' } })
@Injectable()
export class PlayGameBoardGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(PlayGameBoardGateway.name);

    constructor(private readonly gameSocketRoomService: GameSocketRoomService) {}

    handleConnection(client: Socket) {
        this.logger.log(`Client connected to /game-board: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected from /game-board: ${client.id}`);
        this.gameSocketRoomService.handlePlayerDisconnect(client.id);
    }
}
