import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

interface Room {
    id: string; // ID de la salle (peut être l'ID du jeu ou un identifiant unique)
    accessCode: number; // Code d'accès de la salle
    players: unknown[]; // Liste des joueurs dans la salle
}

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private players = {};
    private rooms: Room[] = [];

    handleConnection(client: any) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: any) {
        console.log(`Client disconnected: ${client.id}`);
        delete this.players[client.id]; // Supprime le joueur déconnecté
        this.rooms.forEach((room) => {
            room.players = room.players.filter((player) => player !== client.id);
        });
    }

    @SubscribeMessage('joinGame')
    handleJoinGame(client: any, accessCode: number) {
        console.log('Received joinGame request with access code:', accessCode);
        const room = this.rooms.find((room) => room.accessCode === accessCode); // Vérifiez si le code d'accès existe

        if (!room) {
            client.emit('joinGameResponse', { message: 'Room not found or access code invalid.' });
            return;
        }
        client.join(room.id); // Rejoignez la salle
        room.players.push(client.id); // Ajoutez le joueur à la liste des joueurs de la salle
        client.emit('joinGameResponse', { valid: true, message: 'You have joined the room successfully.', roomId: room.id });
        console.log('Current room players:', this.rooms);
    }

    @SubscribeMessage('createGame')
    handleCreateGame(client: any, payload: { gameId: string; accessCode: number; playerOrganizer: unknown }) {
        const { gameId, accessCode, playerOrganizer } = payload;
        console.log('createGame event received:', { gameId, accessCode, playerOrganizer });
        const newRoom: Room = { id: gameId, accessCode: accessCode, players: [playerOrganizer] };
        this.rooms.push(newRoom);
        this.server.emit('updatePlayers', newRoom.players, newRoom.id);
        client.emit('roomCreated', { accessCode });
    }

    @SubscribeMessage('addPlayerToRoom')
    handleAddPlayerToRoom(client: any, payload: [string, unknown]) {
        const [gameId, player] = payload;
        console.log('Received payload:', payload);
        console.log('addPlayerToRoom event received:', { gameId, player });
        const room = this.rooms.find((room) => room.id === gameId);
        if (!room) {
            console.log('Room not found.');
            return;
        }
        room.players.push(player); // Ajoutez le joueur à la salle
        this.server.to(gameId).emit('updatePlayers', room.players, room.id); // Émettez la mise à jour des joueurs
        client.emit('playerAdded', { message: 'Player added successfully.' }); // Émettez un message de confirmation
    }

    @SubscribeMessage('kickPlayer')
    handleKickPlayer(client: any, playerId: string) {
        // Retirer un joueur de la liste
        delete this.players[playerId];
        this.server.emit('updatePlayers', this.players);
    }

    @SubscribeMessage('lockRoom')
    handleLockRoom(client: any) {
        // Implémentez la logique pour verrouiller la salle
    }

    @SubscribeMessage('unlockRoom')
    handleUnlockRoom(client: any) {
        // Implémentez la logique pour déverrouiller la salle
    }
}
