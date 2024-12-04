import { Injectable, OnDestroy } from '@angular/core';
import { SocketStateService } from '@app/services/socket-service/socket-state-service/socket-state.service';
import { WebSocketService } from '@app/services/socket-service/websocket-service/websocket.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { MAX_STRING_LENGTH } from '@common/constants/game_constants';
import { RoomMessageReceived } from '@common/interfaces/roomMessage';
import { Subject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatService implements OnDestroy {
    socket: WebSocketService | null = null;
    serverClock: Date;
    roomMessages: RoomMessageReceived[] = [];
    player: PlayerCharacter;
    accessCode: number;
    roomID: string;

    messageReceivedSubject = new Subject<void>();
    messageReceived$ = this.messageReceivedSubject.asObservable();
    private subscriptions: Subscription = new Subscription();

    constructor(public socketStateService: SocketStateService) {}

    initialize() {
        this.socket = this.socketStateService.getActiveSocket();

        this.subscriptions.add(
            this.socketStateService.hasActiveSocket$.subscribe((hasSocket) => {
                this.socket = hasSocket ? this.socketStateService.getActiveSocket() : null;
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    setCharacter(character: PlayerCharacter) {
        this.player = character;
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
            const message = { room: this.roomID, time: this.serverClock, sender: this.player.name, content: roomMessage };
            this.socket.sendMsgToRoom(message);
        }
    }
}
