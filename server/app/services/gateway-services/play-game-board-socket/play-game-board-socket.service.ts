import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { MapSize } from '@common/enums/map-size';
import { Injectable, Logger } from '@nestjs/common';
import { GameRoom, GameSocketRoomService } from '../game-socket-room/game-socket-room.service';

export interface GameBoardParameters {
    game: Game;
    spawnPlaces: Map<number, string>;
}

@Injectable()
export class PlayGameBoardSocketService {
    private readonly logger = new Logger(PlayGameBoardSocketService.name);
    private gameBoardRooms: Map<number, GameBoardParameters> = new Map();

    constructor(
        private readonly gameService: GameService,
        private readonly gameSocketRoomService: GameSocketRoomService,
    ) {}

    initRoomGameBoard(accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);

        if (!room) {
            this.logger.error(`Room not found for access code: ${accessCode}`);
            return;
        }

        let game: Game;
        this.gameService.getGame(room.id).then((game) => {
            game = game;
        });

        this.setupSpawnPoints(room, game);
    }

    setupSpawnPoints(room: GameRoom, game: Game) {
        let spawnCounter = this.setSpawnCounter(game.size);
        let spawnPlaces: Map<number, string> = new Map();
        let availableSpawnPoints = spawnCounter;

        for (let player of room.players) {
            let assigned = false;

            while (!assigned && availableSpawnPoints > 0) {
                const randomIndex = Math.floor(Math.random() * spawnCounter);

                if (!spawnPlaces.has(randomIndex)) {
                    spawnPlaces.set(randomIndex, player.socketId);
                    assigned = true;
                    availableSpawnPoints--;
                }
            }
        }

        this.gameBoardRooms.set(room.accessCode, { game, spawnPlaces });
    }

    setSpawnCounter(gameSize: MapSize): number {
        switch (gameSize) {
            case MapSize.SMALL:
                return 2;
            case MapSize.MEDIUM:
                return 4;
            case MapSize.LARGE:
                return 6;
        }
    }
}
