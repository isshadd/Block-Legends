import { Injectable } from '@angular/core';
import { GameShared } from '@common/interfaces/game-shared';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class PlayGameBoardSocketService {
    signalInitGameBoard = new Subject<GameShared>();
    signalInitGameBoard$ = this.signalInitGameBoard.asObservable();

    signalInitCharacters = new Subject<[number, string][]>();
    signalInitCharacters$ = this.signalInitCharacters.asObservable();

    socket: Socket;

    init(socket: Socket) {
        this.socket = socket;
        this.setupSocketListeners();
    }

    initGameBoard(accessCode: number) {
        this.socket.emit('initGameBoard', accessCode);
    }

    private setupSocketListeners() {
        this.socket.on('gameBoardParameters', (gameBoardParameters) => {
            this.signalInitGameBoard.next(gameBoardParameters.game);
            this.signalInitCharacters.next(gameBoardParameters.spawnPlaces);
        });
    }
}
