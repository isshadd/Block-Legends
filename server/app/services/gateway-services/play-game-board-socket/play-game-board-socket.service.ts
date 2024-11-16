import { Game } from '@app/model/database/game';
import { GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { GameRoom } from '@common/interfaces/game-room';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PlayGameBoardSocketService {
    private readonly logger = new Logger(PlayGameBoardSocketService.name);

    constructor(private readonly gameSocketRoomService: GameSocketRoomService) {}

    initRoomGameBoard(accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        const gameBoardRoom = this.gameSocketRoomService.gameBoardRooms.get(accessCode);

        if (!room) {
            this.logger.error(`Room pas trouve pour code: ${accessCode}`);
            return;
        }

        const spawnPlaces: [number, string][] = this.setupSpawnPoints(room, gameBoardRoom.game);
        const turnOrder: string[] = this.setupTurnOrder(room);
        this.gameSocketRoomService.setCurrentPlayerTurn(accessCode, turnOrder[0]);

        this.gameSocketRoomService.gameBoardRooms.set(room.accessCode, { game: gameBoardRoom.game, spawnPlaces, turnOrder });
        this.logger.log(`GameBoard setup fait pour room: ${room.accessCode}`);
    }

    setupSpawnPoints(room: GameRoom, game: Game): [number, string][] {
        const spawnCounter = this.gameSocketRoomService.setSpawnCounter(game.size);
        const spawnPlaces: [number, string][] = [];
        let availableSpawnPoints = spawnCounter;

        for (const player of room.players) {
            let assigned = false;

            while (!assigned && availableSpawnPoints > 0) {
                const randomIndex = Math.floor(Math.random() * spawnCounter);

                if (!spawnPlaces.some(([index]) => index === randomIndex)) {
                    spawnPlaces.push([randomIndex, player.socketId]);
                    assigned = true;
                    availableSpawnPoints--;
                }
            }
        }

        return spawnPlaces;
    }

    setupTurnOrder(room: GameRoom): string[] {
        const playersWithSpeed = room.players.map((player) => ({
            socketId: player.socketId,
            speed: player.attributes.speed,
        }));

        playersWithSpeed.sort((a, b) => b.speed - a.speed);

        const turnOrder: string[] = [];
        let i = 0;

        while (i < playersWithSpeed.length) {
            const sameSpeedPlayers = playersWithSpeed.filter((p) => p.speed === playersWithSpeed[i].speed);
            const shuffledSameSpeedPlayers = sameSpeedPlayers.sort(() => Math.random() - 0.5);

            for (const player of shuffledSameSpeedPlayers) {
                turnOrder.push(player.socketId);
            }

            i += sameSpeedPlayers.length;
        }

        return turnOrder;
    }

    changeTurn(accessCode: number) {
        const gameBoardRoom = this.gameSocketRoomService.gameBoardRooms.get(accessCode);

        if (gameBoardRoom) {
            const currentPlayerIndex = gameBoardRoom.turnOrder.indexOf(this.gameSocketRoomService.getRoomByAccessCode(accessCode).currentPlayerTurn);
            const nextPlayerIndex = (currentPlayerIndex + 1) % gameBoardRoom.turnOrder.length;

            this.gameSocketRoomService.setCurrentPlayerTurn(accessCode, gameBoardRoom.turnOrder[nextPlayerIndex]);
        }
    }
}
