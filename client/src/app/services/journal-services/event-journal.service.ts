/* eslint-disable no-restricted-imports */
import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Subject } from 'rxjs';
import { SocketStateService } from '../SocketService/socket-state.service';
import { WebSocketService } from '../SocketService/websocket.service';
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
                this.socket?.registerPlayer(this.playerName);
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

    getFilteredEvents(): { event: string; associatedPlayers: string[] }[] {
        return this.roomEvents.filter((event) => event.associatedPlayers.includes(this.playerName));
    }
}
