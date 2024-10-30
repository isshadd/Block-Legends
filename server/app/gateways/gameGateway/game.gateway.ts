import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface PlayerCharacter {
    name: string;
    socketId: string;
}

interface GameRoom {
    id: string;
    accessCode: number;
    players: PlayerCharacter[];
    organizer: string;
    isLocked: boolean;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    rooms: Map<number, GameRoom> = new Map();
    playerRooms: Map<string, number> = new Map();

    @SubscribeMessage('getRoomState')
    handleGetRoomState(client: Socket, accessCode: number) {
        const room = this.rooms.get(accessCode);
        if (room) {
            client.join(accessCode.toString());
            this.playerRooms.set(client.id, accessCode);
            client.emit('roomState', {
                roomId: room.id,
                accessCode: room.accessCode,
                players: room.players,
                isLocked: room.isLocked,
            });
        }
    }

    @SubscribeMessage('createGame')
    handleCreateGame(client: Socket, payload: { gameId: string; playerOrganizer: PlayerCharacter }) {
        const { gameId, playerOrganizer } = payload;
        const accessCode = this.generateAccessCode();

        const newRoom: GameRoom = {
            id: gameId,
            accessCode,
            players: [playerOrganizer],
            organizer: client.id,
            isLocked: false,
        };

        this.rooms.set(accessCode, newRoom);
        this.playerRooms.set(client.id, accessCode);

        client.join(accessCode.toString());
        this.server.to(accessCode.toString()).emit('roomState', {
            roomId: gameId,
            accessCode,
            players: newRoom.players,
            isLocked: newRoom.isLocked,
        });
    }

    @SubscribeMessage('joinGame')
    handleJoinGame(client: Socket, accessCode: number) {
        const room = Array.from(this.rooms.values()).find((r) => r.accessCode === accessCode);

        if (!room) {
            client.emit('joinGameResponse', {
                valid: false,
                message: 'Salle introuvable',
            });
            return;
        }

        if (room.isLocked) {
            client.emit('joinGameResponse', {
                valid: false,
                message: "Cette salle est verrouillée et n'accepte plus de nouveaux joueurs",
            });
            return;
        }

        client.join(room.accessCode.toString());
        this.playerRooms.set(client.id, room.accessCode);
        client.emit('joinGameResponse', {
            valid: true,
            message: 'Rejoint avec succès',
            roomId: room.id,
            accessCode: room.accessCode,
            isLocked: room.isLocked,
        });
    }

    @SubscribeMessage('addPlayerToRoom')
    handleAddPlayerToRoom(client: Socket, payload: { accessCode: number; player: PlayerCharacter }) {
        const { accessCode, player } = payload;
        const room = this.rooms.get(accessCode);

        if (!room) return;

        if (room.isLocked) {
            client.emit('joinGameResponse', {
                valid: false,
                message: "Cette salle est verrouillée et n'accepte plus de nouveaux joueurs",
            });
            return;
        }

        room.players.push(player);
        this.server.to(accessCode.toString()).emit('roomState', {
            roomId: room.id,
            accessCode: room.accessCode,
            players: room.players,
            isLocked: room.isLocked,
        });
    }

    @SubscribeMessage('lockRoom')
    handleLockRoom(client: Socket, accessCode: number) {
        const room = this.rooms.get(accessCode);
        if (room && room.organizer === client.id) {
            room.isLocked = true;
            this.server.to(accessCode.toString()).emit('roomLocked', {
                message: 'La salle est maintenant verrouillée',
                isLocked: true,
            });
            this.server.to(accessCode.toString()).emit('roomState', {
                roomId: room.id,
                accessCode: room.accessCode,
                players: room.players,
                isLocked: room.isLocked,
            });
        }
    }

    @SubscribeMessage('unlockRoom')
    handleUnlockRoom(client: Socket, accessCode: number) {
        const room = this.rooms.get(accessCode);
        if (room && room.organizer === client.id) {
            room.isLocked = false;
            this.server.to(accessCode.toString()).emit('roomUnlocked', {
                message: 'La salle est maintenant déverrouillée',
                isLocked: false,
            });
            this.server.to(accessCode.toString()).emit('roomState', {
                roomId: room.id,
                accessCode: room.accessCode,
                players: room.players,
                isLocked: room.isLocked,
            });
        }
    }

    @SubscribeMessage('kickPlayer')
    handleKickPlayer(client: Socket, player: PlayerCharacter) {
        const roomId = this.playerRooms.get(client.id);
        if (!roomId) return;

        const room = this.rooms.get(roomId);
        if (!room || room.organizer !== client.id) return;

        room.players = room.players.filter((p) => p.socketId !== player.socketId);

        this.server.to(player.socketId).emit('playerKicked', {
            message: 'Vous avez été expulsé de la salle',
        });

        this.server.to(roomId.toString()).emit('roomState', {
            roomId: room.id,
            accessCode: room.accessCode,
            players: room.players,
            isLocked: room.isLocked,
        });

        const playerSocket = this.server.sockets.sockets.get(player.socketId);
        if (playerSocket) {
            playerSocket.leave(roomId.toString());
            this.playerRooms.delete(player.socketId);
        }
    }

    handleConnection(/* client: Socket */) {
        // console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        const roomId = this.playerRooms.get(client.id);
        if (roomId) {
            this.handlePlayerLeave(client, roomId);
        }
    }

    @SubscribeMessage('leaveGame')
    handlePlayerLeave(client: Socket, accessCode: number) {
        const room = this.rooms.get(accessCode);
        if (!room) return;

        if (room.organizer === client.id) {
            this.server.to(accessCode.toString()).emit('roomClosed');
            this.rooms.delete(accessCode);
            return;
        }

        room.players = room.players.filter((player) => player.socketId !== client.id);

        this.playerRooms.delete(client.id);
        this.server.to(accessCode.toString()).emit('roomState', {
            roomId: room.id,
            accessCode: room.accessCode,
            players: room.players,
            isLocked: room.isLocked,
        });
    }

    @SubscribeMessage('startGame')
    handleStartGame(client: Socket, accessCode: number) {
        const room = this.rooms.get(accessCode);
        if (room && room.organizer === client.id) {
            this.server.to(accessCode.toString()).emit('gameStarted');
        }
    }

    generateAccessCode(): number {
        const MIN_ACCESS_CODE = 1000;
        const MAX_ACCESS_CODE = 9999;
        return Math.floor(MIN_ACCESS_CODE + Math.random() * (MAX_ACCESS_CODE - MIN_ACCESS_CODE + 1));
    }
}
