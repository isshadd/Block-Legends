import { ChatEvents } from '@common/enums/chat-events';
import { RoomMessage } from '@common/interfaces/roomMessage';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';


@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;
    private logger = new Logger(ChatGateway.name);
    private readonly room : string = PRIVATE_ROOM_ID;

    constructor() {}


    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: {time: Date, sender: string, content: string }) {
        this.server.emit(ChatEvents.MassMessage, `${message.time} ${message.sender} : ${message.content}`);
    }


    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, message : RoomMessage) {
        this.logger.log(`Message received in room ${message.room}`);
      if (socket.rooms.has(message.room)) {
        const sentMessage = `${message.time} ${message.sender} : ${message.content}`;
        this.server.to(message.room).emit(ChatEvents.RoomMessage, sentMessage);
      } else {
        this.logger.warn(`Socket ${socket.id} attempted to send message to room ${message.room} but is not a member.`);
      }
    }
    
    @SubscribeMessage(ChatEvents.EventMessage)
    eventMessage(socket: Socket, payload: { time: Date; content: string; roomID: string; associatedPlayers: string[] }) {
        this.logger.log(`Event received`);
        const { time, content, roomID , associatedPlayers } = payload;
        if (socket.rooms.has(roomID)) {
            const event = `${time} ${content}`;
            this.server.to(roomID).emit(ChatEvents.EventReceived, {event, associatedPlayers});
          } else {
            this.logger.warn(`Socket ${socket.id} attempted to send message to room ${roomID} but is not a member.`);
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