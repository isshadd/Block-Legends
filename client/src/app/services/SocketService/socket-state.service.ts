/* eslint-disable no-restricted-imports */ // Disabling restricted imports is necessary for the import of socket-state.service
import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SocketStateService {
    hasActiveSocket = new BehaviorSubject<boolean>(false);
    hasActiveSocket$ = this.hasActiveSocket.asObservable();
    private activeSocket: WebSocketService | null = null;

    setActiveSocket(socket: WebSocketService) {
        this.activeSocket = socket;
        this.hasActiveSocket.next(true);
    }

    getActiveSocket(): WebSocketService | null {
        return this.activeSocket;
    }

    clearSocket() {
        this.activeSocket = null;
        this.hasActiveSocket.next(false);
    }
}
