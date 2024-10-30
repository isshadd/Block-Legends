import { WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class PlayGameBoardGateway {
    server: Server;

    constructor(server: Server) {
        this.server = server;
    }
}
