import { Injectable } from '@angular/core';
import { GameBoardParameters, WebSocketService } from '@app/services/SocketService/websocket.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject, takeUntil } from 'rxjs';
import { Socket } from 'socket.io-client';
import { PlayPageMouseHandlerService } from '../play-page-mouse-handler.service';
import { PlayGameBoardManagerService } from './play-game-board-manager.service';

@Injectable({
    providedIn: 'root',
})
export class PlayGameBoardSocketService {
    private destroy$ = new Subject<void>();

    socket: Socket;

    constructor(
        public webSocketService: WebSocketService,
        public playGameBoardManagerService: PlayGameBoardManagerService,
        public playPageMouseHandlerService: PlayPageMouseHandlerService,
    ) {
        this.playGameBoardManagerService.signalUserMoved$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.socket.emit('userMoved', { ...data, accessCode: this.webSocketService.getRoomInfo().accessCode });
        });
        this.playGameBoardManagerService.signalUserStartedMoving$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.socket.emit('userStartedMoving', this.webSocketService.getRoomInfo().accessCode);
        });
        this.playGameBoardManagerService.signalUserFinishedMoving$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.socket.emit('userFinishedMoving', this.webSocketService.getRoomInfo().accessCode);
        });
        this.playGameBoardManagerService.signalUserGotTurnEnded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.endTurn();
        });
        this.playGameBoardManagerService.signalUserDidDoorAction$.pipe(takeUntil(this.destroy$)).subscribe((tileCoordinate) => {
            this.socket.emit('userDidDoorAction', { tileCoordinate, accessCode: this.webSocketService.getRoomInfo().accessCode });
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    init() {
        this.socket = this.webSocketService.socket;
        this.setupSocketListeners();
        this.initGameBoard(this.webSocketService.getRoomInfo().accessCode);
    }

    initGameBoard(accessCode: number): void {
        this.socket.emit('initGameBoard', accessCode);
    }

    endTurn(): void {
        if (this.playGameBoardManagerService.isUserTurn) {
            this.socket.emit('userEndTurn', this.webSocketService.getRoomInfo().accessCode);
        }
    }

    leaveGame(): void {
        this.socket.disconnect();
    }

    private setupSocketListeners(): void {
        this.socket.on('initGameBoardParameters', (gameBoardParameters: GameBoardParameters) => {
            this.playGameBoardManagerService.init(gameBoardParameters);
        });

        this.socket.on('setTime', (time: number) => {
            this.playGameBoardManagerService.currentTime = time;
        });

        this.socket.on('endTurn', () => {
            if (this.playGameBoardManagerService.isUserTurn) {
                this.playGameBoardManagerService.endTurn();
                this.playPageMouseHandlerService.endTurn();
            }
            this.playGameBoardManagerService.currentPlayerIdTurn = '';
            this.playGameBoardManagerService.isUserTurn = false;
        });

        this.socket.on('startTurn', (playerIdTurn: string) => {
            this.playGameBoardManagerService.currentPlayerIdTurn = playerIdTurn;
            this.playGameBoardManagerService.isUserTurn = playerIdTurn === this.socket.id;
            if (this.playGameBoardManagerService.isUserTurn) {
                this.playGameBoardManagerService.startTurn();
            }
        });

        this.socket.on('gameBoardPlayerLeft', (playerId: string) => {
            this.playGameBoardManagerService.removePlayerFromMap(playerId);
        });

        this.socket.on('roomUserMoved', (data: { playerId: string; fromTile: Vec2; toTile: Vec2 }) => {
            this.playGameBoardManagerService.movePlayer(data.playerId, data.fromTile, data.toTile);
        });

        this.socket.on('roomUserDidDoorAction', (tileCoordinate: Vec2) => {
            this.playGameBoardManagerService.toggleDoor(tileCoordinate);
        });
    }
}
