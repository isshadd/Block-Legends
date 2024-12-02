import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from '@common/constants/chat.gateway.constants';
import { ChatEvents } from '@common/enums/gateway-events/chat-events';
import { RoomMessage } from '@common/interfaces/roomMessage';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
//import { RoomEvent } from '@common/interfaces/roomEvent';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { SocketEvents } from '@common/enums/gateway-events/socket-events';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;
    private logger = new Logger(ChatGateway.name);
   //private readonly room: string = PRIVATE_ROOM_ID;

    //private playerSocketIdMap: { [key: string]: string } = {};

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: { time: Date; sender: string; content: string }) {
        this.server.emit(ChatEvents.MassMessage, `${message.time} ${message.sender} : ${message.content}`);
    }

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, message: RoomMessage) {
        if (socket.rooms.has(message.room)) {
            //const sentMessage = `${message.time} ${message.sender} : ${message.content}`;
            this.server.to(message.room).emit(ChatEvents.RoomMessage, message);
        }
    }

    @SubscribeMessage(ChatEvents.EventMessage)
    eventMessage(socket: Socket, payload: { time: Date; content: string; roomID: string; associatedPlayers: PlayerCharacter[] }) {
        const { time, content, roomID, associatedPlayers } = payload;
        const event = { time, content };
        if (content === 'attack' || content === 'fuir') {
            associatedPlayers.forEach(player => {
                const playerSocketId = player.socketId;
                const playerSocket = this.server.sockets.sockets.get(playerSocketId);
                if (playerSocket) {
                    playerSocket.emit(ChatEvents.EventReceived, { event, associatedPlayers });
                }
            });
        }  else {
            if (socket.rooms.has(roomID)) {
                this.server.to(roomID).emit(ChatEvents.EventReceived, { event, associatedPlayers });
            }
        }
    }

    @SubscribeMessage('log')
    logMessage(socket: Socket, message: string) {
        this.logger.log(message);
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
        // for (const playerName in this.playerSocketIdMap) {
        //     if (this.playerSocketIdMap[playerName] === socket.id) {
        //         delete this.playerSocketIdMap[playerName];
        //         break;
        //     }
        // }
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
    }

    // private sendMessageToPlayers(event: RoomEvent, playerNames: string[]): void {
    //     playerNames.forEach((playerName) => {
    //         const playerSocketId = this.playerSocketIdMap[playerName];
    //         if (playerSocketId) {
    //             const playerSocket = this.server.sockets.sockets.get(playerSocketId);
    //             if (playerSocket) {
    //                 playerSocket.emit(ChatEvents.EventReceived, { event, associatedPlayers: playerNames });
    //             }
    //         }
    //     });
    // }

    private emitTime() {
        this.server.emit(ChatEvents.Clock, new Date().toLocaleTimeString());
    }
}
