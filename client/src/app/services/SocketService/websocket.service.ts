import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { GameService } from '@app/services/game-services/game.service';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

interface GameRoom {
    roomId: string;
    accessCode: number;
    players: PlayerCharacter[];
}

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    public socket: Socket;
    public playersSubject = new BehaviorSubject<PlayerCharacter[]>([]);
    players$ = this.playersSubject.asObservable();
    currentRoom: GameRoom;

    constructor(
        private router: Router,
        private gameService: GameService,
    ) {
        this.socket = io('http://localhost:3000');
        this.setupSocketListeners();
    }

    private setupSocketListeners() {
        this.socket.on('connect', () => {
            const roomId = localStorage.getItem('roomId');
            if (roomId) {
                this.socket.emit('getRoomState', roomId);
            }
        });

        this.socket.on('roomState', (room: GameRoom) => {
            console.log('Received room state:', room);
            this.gameService.setAccessCode(room.accessCode);
            this.playersSubject.next(room.players);
            this.currentRoom = room;
        });

        this.socket.on('updatePlayers', (players: PlayerCharacter[]) => {
            console.log('Received players update:', players);
            this.playersSubject.next(players);
        });

        this.socket.on('joinGameResponse', (response: { valid: boolean; message: string; roomId: string; accessCode: number }) => {
            if (response.valid) {
                localStorage.setItem('roomId', response.roomId);
                this.gameService.setAccessCode(response.accessCode);
                this.router.navigate(['/player-create-character'], {
                    queryParams: { roomId: response.roomId },
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

    createGame(gameId: string, player: PlayerCharacter) {
        this.socket.emit('createGame', { gameId, playerOrganizer: player });
        localStorage.setItem('roomId', gameId);
    }

    joinGame(accessCode: number) {
        this.socket.emit('joinGame', accessCode);
    }

    addPlayerToRoom(gameId: string, player: PlayerCharacter) {
        this.socket.emit('addPlayerToRoom', { gameId, player });
    }

    leaveGame() {
        const roomId = localStorage.getItem('roomId');
        if (roomId) {
            this.socket.emit('leaveGame', roomId);
            localStorage.removeItem('roomId');
        }
        this.gameService.clearGame();
    }

    lockRoom() {
        const roomId = localStorage.getItem('roomId');
        if (roomId) {
            this.socket.emit('lockRoom', roomId);
        }
    }

    startGame() {
        const roomId = localStorage.getItem('roomId');
        if (roomId) {
            this.socket.emit('startGame', roomId);
        }
    }

    getRoomInfo() {
        return this.currentRoom;
    }

    unlockRoom() {
        const roomId = localStorage.getItem('roomId');
        if (roomId) {
            this.socket.emit('unlockRoom', roomId);
        }
    }
}
