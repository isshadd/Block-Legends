import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Subject } from 'rxjs';
import { SocketStateService } from '@app/services/SocketService/socket-state.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { RoomEvent } from '@common/interfaces/RoomEvent';

@Injectable({
    providedIn: 'root',
})
export class EventJournalService {
    socket: WebSocketService | null = null;
    accessCode: number;
    roomID: string;
    serverClock: Date;
    roomEvents: { event: RoomEvent; associatedPlayers: PlayerCharacter[] }[] = [];
    player: PlayerCharacter;
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
        this.player = character;
    }

    setAccessCode(code: number | undefined) {
        if (!code) {
            this.accessCode = 0;
            this.roomID = '';
            return;
        }

        this.accessCode = code;
        this.roomID = this.accessCode.toString();
    }

    broadcastEvent(event: string, playersInvolved: PlayerCharacter[]): void {
        if (this.socket && event.trim()) {
            this.socket.sendEventToRoom(event, playersInvolved);
        }
    }

    addEvent(sentEvent: { event: RoomEvent; associatedPlayers: PlayerCharacter[] }): void {
        this.roomEvents.push(sentEvent);
    }

    clearEvents() {
        this.roomEvents = [];
    }

    getFilteredEvents(): { event: RoomEvent; associatedPlayers: PlayerCharacter[] }[] {
        return this.roomEvents.filter((event) => event.associatedPlayers.includes(this.player));
    }
}
