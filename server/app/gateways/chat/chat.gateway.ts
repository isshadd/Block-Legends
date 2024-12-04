import { PlayerCharacter } from '@common/classes/Player/player-character';
import { DELAY_BEFORE_EMITTING_TIME } from '@common/constants/chat.gateway.constants';
import { ChatEvents } from '@common/enums/gateway-events/chat-events';
import { RoomMessage, RoomMessageReceived } from '@common/interfaces/roomMessage';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;
    private logger = new Logger(ChatGateway.name);

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, message: RoomMessage) {
        if (socket.rooms.has(message.room)) {
            const finalMessage: RoomMessageReceived = {
                room: message.room,
                time: message.time,
                sender: message.sender,
                content: message.content,
                senderId: socket.id,
            };
            this.server.to(message.room).emit(ChatEvents.RoomMessage, finalMessage);
        }
    }

    @SubscribeMessage(ChatEvents.EventMessage)
    eventMessage(socket: Socket, payload: { time: Date; content: string; roomID: string; associatedPlayers: PlayerCharacter[] }) {
        const { time, content, roomID, associatedPlayers } = payload;
        const event = { time, content };
        if (content === 'attack' || content === 'fuir') {
            associatedPlayers.forEach((player) => {
                const playerSocketId = player.socketId;
                const playerSocket = this.server.sockets.sockets.get(playerSocketId);
                if (playerSocket) {
                    playerSocket.emit(ChatEvents.EventReceived, { event, associatedPlayers });
                }
            });
        } else {
            if (socket.rooms.has(roomID)) {
                this.server.to(roomID).emit(ChatEvents.EventReceived, { event, associatedPlayers });
            }
        }
    }

    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
    }

    private emitTime() {
        this.server.emit(ChatEvents.Clock, new Date().toLocaleTimeString());
    }
}
