import { Injectable } from '@angular/core';
import { GameShared } from '@common/interfaces/game-shared';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

export interface GameBoardParameters {
    game: GameShared;
    spawnPlaces: [number, string][];
}

@Injectable({
    providedIn: 'root',
})
export class PlayGameBoardSocketService {
    signalInitGameBoard = new Subject<GameShared>();
    signalInitGameBoard$ = this.signalInitGameBoard.asObservable();

    signalInitCharacters = new Subject<[number, string][]>();
    signalInitCharacters$ = this.signalInitCharacters.asObservable();

    socket: Socket;

    constructor() {
        this.socket = io(environment.socketIoUrl);
        this.setupSocketListeners();
    }

    initGameBoard(accessCode: number) {
        this.socket.emit('initGameBoard', accessCode);
    }

    private setupSocketListeners() {
        this.socket.on('gameBoardParameters', (gameBoardParameters) => {
            console.log(gameBoardParameters);
            this.signalInitGameBoard.next(gameBoardParameters.game);
            this.signalInitCharacters.next(gameBoardParameters.spawnPlaces);
        });
    }
}
