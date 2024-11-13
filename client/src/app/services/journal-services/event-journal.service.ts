/* eslint-disable no-restricted-imports */
import { Injectable } from '@angular/core';
import { SocketStateService } from '../SocketService/socket-state.service';
import { WebSocketService } from '../SocketService/websocket.service';
import { Subject } from 'rxjs';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
@Injectable({
    providedIn: 'root',
})
export class EventJournalService {
    socket: WebSocketService | null = null;
    accessCode: number;
    roomID: string;
    serverClock: Date;
    roomEvents: { event: string; associatedPlayers: string[] }[] = [];
    playerName: string = '';
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

    setAccessCode(code: number) {
        this.accessCode = code;
        this.roomID = this.accessCode.toString();
    }

    broadcastEvent(event: string, playersInvolved: string[]): void {
        if (this.socket && event.trim()) {
            this.socket.sendEventToRoom(event, playersInvolved);
        }
    }

    addEvent(sentEvent: { event: string; associatedPlayers: string[] }): void {
        this.roomEvents.push(sentEvent);
    }
}
