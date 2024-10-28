import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { GameService } from '@app/services/game-services/game.service';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

export interface GameRoom {
    roomId: string;
    accessCode: number;
    players: PlayerCharacter[];
    isLocked: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    socket: Socket;
    playersSubject = new BehaviorSubject<PlayerCharacter[]>([]);
    players$ = this.playersSubject.asObservable();
    isLockedSubject = new BehaviorSubject<boolean>(false);
    isLocked$ = this.isLockedSubject.asObservable();
    currentRoom: GameRoom;

    constructor(
        private router: Router,
        private gameService: GameService,
    ) {
        this.socket = io(environment.socketIoUrl);
        this.setupSocketListeners();
    }

    createGame(gameId: string, player: PlayerCharacter) {
        this.socket.emit('createGame', { gameId, playerOrganizer: player });
        this.socket.on('roomState', (room: GameRoom) => {
            localStorage.setItem('accessCode', room.accessCode.toString());
            localStorage.setItem('roomId', room.roomId);
            this.isLockedSubject.next(room.isLocked);
        });
    }

    joinGame(accessCode: number) {
        this.socket.emit('joinGame', accessCode);
    }

    addPlayerToRoom(accessCode: number, player: PlayerCharacter) {
        this.socket.emit('addPlayerToRoom', { accessCode, player });
    }

    kickPlayer(player: PlayerCharacter) {
        const accessCode = parseInt(localStorage.getItem('accessCode') as string, 10);
        if (accessCode) {
            this.socket.emit('kickPlayer', player);
        }
    }

    leaveGame() {
        const accessCode = parseInt(localStorage.getItem('accessCode') as string, 10);
        if (accessCode) {
            this.socket.emit('leaveGame', accessCode);
            localStorage.removeItem('roomId');
            localStorage.removeItem('accessCode');
        }
        this.gameService.clearGame();
        this.isLockedSubject.next(false);
    }

    lockRoom() {
        const accessCode = parseInt(localStorage.getItem('accessCode') as string, 10);
        if (accessCode) {
            this.socket.emit('lockRoom', accessCode);
        }
    }

    unlockRoom() {
        const accessCode = parseInt(localStorage.getItem('accessCode') as string, 10);
        if (accessCode) {
            this.socket.emit('unlockRoom', accessCode);
        }
    }

    startGame() {
        const accessCode = parseInt(localStorage.getItem('accessCode') as string, 10);
        if (accessCode) {
            this.socket.emit('startGame', accessCode);
        }
    }

    getRoomInfo() {
        return this.currentRoom;
    }

    private setupSocketListeners() {
        this.socket.on('connect', () => {
            //const roomId = localStorage.getItem('roomId');
            const accessCode = localStorage.getItem('accessCode');
            if (accessCode) {
                this.socket.emit('getRoomState', parseInt(accessCode, 10));
            }
        });

        this.socket.on('roomState', (room: GameRoom) => {
            this.gameService.setAccessCode(room.accessCode);
            this.playersSubject.next(room.players);
            this.currentRoom = room;
            this.isLockedSubject.next(room.isLocked);
        });

        this.socket.on('joinGameResponse', (response: { valid: boolean; message: string; roomId: string; accessCode: number; isLocked: boolean }) => {
            if (response.valid) {
                localStorage.setItem('accessCode', response.accessCode.toString());
                this.gameService.setAccessCode(response.accessCode);
                this.isLockedSubject.next(response.isLocked);
                this.router.navigate(['/player-create-character'], {
                    queryParams: { roomId: response.accessCode },
                });
            } else {
                alert(response.message);
            }
        });

        this.socket.on('roomLocked', (data: { message: string; isLocked: boolean }) => {
            this.isLockedSubject.next(data.isLocked);
            alert(data.message);
        });

        this.socket.on('roomUnlocked', (data: { message: string; isLocked: boolean }) => {
            this.isLockedSubject.next(data.isLocked);
            alert(data.message);
        });

        this.socket.on('playerKicked', (data: { message: string }) => {
            alert(data.message);
            this.leaveGame();
            this.router.navigate(['/home']);
        });

        this.socket.on('gameStarted', () => {
            this.router.navigate(['/play-page']);
        });

        this.socket.on('roomClosed', () => {
            alert("La salle a été fermée par l'organisateur");
            this.leaveGame();
            this.router.navigate(['/home']);
        });
    }
}
