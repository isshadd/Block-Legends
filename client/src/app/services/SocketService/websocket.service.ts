import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { GameService } from '@app/services/game-services/game.service';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

interface GameRoom {
    roomId: string;
    accessCode: number;
    players: PlayerCharacter[];
}

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    socket: Socket;
    playersSubject = new BehaviorSubject<PlayerCharacter[]>([]);
    players$ = this.playersSubject.asObservable();
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
        });
    }

    joinGame(accessCode: number) {
        this.socket.emit('joinGame', accessCode);
    }

    addPlayerToRoom(accessCode: number, player: PlayerCharacter) {
        this.socket.emit('addPlayerToRoom', { accessCode, player });
    }

    leaveGame() {
        const accessCode = parseInt(localStorage.getItem('accessCode') as string, 10);
        if (accessCode) {
            this.socket.emit('leaveGame', accessCode);
            localStorage.removeItem('roomId');
        }
        this.gameService.clearGame();
    }

    lockRoom() {
        const accessCode = parseInt(localStorage.getItem('accessCode') as string, 10);
        if (accessCode) {
            this.socket.emit('lockRoom', accessCode);
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

    unlockRoom() {
        const accessCode = parseInt(localStorage.getItem('accessCode') as string, 10);
        if (accessCode) {
            this.socket.emit('unlockRoom', accessCode);
        }
    }

    private setupSocketListeners() {
        this.socket.on('connect', () => {
            const roomId = localStorage.getItem('roomId');
            if (roomId) {
                this.socket.emit('getRoomState', roomId);
            }
        });

        this.socket.on('roomState', (room: GameRoom) => {
            // console.log('Received room state:', room);
            this.gameService.setAccessCode(room.accessCode);
            this.playersSubject.next(room.players);
            this.currentRoom = room;
        });

        this.socket.on('updatePlayers', (players: PlayerCharacter[]) => {
            // console.log('Received players update:', players);
            this.playersSubject.next(players);
        });

        this.socket.on('joinGameResponse', (response: { valid: boolean; message: string; roomId: string; accessCode: number }) => {
            if (response.valid) {
                localStorage.setItem('accessCode', response.accessCode.toString());
                this.gameService.setAccessCode(response.accessCode);
                this.router.navigate(['/player-create-character'], {
                    queryParams: { roomId: response.accessCode },
                });
            } else {
                alert("Code d'accès invalide");
            }
        });

        this.socket.on('roomLocked', () => {
            alert('La salle a été verrouillée');
        });

        this.socket.on('roomUnlocked', () => {
            alert('La salle a été déverrouillée');
        });

        this.socket.on('gameStarted', () => {
            this.router.navigate(['/play-page']);
        });
    }
}
