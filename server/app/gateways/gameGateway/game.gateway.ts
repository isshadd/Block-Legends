import { GameSocketRoomService, PlayerCharacter } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(GameGateway.name);

    constructor(private readonly gameSocketRoomService: GameSocketRoomService) {}

    handleConnection(client: Socket) {
        this.logger.log(`Client connecté: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client déconnecté: ${client.id}`);
        this.gameSocketRoomService.handlePlayerDisconnect(client.id);
    }

    updateRoomState(accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        if (room) {
            this.server.to(accessCode.toString()).emit('roomState', {
                roomId: room.id,
                accessCode: room.accessCode,
                players: room.players,
                isLocked: room.isLocked,
            });
        }
    }

    @SubscribeMessage('getRoomState')
    handleGetRoomState(client: Socket, accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        if (room) {
            client.emit('roomState', {
                roomId: room.id,
                accessCode: room.accessCode,
                players: room.players,
                isLocked: room.isLocked,
            });
        } else {
            client.emit('error', { message: 'Room pas trouvé' });
        }
    }

    @SubscribeMessage('createGame')
    handleCreateGame(client: Socket, payload: { gameId: string; playerOrganizer: PlayerCharacter }) {
        const { gameId, playerOrganizer } = payload;
        playerOrganizer.socketId = client.id;
        const newRoom = this.gameSocketRoomService.createGame(gameId, playerOrganizer);

        client.join(newRoom.accessCode.toString());
        this.updateRoomState(newRoom.accessCode);
    }

    @SubscribeMessage('joinGame')
    handleJoinGame(client: Socket, accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);

        if (!room) {
            client.emit('joinGameResponseCodeInvalid', {
                message: 'Code invalide',
            });
            return;
        }

        if (room.isLocked) {
            client.emit('joinGameResponseLockedRoom', {
                message: "Cette salle est verrouillée et n'accepte plus de nouveaux joueurs",
            });
            return;
        }

        client.join(accessCode.toString());
        client.emit('joinGameResponse', {
            valid: true,
            message: 'Rejoint avec succès',
            roomId: room.id,
            accessCode: room.accessCode,
            isLocked: room.isLocked,
        });
        this.updateRoomState(accessCode);
    }

    @SubscribeMessage('addPlayerToRoom')
    handleAddPlayerToRoom(client: Socket, payload: { accessCode: number; player: PlayerCharacter }) {
        const { accessCode, player } = payload;
        player.socketId = client.id;
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);

        if (!room) {
            client.emit('joinGameResponseNoMoreExisting', {
                valid: false,
                message: `La salle n'existe plus`,
            });
            return;
        }

        if (room.isLocked) {
            client.emit('joinGameResponseLockedAfterJoin', {
                valid: false,
                message: 'Cette salle a été verrouillée entre temps',
            });
            return;
        }

        const added = this.gameSocketRoomService.addPlayerToRoom(accessCode, player);
        if (added) {
            client.emit('joinGameResponseCanJoin', {
                valid: true,
                message: 'Rejoint avec succès',
            });
            this.updateRoomState(accessCode);
        } else {
            client.emit('joinGameResponseCanJoin', {
                valid: false,
                message: "Cette salle est verrouillée et n'accepte plus de nouveaux joueurs",
            });
        }
    }

    @SubscribeMessage('lockRoom')
    handleLockRoom(client: Socket, accessCode: number) {
        const locked = this.gameSocketRoomService.lockRoom(accessCode, client.id);
        if (locked) {
            this.server.to(accessCode.toString()).emit('roomLocked', {
                message: 'La salle est maintenant verrouillée',
                isLocked: true,
            });
            this.updateRoomState(accessCode);
        } else {
            client.emit('error', { message: 'Pas authorisé ou room non trouvé' });
        }
    }

    @SubscribeMessage('unlockRoom')
    handleUnlockRoom(client: Socket, accessCode: number) {
        const unlocked = this.gameSocketRoomService.unlockRoom(accessCode, client.id);
        if (unlocked) {
            this.server.to(accessCode.toString()).emit('roomUnlocked', {
                message: 'La salle est maintenant déverrouillée',
                isLocked: false,
            });
            this.updateRoomState(accessCode);
        } else {
            client.emit('error', { message: 'Pas authorisé ou room non trouvé' });
        }
    }

    @SubscribeMessage('kickPlayer')
    handleKickPlayer(client: Socket, player: PlayerCharacter) {
        const accessCode = this.gameSocketRoomService.getRoomBySocketId(client.id)?.accessCode;
        if (!accessCode) return;

        const kicked = this.gameSocketRoomService.kickPlayer(accessCode, player.socketId, client.id);
        if (kicked) {
            this.server.to(player.socketId).emit('playerKicked', {
                message: 'Vous avez été expulsé de la salle',
            });

            this.updateRoomState(accessCode);

            const playerSocket = this.server.sockets.sockets.get(player.socketId);
            if (playerSocket) {
                playerSocket.leave(accessCode.toString());
            }
        } else {
            client.emit('error', { message: 'Pas authorisé ou joueur pas trouvé' });
        }
    }

    @SubscribeMessage('leaveGame')
    handlePlayerLeave(client: Socket, accessCode: number) {
        this.gameSocketRoomService.removePlayerFromRoom(client.id);

        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        if (room) {
            this.updateRoomState(accessCode);
        } else {
            this.server.to(accessCode.toString()).emit('roomClosed');
        }
    }

    @SubscribeMessage('startGame')
    handleStartGame(client: Socket, accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        if (room && room.organizer === client.id) {
            this.server.to(accessCode.toString()).emit('gameStarted');
        } else {
            client.emit('error', { message: 'Pas authorisé ou room non trouvé' });
        }
    }
}
