/* eslint-disable @typescript-eslint/member-ordering*/
/* eslint-disable no-restricted-imports */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { GameService } from '@app/services/game-services/game.service';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { PlayerCharacter } from '@common/classes/player-character';
import { SocketEvents } from '@common/enums/gateway-events/socket-events';
import { GameRoom } from '@common/interfaces/game-room';
import { RoomMessage } from '@common/interfaces/roomMessage';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

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
    chatRoom: GameRoom;

    constructor(
        private router: Router,
        private gameService: GameService,
        private chatService: ChatService,
        private eventJournalService: EventJournalService,
    ) {}

    init() {
        this.socket = io(environment.socketIoUrl);
        this.setupSocketListeners();
    }

    createGame(gameId: string, player: PlayerCharacter) {
        this.socket.emit(SocketEvents.CREATE_GAME, { gameId, playerOrganizer: player });
    }

    sendMsgToRoom(roomMessage: RoomMessage): void {
        this.socket.emit('roomMessage', roomMessage);
    }

    sendEventToRoom(event: string, players: string[]): void {
        const time = this.eventJournalService.serverClock;
        const roomID = this.eventJournalService.roomID;
        const content = event;
        this.socket.emit('eventMessage', { time, content, roomID, associatedPlayers: players });
    }

    joinGame(accessCode: number) {
        this.socket.emit(SocketEvents.JOIN_GAME, accessCode);
    }

    addPlayerToRoom(accessCode: number, player: PlayerCharacter) {
        this.socket.emit(SocketEvents.ADD_PLAYER_TO_ROOM, { accessCode, player });
    }

    kickPlayer(player: PlayerCharacter) {
        this.socket.emit(SocketEvents.KICK_PLAYER, player);
    }

    leaveGame() {
        if (this.currentRoom.accessCode) {
            this.socket.emit(SocketEvents.LEAVE_GAME, this.currentRoom.accessCode);
        }
        this.gameService.clearGame();
        this.isLockedSubject.next(false);
    }

    lockRoom() {
        if (this.currentRoom.accessCode) {
            this.socket.emit(SocketEvents.LOCK_ROOM, this.currentRoom.accessCode);
        }
    }

    unlockRoom() {
        if (this.currentRoom.accessCode) {
            this.socket.emit(SocketEvents.UNLOCK_ROOM, this.currentRoom.accessCode);
        }
    }

    startGame() {
        if (this.currentRoom.accessCode) {
            this.socket.emit(SocketEvents.START_GAME, this.currentRoom.accessCode);
        }
    }

    getTotalPlayers(): PlayerCharacter[] {
        return this.playersSubject.value;
    }

    getRoomInfo() {
        return this.currentRoom;
    }

    setupSocketListeners() {
        this.socket.on(SocketEvents.ROOM_STATE, (room: GameRoom) => {
            this.gameService.setAccessCode(room.accessCode);
            this.chatService.setAccessCode(room.accessCode);
            this.playersSubject.next(room.players);
            this.currentRoom = room;
            this.isLockedSubject.next(room.isLocked);
        });

        this.socket.on(
            SocketEvents.JOIN_GAME_RESPONSE,
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
                    this.takenAvatarsSubject.next(response.takenAvatars);
                    this.router.navigate(['/player-create-character'], {
                        queryParams: { roomId: response.accessCode },
                    });
                    if (response.playerName) {
                        this.gameService.updatePlayerName(response.playerName);
                    }
                } else {
                    alert(response.message);
                    this.router.navigate(['join-game']);
                }
            },
        );

        this.socket.on(SocketEvents.JOIN_WAITING_ROOM_SUCCESS, (player: PlayerCharacter) => {
            this.gameService.setCharacter(player);
            this.router.navigate(['/waiting-view']);
        });

        this.socket.on(SocketEvents.AVATAR_TAKEN_ERROR, (data: { message: string }) => {
            this.avatarTakenErrorSubject.next(data.message);
        });

        this.socket.on(SocketEvents.JOIN_GAME_RESPONSE_CODE_INVALID, (response: { message: string }) => {
            alert(response.message);
        });

        this.socket.on(SocketEvents.JOIN_GAME_RESPONSE_LOCKED_ROOM, (response: { message: string }) => {
            alert(response.message);
        });

        this.socket.on(SocketEvents.JOIN_GAME_RESPONSE_NO_MORE_EXISTING, (response: { message: string }) => {
            alert(response.message);
            this.router.navigate(['join-game']);
        });

        this.socket.on(SocketEvents.JOIN_GAME_RESPONSE_LOCKED_AFTER_JOIN, (response: { message: string }) => {
            alert(response.message);
            this.router.navigate(['join-game']);
        });

        this.socket.on(SocketEvents.ROOM_LOCKED, (data: { message: string; isLocked: boolean }) => {
            this.isLockedSubject.next(data.isLocked);
            this.maxPlayersSubject.next(this.maxPlayersSubject.value);
            alert(data.message);
        });

        this.socket.on(SocketEvents.ROOM_UNLOCKED, (data: { message: string; isLocked: boolean }) => {
            this.isLockedSubject.next(data.isLocked);
            alert(data.message);
        });

        this.socket.on(SocketEvents.PLAYER_KICKED, async (data: { message: string; kickedPlayerId: string }) => {
            if (data.kickedPlayerId === this.socket.id) {
                await new Promise((resolve) => {
                    window.alert(data.message);
                    resolve(true);
                });

                if (this.currentRoom.accessCode) {
                    this.socket.emit(SocketEvents.LEAVE_GAME, this.currentRoom.accessCode);
                }
                this.gameService.clearGame();
                this.isLockedSubject.next(false);
                this.playersSubject.next([]);
                this.router.navigate(['/home']).then(() => {
                    alert('Vous avez été expulsé de la salle, redirection en cours...');
                });
            }
        });

        this.socket.on(SocketEvents.PLAYER_LEFT, () => {
            this.gameService.clearGame();
            this.isLockedSubject.next(false);
            this.playersSubject.next([]);
            this.socket.disconnect();
        });

        this.socket.on(SocketEvents.GAME_STARTED, () => {
            this.router.navigate(['/play-page']);
        });

        this.socket.on(SocketEvents.ROOM_CLOSED, () => {
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

        this.socket.on(SocketEvents.ERROR, (message: string) => {
            alert(message);
        });

        this.socket.on(SocketEvents.CLOCK, (serverClock: Date) => {
            this.chatService.serverClock = serverClock;
            this.eventJournalService.serverClock = serverClock;
        });

        this.socket.on('eventReceived', (data: { event: string; associatedPlayers: string[] }) => {
            this.eventJournalService.addEvent(data);
            this.eventJournalService.messageReceivedSubject.next();
            this.socket.on(SocketEvents.MASS_MESSAGE, (broadcastMessage: string) => {
                this.chatService.roomMessages.push(broadcastMessage);
            });
        });

        this.socket.on('roomMessage', (message: string) => {
            this.chatService.roomMessages.push(message);
            this.chatService.messageReceivedSubject.next();
        });

        /*
        this.socket.on(SocketEvents.ORGANIZER_LEFT, () => {
            if (!this.currentRoom.players.find((player) => player.isOrganizer)) {
                this.router.navigate(['/home']);
            }
        });
        */
    }
}
