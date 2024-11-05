import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID, WORD_MIN_LENGTH } from './chat.gateway.constants';
import { ChatEvents } from '@common/enums/chat-events';
import {RoomMessage} from '@common/interfaces/roomMessage';
import {GameSocketRoomService} from '@app/services/gateway-services/game-socket-room/game-socket-room.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;
    private logger = new Logger(ChatGateway.name);
    private readonly room : string = PRIVATE_ROOM_ID;

    constructor(private gameSocketRoomService: GameSocketRoomService,
    ) {}

    @SubscribeMessage(ChatEvents.Validate)
    validate(socket: Socket, word: string) {
        socket.emit(ChatEvents.WordValidated, word?.length > WORD_MIN_LENGTH);
    }           

    @SubscribeMessage(ChatEvents.ValidateACK)
    validateWithAck(_: Socket, word: string) {
        return { isValid: word?.length > WORD_MIN_LENGTH };
    }

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: {time: Date, sender: string, content: string }) {
        this.server.emit(ChatEvents.MassMessage, `${message.time} ${message.sender} : ${message.content}`);
    }


    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, message : RoomMessage) {
      if (socket.rooms.has(message.room)) {
        const sentMessage = `${message.time} ${message.sender} : ${message.content}`;
        this.server.to(message.room).emit(ChatEvents.RoomMessage, sentMessage);
      } else {
        this.logger.warn(`Socket ${socket.id} attempted to send message to room ${message.room} but is not a member.`);
      }
    }
    
    @SubscribeMessage(ChatEvents.EventMessage)
    eventMessage(socket: Socket, payload: { time: Date; event: string; associatedPlayers: string[] }) {
        this.logger.log(`Event received`);
        const { time, event, associatedPlayers } = payload;
        const sentEvent = `${time} ${event}`;
        this.server.emit(ChatEvents.EventReceived, {sentEvent, associatedPlayers});
    }

    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        // message initial
        socket.emit(ChatEvents.Hello, 'Hello World!');
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
    }

    private emitTime() {
        this.server.emit(ChatEvents.Clock, new Date().toLocaleTimeString());
    }
}