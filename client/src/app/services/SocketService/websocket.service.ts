/* eslint-disable @typescript-eslint/member-ordering*/
/* eslint-disable no-restricted-imports */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { GameService } from '@app/services/game-services/game.service';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { ChatEvents } from '@common/enums/gateway-events/chat-events';
import { SocketEvents } from '@common/enums/gateway-events/socket-events';
import { GameRoom } from '@common/interfaces/game-room';
import { RoomMessage, RoomMessageReceived } from '@common/interfaces/roomMessage';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { AvatarService } from '../avatar.service';
// eslint-disable-next-line no-restricted-imports
import { DebugService } from '../debug.service';
import { RoomEvent } from '@common/interfaces/RoomEvent';

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
    takenAvatarsSubject = new BehaviorSubject<string[]>([]);
    takenAvatars$ = this.takenAvatarsSubject.asObservable();
    private avatarTakenErrorSubject = new BehaviorSubject<string>('');
    avatarTakenError$ = this.avatarTakenErrorSubject.asObservable();

    currentRoom: GameRoom;
    isGameFinished = false;
    colorCounter = 0;
    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private gameService: GameService,
        private chatService: ChatService,
        private eventJournalService: EventJournalService,
        private avatarService: AvatarService,
        private debugService: DebugService,
    ) {}

    init() {
        this.socket = io(environment.socketIoUrl);
        this.setupSocketListeners();
        this.chatService.initialize();
        this.eventJournalService.initialize();
        this.isGameFinished = false;
    }

    createGame(gameId: string, player: PlayerCharacter) {
        this.socket.emit(SocketEvents.CREATE_GAME, { gameId, playerOrganizer: player });
    }

    sendMsgToRoom(roomMessage: RoomMessage): void {
        this.socket.emit(ChatEvents.RoomMessage, roomMessage);
    }

    sendEventToRoom(event: string, players: PlayerCharacter[]): void {
        const time = this.eventJournalService.serverClock;
        const roomID = this.eventJournalService.roomID;
        const content = event;
        this.socket.emit(ChatEvents.EventMessage, { time, content, roomID, associatedPlayers: players });
    }

    joinGame(accessCode: number) {
        this.socket.emit(SocketEvents.JOIN_GAME, accessCode);
    }

    

    addPlayerToRoom(accessCode: number, player: PlayerCharacter) {
        this.socket.emit(SocketEvents.ADD_PLAYER_TO_ROOM, { accessCode, player });
    }

    kickPlayer(player: PlayerCharacter) {
        if (player.isVirtual) {
            this.gameService.releaseVirtualPlayerName(player.name);
        }
        this.socket.emit(SocketEvents.KICK_PLAYER, player);
    }

    leaveGame() {
        if (this.currentRoom.accessCode) {
            this.socket.emit(SocketEvents.LEAVE_GAME, this.currentRoom.accessCode);
        }
    }

    resetValues() {
        this.gameService.clearGame();
        this.isLockedSubject.next(false);
        this.playersSubject.next([]);
        this.socket.disconnect();
        this.chatService.clearMessages();
        this.eventJournalService.clearEvents();
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

    debugMode() {
        if (this.currentRoom.accessCode) this.socket.emit(SocketEvents.TOGGLE_DEBUG_MODE, this.currentRoom.accessCode.toString());
    }

    debugModeOff() {
        if (this.currentRoom.accessCode) this.socket.emit(SocketEvents.DEBUG_MODE_OFF, this.currentRoom.accessCode.toString());
    }

    sendLog(message: string) {
        this.socket.emit('log', message);
    }

    // Ajouté par Nihal
    getTotalPlayers(): PlayerCharacter[] {
        let players: PlayerCharacter[] = [];
        this.players$.subscribe((data) => {
            players = data;
        });
        return players;
    }

    getRoomInfo() {
        return this.currentRoom;
    }

    setupSocketListeners() {
        this.socket.on(SocketEvents.ROOM_STATE, (room: GameRoom) => {
            this.gameService.setAccessCode(room.accessCode);
            this.chatService.setAccessCode(room.accessCode);
            this.eventJournalService.setAccessCode(room.accessCode);
            this.playersSubject.next(room.players);
            this.currentRoom = room;
            this.isLockedSubject.next(room.isLocked);

            const takenAvatars = room.players.map((player) => player.avatar.name);
            this.avatarService.updateTakenAvatars(takenAvatars);
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
            if (!player.isVirtual) {
                this.gameService.setCharacter(player);
            }

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
            this.resetValues();
        });

        this.socket.on(SocketEvents.GAME_STARTED, () => {
            this.router.navigate(['/play-page']);
        });

        this.socket.on(SocketEvents.ROOM_CLOSED, () => {
            this.currentRoom.players.forEach((player) => {
                if (!player.isOrganizer && !this.isGameFinished) {
                    this.leaveGame();
                    this.router.navigate(['/home']);
                }
            });
        });


        this.socket.on(SocketEvents.ERROR, (message: string) => {
            alert(message);
        });

        this.socket.on(ChatEvents.Clock, (serverClock: Date) => {
            this.chatService.serverClock = serverClock;
            this.eventJournalService.serverClock = serverClock;
        });

        this.socket.on(ChatEvents.EventReceived, (data: { event: RoomEvent; associatedPlayers: PlayerCharacter[] }) => {
            this.eventJournalService.addEvent(data);
            this.eventJournalService.messageReceivedSubject.next();
        });

        this.socket.on(ChatEvents.RoomMessage, (message: RoomMessageReceived) => {
            this.chatService.roomMessages.push(message);
            this.chatService.messageReceivedSubject.next();
        });

        this.socket.on(SocketEvents.DEBUG_MODE_REC, () => {
            this.debugService.isDebugMode = !this.debugService.isDebugMode;
        });

        this.socket.on(SocketEvents.DEBUG_MODE_OFF_REC, () => {
            this.debugService.isDebugMode = false;
        });

        this.socket.on(SocketEvents.USER_DID_MOVE, () => {
            this.debugService.isPlayerMoving = true;
        });

        this.socket.on(SocketEvents.USER_FINISHED_MOVE, () => {
            this.debugService.isPlayerMoving = false;
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
