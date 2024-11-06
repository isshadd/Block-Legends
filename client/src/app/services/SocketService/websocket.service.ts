/* eslint-disable @typescript-eslint/member-ordering*/

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { GameService } from '@app/services/game-services/game.service';
import { GameShared } from '@common/interfaces/game-shared';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { ChatService } from '../chat-service.service';

export interface GameRoom {
    roomId: string;
    accessCode: number;
    players: PlayerCharacter[];
    isLocked: boolean;
    maxPlayers: number;
    currentPlayerTurn: string;
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
    private takenAvatarsSubject = new BehaviorSubject<string[]>([]);
    takenAvatars$ = this.takenAvatarsSubject.asObservable();
    private avatarTakenErrorSubject = new BehaviorSubject<string>('');
    avatarTakenError$ = this.avatarTakenErrorSubject.asObservable();

    currentRoom: GameRoom;

    constructor(
        private chatService: ChatService,
        private router: Router,
        public gameService: GameService,
    ) {}

    init() {
        this.socket = io(environment.socketIoUrl);
        this.setupSocketListeners();
    }

    send<T>(event: string, data?: T, callback?: Function): void {
        this.socket.emit(event, ...[data, callback].filter((x) => x));
    }

    createGame(gameId: string, player: PlayerCharacter) {
        this.socket.emit('createGame', { gameId, playerOrganizer: player });
    }

    joinGame(accessCode: number) {
        this.socket.emit('joinGame', accessCode);
    }

    addPlayerToRoom(accessCode: number, player: PlayerCharacter) {
        this.socket.emit('addPlayerToRoom', { accessCode, player });
    }

    kickPlayer(player: PlayerCharacter) {
        this.socket.emit('kickPlayer', player);
    }

    leaveGame() {
        if (this.currentRoom.accessCode) {
            this.socket.emit('leaveGame', this.currentRoom.accessCode);
        }
        this.gameService.clearGame();
        this.isLockedSubject.next(false);
    }

    lockRoom() {
        if (this.currentRoom.accessCode) {
            this.socket.emit('lockRoom', this.currentRoom.accessCode);
        }
    }

    unlockRoom() {
        if (this.currentRoom.accessCode) {
            this.socket.emit('unlockRoom', this.currentRoom.accessCode);
        }
    }

    startGame() {
        if (this.currentRoom.accessCode) {
            this.socket.emit('startGame', this.currentRoom.accessCode);
        }
    }

    // Ajouté par Nihal
    getTotalPlayers(): PlayerCharacter[] {
        return this.playersSubject.value;
    }

    getRoomInfo() {
        return this.currentRoom;
    }

    setupSocketListeners() {
        this.socket.on('roomState', (room: GameRoom) => {
            this.gameService.setAccessCode(room.accessCode);
            this.playersSubject.next(room.players);
            this.currentRoom = room;
            this.isLockedSubject.next(room.isLocked);
        });

        this.socket.on(
            'joinGameResponse',
            (response: {
                valid: boolean;
                message: string;
                roomId: string;
                accessCode: number;
                isLocked: boolean;
                playerName: string;
                takenAvatars: string[];
            }) => {
                if (response.valid) {
                    this.gameService.setAccessCode(response.accessCode);
                    this.isLockedSubject.next(response.isLocked);
                    this.maxPlayersSubject.next(response.isLocked ? response.accessCode : this.maxPlayersSubject.value);
                    this.takenAvatarsSubject.next(response.takenAvatars); // Update the list of taken avatars
                    this.router.navigate(['/player-create-character'], {
                        queryParams: { roomId: response.accessCode },
                    });
                    if (response.playerName) {
                        this.gameService.updatePlayerName(response.playerName);
                    }
                } else {
                    alert(response.message); // Notify the user that the avatar is already taken
                }
            },
        );

        this.socket.on('avatarTakenError', (data: { message: string }) => {
            this.avatarTakenErrorSubject.next(data.message);
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

                if (this.currentRoom.accessCode) {
                    this.socket.emit('leaveGame', this.currentRoom.accessCode);
                }
                this.gameService.clearGame();
                this.isLockedSubject.next(false);
                this.playersSubject.next([]);
                this.router.navigate(['/home']).then(() => {
                    alert('Vous avez été expulsé de la salle');
                });
            }
        });

        this.socket.on('playerLeft', () => {
            this.gameService.clearGame();
            this.isLockedSubject.next(false);
            this.playersSubject.next([]);
            this.socket.disconnect();
        });

        this.socket.on('gameStarted', () => {
            this.router.navigate(['/play-page']);
        });

        this.socket.on('roomClosed', () => {
            this.currentRoom.players.forEach((player) => {
                if (!player.isOrganizer) {
                    this.leaveGame();
                    this.router.navigate(['/home']);
                }
            });
        });

        // this.socket.on('avatarTakenError', (data) => {
        //     this.avatarTakenErrorSubject.next(data.message);
        // });

        this.socket.on('error', (message: string) => {
            alert(message);
        });

        this.socket.on('clock', (serverClock: Date) => {
            this.chatService.serverClock = serverClock;
        });

        this.socket.on('massMessage', (broadcastMessage: string) => {
            this.chatService.roomMessages.push(broadcastMessage);
        });
    }
}
