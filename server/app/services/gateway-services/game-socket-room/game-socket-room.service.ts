import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { MAX_ACCESS_CODE, MAX_PLAYERS, MED_PLAYERS, MIN_ACCESS_CODE, MIN_PLAYERS } from '@common/constants/game_constants';
import { GameTimerState } from '@common/enums/game.timer.state';
import { MapSize } from '@common/enums/map-size';
import { GameBoardParameters } from '@common/interfaces/game-board-parameters';
import { GameRoom } from '@common/interfaces/game-room';
import { GameStatistics } from '@common/interfaces/game-statistics';
import { GameBattle } from '@common/interfaces/game.battle';
import { GameTimer } from '@common/interfaces/game.timer';
import { Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Subject } from 'rxjs';
import { Server } from 'socket.io';

@Injectable()
export class GameSocketRoomService {
    @WebSocketServer() server: Server;
    rooms: Map<number, GameRoom> = new Map();
    signalPlayerLeftRoom = new Subject<{ accessCode: number; playerSocketId: string }>();
    signalPlayerLeftRoom$ = this.signalPlayerLeftRoom.asObservable();
    playerRooms: Map<string, number> = new Map();
    gameBoardRooms: Map<number, GameBoardParameters> = new Map();
    gameTimerRooms: Map<number, GameTimer> = new Map();
    gameBattleRooms: Map<number, GameBattle> = new Map();
    gameStatisticsRooms: Map<number, GameStatistics> = new Map();

    constructor(readonly gameService: GameService) {}

    setSpawnCounter(gameSize: MapSize): number {
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
        let accessCode: number;
        do {
            accessCode = Math.floor(MIN_ACCESS_CODE + Math.random() * (MAX_ACCESS_CODE - MIN_ACCESS_CODE + 1));
        } while (this.rooms.has(accessCode));
        return accessCode;
    }

    async initRoomGameBoard(accessCode: number) {
        const room = this.rooms.get(accessCode);

        if (!room) {
            return;
        }

        try {
            await this.gameService.getGame(room.id).then((game) => {
                this.setupGameBoardRoom(room.accessCode, game);
            });
        } catch (error) {
            // Handle the error appropriately, e.g., log to a file or monitoring service
        }
    }

    setupGameBoardRoom(accessCode: number, game: Game) {
        this.gameBoardRooms.set(accessCode, { game, spawnPlaces: [], turnOrder: [] });
        const room = this.rooms.get(accessCode);
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
        return this.getNewRoom(accessCode, gameId, playerOrganizer);
    }

    getNewRoom(accessCode: number, gameId: string, playerOrganizer: PlayerCharacter): GameRoom {
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
        this.gameTimerRooms.set(accessCode, { time: 0, isPaused: true, state: GameTimerState.PreparingTurn });
        this.gameStatisticsRooms.set(accessCode, {
            players: [],
            isGameOn: false,
            totalGameTime: 0,
            totalPlayerTurns: 0,
            totalTerrainTilesVisited: [],
            totalDoorsInteracted: [],
            totalPlayersThatGrabbedFlag: [],
        });

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
        if (!room || room.isLocked) {
            return false;
        }

        if (room.players.some((p) => p.avatar.name === player.avatar.name)) {
            return false;
        }

        player.name = this.getUniquePlayerName(player, room);

        room.players.push(player);
        this.playerRooms.set(player.socketId, accessCode);
        return true;
    }

    getUniquePlayerName(player: PlayerCharacter, room: GameRoom): string {
        let uniqueName = player.name;
        let suffix = 1;
        while (room.players.some((p) => p.name === uniqueName)) {
            uniqueName = `${player.name}-${suffix++}`;
        }
        return uniqueName;
    }

    removePlayerFromRoom(socketId: string): void {
        const accessCode = this.playerRooms.get(socketId);
        if (!accessCode) return;

        const room = this.rooms.get(accessCode);
        if (!room) return;

        this.signalPlayerLeftRoom.next({ accessCode, playerSocketId: socketId });

        room.players = room.players.filter((player) => player.socketId !== socketId);
        this.playerRooms.delete(socketId);

        if (room.players.length === 0) {
            this.rooms.delete(accessCode);
            this.gameBoardRooms.delete(accessCode);
            this.gameTimerRooms.delete(accessCode);
            this.gameBattleRooms.delete(accessCode);
            this.gameStatisticsRooms.delete(accessCode);
        } else if (room.organizer === socketId) {
            room.organizer = room.players[0].socketId;
        }
    }

    lockRoom(accessCode: number, clientId: string): boolean {
        const room = this.rooms.get(accessCode);
        if (room?.organizer === clientId) {
            room.isLocked = true;
            return true;
        }
        return false;
    }

    unlockRoom(accessCode: number, clientId: string): boolean {
        const room = this.rooms.get(accessCode);
        if (room?.organizer === clientId && room.players.length < room.maxPlayers) {
            room.isLocked = false;
            return true;
        }
        return false;
    }

    kickPlayer(accessCode: number, playerSocketId: string, clientId: string): boolean {
        const room = this.rooms.get(accessCode);
        if (room?.organizer === clientId) {
            this.removePlayerFromRoom(playerSocketId);
            return true;
        }
        return false;
    }

    handlePlayerDisconnect(socketId: string): void {
        this.removePlayerFromRoom(socketId);
    }
}
