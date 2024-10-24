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
}

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    public rooms: Map<string, GameRoom> = new Map();
    public playerRooms: Map<string, string> = new Map();

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        const roomId = this.playerRooms.get(client.id);
        if (roomId) {
            this.handlePlayerLeave(client, roomId);
        }
    }

    @SubscribeMessage('getRoomState')
    handleGetRoomState(client: Socket, roomId: string) {
        const room = this.rooms.get(roomId);
        if (room) {
            client.join(roomId);
            this.playerRooms.set(client.id, roomId);
            client.emit('roomState', {
                roomId: room.id,
                accessCode: room.accessCode,
                players: room.players,
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
        };

        this.rooms.set(gameId, newRoom);
        this.playerRooms.set(client.id, gameId);

        client.join(gameId);
        this.server.to(gameId).emit('roomState', {
            roomId: gameId,
            accessCode,
            players: newRoom.players,
        });
    }

    @SubscribeMessage('joinGame')
    handleJoinGame(client: Socket, accessCode: number) {
        const room = Array.from(this.rooms.values()).find((room) => room.accessCode === accessCode);

        if (!room) {
            client.emit('joinGameResponse', {
                valid: false,
                message: 'Room not found',
            });
            return;
        }

        client.join(room.id);
        this.playerRooms.set(client.id, room.id);
        client.emit('joinGameResponse', {
            valid: true,
            message: 'Joined successfully',
            roomId: room.id,
            accessCode: room.accessCode,
        });
    }

    @SubscribeMessage('addPlayerToRoom')
    handleAddPlayerToRoom(client: Socket, payload: { gameId: string; player: PlayerCharacter }) {
        const { gameId, player } = payload;
        const room = this.rooms.get(gameId);

        if (!room) return;

        room.players.push(player);
        this.server.to(gameId).emit('roomState', {
            roomId: gameId,
            accessCode: room.accessCode,
            players: room.players,
        });
    }

    @SubscribeMessage('leaveGame')
    handlePlayerLeave(client: Socket, roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        if (room.organizer === client.id) {
            this.server.to(roomId).emit('roomClosed');
            this.rooms.delete(roomId);
            return;
        }

        room.players = room.players.filter((player) => player.socketId !== client.id);

        this.playerRooms.delete(client.id);
        this.server.to(roomId).emit('roomState', {
            roomId: room.id,
            accessCode: room.accessCode,
            players: room.players,
        });
    }

    @SubscribeMessage('lockRoom')
    handleLockRoom(client: Socket, roomId: string) {
        const room = this.rooms.get(roomId);
        if (room && room.organizer === client.id) {
            this.server.to(roomId).emit('roomLocked');
        }
    }

    @SubscribeMessage('unlockRoom')
    handleUnlockRoom(client: Socket, roomId: string) {
        const room = this.rooms.get(roomId);
        if (room && room.organizer === client.id) {
            this.server.to(roomId).emit('roomUnlocked');
        }
    }

    public generateAccessCode(): number {
        return Math.floor(1000 + Math.random() * 9000);
    }
}
