import { Injectable, Logger } from '@nestjs/common';

export interface PlayerCharacter {
    name: string;
    socketId: string;
}

export interface GameRoom {
    id: string;
    accessCode: number;
    players: PlayerCharacter[];
    organizer: string;
    isLocked: boolean;
}

@Injectable()
export class GameSocketRoomService {
    private readonly logger = new Logger(GameSocketRoomService.name);
    private rooms: Map<number, GameRoom> = new Map();
    private playerRooms: Map<string, number> = new Map();

    generateAccessCode(): number {
        const MIN_ACCESS_CODE = 1000;
        const MAX_ACCESS_CODE = 9999;
        let accessCode: number;
        do {
            accessCode = Math.floor(MIN_ACCESS_CODE + Math.random() * (MAX_ACCESS_CODE - MIN_ACCESS_CODE + 1));
        } while (this.rooms.has(accessCode));
        return accessCode;
    }

    createGame(gameId: string, playerOrganizer: PlayerCharacter): GameRoom {
        let accessCode: number;
        let isUnique = false;

        while (!isUnique) {
            accessCode = this.generateAccessCode();
            if (!this.rooms.has(accessCode)) {
                isUnique = true;
            }
        }
        const newRoom: GameRoom = {
            id: gameId,
            accessCode,
            players: [playerOrganizer],
            organizer: playerOrganizer.socketId,
            isLocked: false,
        };
        this.rooms.set(accessCode, newRoom);
        this.playerRooms.set(playerOrganizer.socketId, accessCode);
        this.logger.log(`Jeu crée avec ID: ${gameId} et code d'acces: ${accessCode}`);
        return newRoom;
    }

    getRoomByAccessCode(accessCode: number): GameRoom | undefined {
        return this.rooms.get(accessCode);
    }

    getRoomBySocketId(socketId: string): GameRoom | undefined {
        const accessCode = this.playerRooms.get(socketId);
        if (accessCode) {
            return this.rooms.get(accessCode);
        }
        return undefined;
    }

    addPlayerToRoom(accessCode: number, player: PlayerCharacter): boolean {
        const room = this.rooms.get(accessCode);
        if (room && !room.isLocked) {
            room.players.push(player);
            this.playerRooms.set(player.socketId, accessCode);
            this.logger.log(`Joueur ${player.socketId} ajouté au room ${accessCode}`);
            return true;
        }
        return false;
    }

    removePlayerFromRoom(socketId: string): void {
        const accessCode = this.playerRooms.get(socketId);
        if (accessCode) {
            const room = this.rooms.get(accessCode);
            if (room) {
                room.players = room.players.filter((player) => player.socketId !== socketId);
                this.playerRooms.delete(socketId);
                this.logger.log(`Joueur ${socketId} enlevé du room ${accessCode}`);

                if (room.players.length === 0) {
                    this.rooms.delete(accessCode);
                    this.logger.log(`Room ${accessCode} suprimmé car il n'y a plus de joueurs`);
                } else if (room.organizer === socketId) {
                    room.organizer = room.players[0].socketId;
                    this.logger.log(`L'organisateur est parti, le nouveau: ${room.organizer}`);
                }
            }
        }
    }

    lockRoom(accessCode: number, clientId: string): boolean {
        const room = this.rooms.get(accessCode);
        if (room && room.organizer === clientId) {
            room.isLocked = true;
            this.logger.log(`Room ${accessCode} verrouillé par organisateur ${clientId}`);
            return true;
        }
        return false;
    }

    unlockRoom(accessCode: number, clientId: string): boolean {
        const room = this.rooms.get(accessCode);
        if (room && room.organizer === clientId) {
            room.isLocked = false;
            this.logger.log(`Room ${accessCode} déverrouillé par organisateur ${clientId}`);
            return true;
        }
        return false;
    }

    kickPlayer(accessCode: number, playerSocketId: string, clientId: string): boolean {
        const room = this.rooms.get(accessCode);
        if (room && room.organizer === clientId) {
            room.players = room.players.filter((p) => p.socketId !== playerSocketId);
            this.playerRooms.delete(playerSocketId);
            this.logger.log(`Joueur ${playerSocketId} expulsé du room ${accessCode} par organisateur ${clientId}`);

            if (room.players.length === 0) {
                this.rooms.delete(accessCode);
                this.logger.log(`Room ${accessCode} suprimmé car il n'y a plus de joueurs`);
            }

            return true;
        }
        return false;
    }

    handlePlayerDisconnect(socketId: string): void {
        this.removePlayerFromRoom(socketId);
    }
}
