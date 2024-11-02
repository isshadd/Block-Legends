import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { GameService } from '@app/services/game-services/game.service';
import { GameShared } from '@common/interfaces/game-shared';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

export interface GameRoom {
    roomId: string;
    accessCode: number;
    players: PlayerCharacter[];
    isLocked: boolean;
    maxPlayers: number;
}

export interface GameBoardParameters {
    game: GameShared;
    spawnPlaces: [number, string][];
    turnOrder: string[];
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
    maxPlayersSubject = new BehaviorSubject<number>(0);
    maxPlayers$ = this.maxPlayersSubject.asObservable();
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
                this.maxPlayersSubject.next(response.isLocked ? response.accessCode : this.maxPlayersSubject.value);
                this.router.navigate(['/player-create-character'], {
                    queryParams: { roomId: response.accessCode },
                });
            }
        });

        this.socket.on('joinGameResponseCodeInvalid', (response: { message: string }) => {
            alert(response.message);
        });

        this.socket.on('joinGameResponseLockedRoom', (response: { message: string }) => {
            alert(response.message);
        });

        this.socket.on('joinGameResponseNoMoreExisting', (response: { message: string }) => {
            alert(response.message);
        });

        this.socket.on('joinGameResponseLockedAfterJoin', (response: { message: string }) => {
            alert(response.message);
        });

        this.socket.on('roomLocked', (data: { message: string; isLocked: boolean }) => {
            this.isLockedSubject.next(data.isLocked);
            this.maxPlayersSubject.next(this.maxPlayersSubject.value);
            alert(data.message);
        });

        this.socket.on('roomUnlocked', (data: { message: string; isLocked: boolean }) => {
            this.isLockedSubject.next(data.isLocked);
            alert(data.message);
        });

        this.socket.on('playerKicked', async (data: { message: string; kickedPlayerId: string }) => {
            if (data.kickedPlayerId === this.socket.id) {
                await new Promise((resolve) => {
                    window.alert(data.message);
                    resolve(true);
                });

                // Then perform cleanup
                const accessCode = parseInt(localStorage.getItem('accessCode') as string, 10);
                if (accessCode) {
                    this.socket.emit('leaveGame', accessCode);
                }

                // Clear all local data
                localStorage.removeItem('roomId');
                localStorage.removeItem('accessCode');
                this.gameService.clearGame();
                this.isLockedSubject.next(false);
                this.playersSubject.next([]);

                // Important: Force navigate to home page
                this.router.navigate(['/home']).then(() => {
                    alert('Vous avez été expulsé de la salle');
                });
                // .then(() => {
                //     // Optional: Refresh the page to ensure clean state
                //     window.location.reload();
                // });
            } else {
                // If it's not the current user, just update the players list
                this.socket.emit('getRoomState', parseInt(localStorage.getItem('accessCode') as string, 10));
            }
        });

        this.socket.on('playerLeft', () => {
            localStorage.removeItem('roomId');
            localStorage.removeItem('accessCode');
            this.gameService.clearGame();
            this.isLockedSubject.next(false);
            this.playersSubject.next([]);
            this.socket.disconnect();
        });

        this.socket.on('gameStarted', () => {
            this.router.navigate(['/play-page']);
        });

        this.socket.on('roomClosed', () => {
            alert("La salle a été fermée par l'organisateur");
            this.leaveGame();
            this.router.navigate(['/home']);
        });

        this.socket.on('error', (message: string) => {
            alert(message);
        });
    }
}
