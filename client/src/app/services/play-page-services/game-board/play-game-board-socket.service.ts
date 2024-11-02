import { Injectable } from '@angular/core';
import { GameBoardParameters, WebSocketService } from '@app/services/SocketService/websocket.service';
import { Socket } from 'socket.io-client';
import { PlayGameBoardManagerService } from './play-game-board-manager.service';

@Injectable({
    providedIn: 'root',
})
export class PlayGameBoardSocketService {
    socket: Socket;

    constructor(
        public webSocketService: WebSocketService,
        public playGameBoardManagerService: PlayGameBoardManagerService,
    ) {}

    init() {
        this.socket = this.webSocketService.socket;
        this.setupSocketListeners();
        this.initGameBoard(this.webSocketService.getRoomInfo().accessCode);
    }

    initGameBoard(accessCode: number) {
        this.socket.emit('initGameBoard', accessCode);
    }

    private setupSocketListeners() {
        this.socket.on('initGameBoardParameters', (gameBoardParameters: GameBoardParameters) => {
            this.playGameBoardManagerService.init(gameBoardParameters);
        });
    }
}
