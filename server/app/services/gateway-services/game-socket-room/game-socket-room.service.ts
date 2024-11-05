import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { MapSize } from '@common/enums/map-size';
import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';

export class PlayerAttributes {
    life: number;
    speed: number;
    attack: number;
    defense: number;
}

export interface PlayerCharacter {
    name: string;
    socketId: string;
    attributes: PlayerAttributes;
}

export enum GameTimerState {
    ACTIVE_TURN,
    PREPARING_TURN,
}

export interface GameTimer {
    time: number;
    isPaused: boolean;
    state: GameTimerState;
}

export interface GameBattle {
    time: number;
    firstPlayerId: string;
    secondPlayerId: string;
    isFirstPlayerTurn: boolean;
}

export interface GameBoardParameters {
    game: Game;
    spawnPlaces: [number, string][];
    turnOrder: string[];
}

export interface GameRoom {
    id: string;
    accessCode: number;
    players: PlayerCharacter[];
    organizer: string;
    isLocked: boolean;
    maxPlayers: number;
    currentPlayerTurn: string;
}

@Injectable()
export class GameSocketRoomService {
    private readonly logger = new Logger(GameSocketRoomService.name);
    private rooms: Map<number, GameRoom> = new Map();
    playerRooms: Map<string, number> = new Map();
    gameBoardRooms: Map<number, GameBoardParameters> = new Map();
    gameTimerRooms: Map<number, GameTimer> = new Map();
    gameBattleRooms: Map<number, GameBattle> = new Map();

    signalPlayerLeftRoom = new Subject<{ accessCode: number; playerSocketId: string }>();
    signalPlayerLeftRoom$ = this.signalPlayerLeftRoom.asObservable();

    constructor(private readonly gameService: GameService) {}

    setSpawnCounter(gameSize: MapSize): number {
        const MIN_PLAYERS = 2;
        const MED_PLAYERS = 4;
        const MAX_PLAYERS = 6;
        switch (gameSize) {
            case MapSize.SMALL:
                return MIN_PLAYERS;
            case MapSize.MEDIUM:
                return MED_PLAYERS;
            case MapSize.LARGE:
                return MAX_PLAYERS;
        }
    }

    generateAccessCode(): number {
        const MIN_ACCESS_CODE = 1000;
        const MAX_ACCESS_CODE = 9999;
        let accessCode: number;
        do {
            accessCode = Math.floor(MIN_ACCESS_CODE + Math.random() * (MAX_ACCESS_CODE - MIN_ACCESS_CODE + 1));
        } while (this.rooms.has(accessCode));
        return accessCode;
    }

    initRoomGameBoard(accessCode: number) {
        const room = this.rooms.get(accessCode);

        if (!room) {
            this.logger.error(`Room pas trouve pour code: ${accessCode}`);
            return;
        }

        this.gameService.getGame(room.id).then((game) => {
            this.setupGameBoardRoom(room.accessCode, game);
        });
    }

    setupGameBoardRoom(accessCode: number, game: Game) {
        this.gameBoardRooms.set(accessCode, { game, spawnPlaces: [], turnOrder: [] });
        let room = this.rooms.get(accessCode);
        room.maxPlayers = this.setSpawnCounter(game.size);
        this.rooms.set(accessCode, room);
    }

    setCurrentPlayerTurn(accessCode: number, socketId: string) {
        const room = this.rooms.get(accessCode);
        if (room) {
            room.currentPlayerTurn = socketId;
            this.rooms.set(accessCode, room);
        }
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
            maxPlayers: 0,
            currentPlayerTurn: playerOrganizer.socketId,
        };
        this.rooms.set(accessCode, newRoom);
        this.playerRooms.set(playerOrganizer.socketId, accessCode);
        this.initRoomGameBoard(accessCode);
        this.gameTimerRooms.set(accessCode, { time: 0, isPaused: true, state: GameTimerState.PREPARING_TURN });
        this.logger.log(`
            Jeu crée avec ID: ${gameId},
            code d'acces: ${accessCode},
            nb de joueurs max: ${newRoom.maxPlayers}
            `);
        this.initRoomGameBoard(accessCode);
        this.logger.log(`maxPlayers mis à jour à ${newRoom.maxPlayers} pour la salle ${accessCode}`);
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
                this.signalPlayerLeftRoom.next({ accessCode, playerSocketId: socketId });

                room.players = room.players.filter((player) => player.socketId !== socketId);
                this.playerRooms.delete(socketId);
                this.logger.log(`Joueur ${socketId} enlevé du room ${accessCode}`);

                if (room.players.length === 0) {
                    this.rooms.delete(accessCode);
                    this.gameBoardRooms.delete(accessCode);
                    this.gameTimerRooms.delete(accessCode);
                    this.gameBattleRooms.delete(accessCode);

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
        if (room && room.organizer === clientId && room.players.length < room.maxPlayers) {
            room.isLocked = false;
            this.logger.log(`Room ${accessCode} déverrouillé par organisateur ${clientId}`);
            return true;
        }
        return false;
    }

    kickPlayer(accessCode: number, playerSocketId: string, clientId: string): boolean {
        const room = this.rooms.get(accessCode);
        if (room && room.organizer === clientId) {
            this.removePlayerFromRoom(playerSocketId);
            return true;
        }
        return false;
    }

    handlePlayerDisconnect(socketId: string): void {
        this.removePlayerFromRoom(socketId);
    }
}
