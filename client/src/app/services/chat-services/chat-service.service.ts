/* eslint-disable no-restricted-imports */ // Disabling restricted imports is necessary for the import of ChatService
import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Subject } from 'rxjs';
import { SocketStateService } from '../SocketService/socket-state.service';
import { WebSocketService } from '../SocketService/websocket.service';

const MAX_STRING_LENGTH = 200;

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    socket: WebSocketService | null = null;
    serverClock: Date;
    roomMessages: string[] = [];
    playerName: string;
    accessCode: number;
    roomID: string;

    messageReceivedSubject = new Subject<void>();
    messageReceived$ = this.messageReceivedSubject.asObservable();

    constructor(private socketStateService: SocketStateService) {}

    initialize() {
        this.socket = this.socketStateService.getActiveSocket();

        this.socketStateService.hasActiveSocket$.subscribe((hasSocket) => {
            if (hasSocket) {
                this.socket = this.socketStateService.getActiveSocket();
            } else {
                this.socket = null;
            }
        });
    }

    setCharacter(character: PlayerCharacter) {
        this.playerName = character.name;
    }

    setAccessCode(code: number | undefined) {
        if (!code) {
            this.accessCode = 0;
            this.roomID = '';
            return;
        }

        this.accessCode = code;
        this.roomID = code.toString();
    }

    clearMessages() {
        this.roomMessages = [];
    }

    broadcastMessageToAll(roomMessage: string): void {
        if (roomMessage.length > MAX_STRING_LENGTH) {
            alert('Message cannot exceed 200 characters.');
            return;
        }
        if (this.socket && roomMessage.trim()) {
            const message = { room: this.roomID, time: this.serverClock, sender: this.playerName, content: roomMessage };
            this.socket.sendMsgToRoom(message);
        }
    }
}
