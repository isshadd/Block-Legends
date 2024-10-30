import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PlayGameBoardSocketService {
    socket: Socket;

    constructor() {
        this.socket = io(environment.socketIoUrl);
        this.setupSocketListeners();
    }

    private setupSocketListeners() {}
}
