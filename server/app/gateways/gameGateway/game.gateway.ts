import { PlayGameBoardGateway } from '@app/gateways/playGameBoard/play-game-board.gateway';
import { GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { SocketEvents } from '@common/enums/gateway-events/socket-events';
import { Character } from '@common/interfaces/character';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

const NINE = 9;
const ONE = 1;
const THIRTY_SIX = 36;
const TWO = 2;

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly connectedClients = new Set<string>();
    private logger = new Logger(GameGateway.name);

    constructor(
        private readonly gameSocketRoomService: GameSocketRoomService,
        private readonly playGameBoardGateway: PlayGameBoardGateway,
    ) {}

    @SubscribeMessage(SocketEvents.GET_ROOM_STATE) // QU'EST C'EST QUE CA ???
    handleGetRoomState(client: Socket, accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        if (room) {
            client.emit(SocketEvents.ROOM_STATE, {
                roomId: room.id,
                accessCode: room.accessCode,
                players: room.players,
                isLocked: room.isLocked,
                maxPlayers: room.maxPlayers,
            });
        } else {
            client.emit(SocketEvents.ERROR, { message: 'Room pas trouvé' });
        }
    }

    @SubscribeMessage(SocketEvents.CREATE_GAME)
    handleCreateGame(client: Socket, payload: { gameId: string; playerOrganizer: PlayerCharacter }) {
        const { gameId, playerOrganizer } = payload;
        playerOrganizer.socketId = client.id;
        const newRoom = this.gameSocketRoomService.createGame(gameId, playerOrganizer);

        client.join(newRoom.accessCode.toString());
        this.updateRoomState(newRoom.accessCode);
    }

    @SubscribeMessage(SocketEvents.JOIN_GAME)
    handleJoinGame(client: Socket, accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);

        if (!room) {
            client.emit(SocketEvents.JOIN_GAME_RESPONSE_CODE_INVALID, {
                message: 'Code invalide',
            });
            return;
        }

        if (room.isLocked) {
            client.emit(SocketEvents.JOIN_GAME_RESPONSE_LOCKED_ROOM, {
                message: "Cette salle est verrouillée et n'accepte plus de nouveaux joueurs",
            });
            return;
        }

        client.join(accessCode.toString());
        client.emit(SocketEvents.JOIN_GAME_RESPONSE, {
            valid: true,
            message: 'Rejoint avec succès',
            roomId: room.id,
            accessCode: room.accessCode,
            isLocked: room.isLocked,
        });
        this.updateRoomState(accessCode);
    }

    @SubscribeMessage(SocketEvents.ADD_PLAYER_TO_ROOM)
    handleAddPlayerToRoom(client: Socket, payload: { accessCode: number; player: PlayerCharacter }) {
        const { accessCode, player } = payload;
        if (!player.isVirtual) {
            player.socketId = client.id;
        } else {
            player.socketId = `${Math.random().toString(THIRTY_SIX).substr(ONE, NINE)}_${Math.random().toString(THIRTY_SIX).substr(TWO, NINE)}`;
        }
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);

        if (!room) {
            client.emit(SocketEvents.JOIN_GAME_RESPONSE_NO_MORE_EXISTING, {
                valid: false,
                message: "La salle n'existe plus",
            });
            return;
        }

        if (room.isLocked) {
            client.emit(SocketEvents.JOIN_GAME_RESPONSE_LOCKED_AFTER_JOIN, {
                valid: false,
                message: 'Cette salle a été verrouillée entre temps',
            });
            return;
        }

        const added = this.gameSocketRoomService.addPlayerToRoom(accessCode, player);
        if (added) {
            this.updateRoomState(accessCode);
            client.emit(SocketEvents.JOIN_WAITING_ROOM_SUCCESS, player);

            const updatedRoom = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
            if (updatedRoom && updatedRoom.players.length >= updatedRoom.maxPlayers) {
                const locked = this.gameSocketRoomService.lockRoom(accessCode, updatedRoom.organizer);
                if (locked) {
                    this.server.to(accessCode.toString()).emit(SocketEvents.ROOM_LOCKED, {
                        message: 'La salle est verrouillée car le nombre maximal de joueurs a été atteint.',
                        isLocked: true,
                    });
                }
            }
        } else {
            client.emit(SocketEvents.AVATAR_TAKEN_ERROR, {
                message: `Avatar ${player.avatar.name} déjà pris dans la salle ${accessCode}`,
            });
        }
    }

    @SubscribeMessage(SocketEvents.LOCK_ROOM)
    handleLockRoom(client: Socket, accessCode: number) {
        const locked = this.gameSocketRoomService.lockRoom(accessCode, client.id);
        if (locked) {
            this.server.to(accessCode.toString()).emit(SocketEvents.ROOM_LOCKED, {
                message: 'La salle est maintenant verrouillée',
                isLocked: true,
            });
            this.updateRoomState(accessCode);
        } else {
            client.emit('error', { message: 'Pas authorisé ou room non trouvé' });
        }
    }

    @SubscribeMessage(SocketEvents.UNLOCK_ROOM)
    handleUnlockRoom(client: Socket, accessCode: number) {
        const unlocked = this.gameSocketRoomService.unlockRoom(accessCode, client.id);
        if (unlocked) {
            this.server.to(accessCode.toString()).emit(SocketEvents.ROOM_UNLOCKED, {
                message: 'La salle est maintenant déverrouillée',
                isLocked: false,
            });
            this.updateRoomState(accessCode);
        } else {
            client.emit(SocketEvents.ERROR, { message: 'Pas authorisé ou room non trouvé' });
        }
    }

    @SubscribeMessage(SocketEvents.LEAVE_GAME)
    handlePlayerLeave(client: Socket, accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        const isOrganizer = room?.organizer === client.id;

        this.gameSocketRoomService.removePlayerFromRoom(client.id);

        if (isOrganizer) {
            this.server.to(accessCode.toString()).emit(SocketEvents.ORGANIZER_LEFT, {
                message: "L'organisateur a quitté la partie",
            });
            return;
        } else {
            client.emit(SocketEvents.PLAYER_LEFT);
        }

        const updatedRoom = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        if (updatedRoom) {
            this.updateRoomState(accessCode);
            if (updatedRoom.isLocked && updatedRoom.players.length < updatedRoom.maxPlayers) {
                const unlocked = this.gameSocketRoomService.unlockRoom(accessCode, updatedRoom.organizer);
                if (unlocked) {
                    this.server.to(accessCode.toString()).emit(SocketEvents.ROOM_UNLOCKED, {
                        message: 'La salle a été déverrouillée car le nombre de joueurs est en dessous du maximum.',
                        isLocked: false,
                    });
                }
            }
        } else {
            this.server.to(accessCode.toString()).emit(SocketEvents.ROOM_CLOSED);
        }
    }

    @SubscribeMessage(SocketEvents.START_GAME)
    handleStartGame(client: Socket, accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        if (room && room.organizer === client.id) {
            this.playGameBoardGateway.startRoomGame(accessCode);
        } else {
            client.emit(SocketEvents.ERROR, { message: 'Pas authorisé ou room non trouvé' });
        }
    }

    @SubscribeMessage(SocketEvents.KICK_PLAYER)
    handleKickPlayer(client: Socket, player: Character) {
        const accessCode = this.gameSocketRoomService.getRoomBySocketId(client.id)?.accessCode;
        if (!accessCode) return;

        const kicked = this.gameSocketRoomService.kickPlayer(accessCode, player.socketId, client.id);
        if (kicked) {
            this.server.to(accessCode.toString()).emit(SocketEvents.PLAYER_KICKED, {
                message: 'Vous avez été expulsé de la salle',
                kickedPlayerId: player.socketId,
            });

            const playerSocket = this.server.sockets.sockets.get(player.socketId);
            if (playerSocket) {
                playerSocket.leave(accessCode.toString());
            }

            this.updateRoomState(accessCode);
            const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
            if (room && room.isLocked && room.players.length < room.maxPlayers) {
                const unlocked = this.gameSocketRoomService.unlockRoom(accessCode, room.organizer);
                if (unlocked) {
                    this.server.to(accessCode.toString()).emit(SocketEvents.ROOM_UNLOCKED, {
                        message: 'La salle a été déverrouillée car le nombre de joueurs est en dessous du maximum.',
                        isLocked: false,
                    });
                }
            }
        } else {
            client.emit(SocketEvents.ERROR, { message: 'Pas authorisé ou joueur pas trouvé' });
        }
    }

    @SubscribeMessage(SocketEvents.GET_ROOM_PARAMETERS)
    sendGameParameters(accessCode: number) {
        const gameBoardParameters = this.gameSocketRoomService.gameBoardRooms.get(accessCode);

        if (!gameBoardParameters) {
            this.server.to(accessCode.toString()).emit(SocketEvents.ERROR, { message: 'Room pas trouvé' });
            return;
        }

        this.server.to(accessCode.toString()).emit(SocketEvents.GAME_PARAMETERS, { gameBoardParameters });
    }

    @SubscribeMessage(SocketEvents.TOGGLE_DEBUG_MODE)
    toggleDebugMode(socket: Socket, roomID: string) {
        if (socket.rooms.has(roomID)) {
            this.server.to(roomID).emit(SocketEvents.DEBUG_MODE_REC);
        }
    }

    @SubscribeMessage(SocketEvents.DEBUG_MODE_OFF)
    turnOffDebugMode(socket: Socket, roomID: string) {
        if (socket.rooms.has(roomID)) {
            this.server.to(roomID).emit(SocketEvents.DEBUG_MODE_OFF_REC);
        }
    }

    handleConnection(client: Socket) {
        this.connectedClients.add(client.id);
        this.server.emit(SocketEvents.CLIENT_CONNECTED, { clientId: client.id });
    }

    handleDisconnect(client: Socket) {
        this.connectedClients.delete(client.id);
        this.server.emit(SocketEvents.CLIENT_DISCONNECTED, { clientId: client.id });
        this.gameSocketRoomService.handlePlayerDisconnect(client.id);
    }

    updateRoomState(accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        if (room) {
            this.server.to(accessCode.toString()).emit(SocketEvents.ROOM_STATE, {
                roomId: room.id,
                accessCode: room.accessCode,
                players: room.players,
                isLocked: room.isLocked,
            });
        }
    }
}
