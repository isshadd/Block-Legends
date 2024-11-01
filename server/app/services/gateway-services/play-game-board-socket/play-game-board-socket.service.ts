import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { MapSize } from '@common/enums/map-size';
import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import { GameRoom, GameSocketRoomService } from '../game-socket-room/game-socket-room.service';

export interface GameBoardParameters {
    game: Game;
    spawnPlaces: [number, string][];
}

@Injectable()
export class PlayGameBoardSocketService {
    private readonly logger = new Logger(PlayGameBoardSocketService.name);
    private gameBoardRooms: Map<number, GameBoardParameters> = new Map();

    signalGameBoardSetupDone = new Subject<number>();
    signalGameBoardSetupDone$ = this.signalGameBoardSetupDone.asObservable();

    constructor(
        private readonly gameService: GameService,
        private readonly gameSocketRoomService: GameSocketRoomService,
    ) {}

    initRoomGameBoard(accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);

        if (!room) {
            this.logger.error(`Room pas trouve pour code: ${accessCode}`);
            return;
        }

        this.gameService.getGame(room.id).then((game) => {
            this.setupSpawnPoints(room, game);
        });
    }

    setupSpawnPoints(room: GameRoom, game: Game) {
        let spawnCounter = this.setSpawnCounter(game.size);
        let spawnPlaces: [number, string][] = [];
        let availableSpawnPoints = spawnCounter;

        for (let player of room.players) {
            let assigned = false;

            while (!assigned && availableSpawnPoints > 0) {
                const randomIndex = Math.floor(Math.random() * spawnCounter);

                if (!spawnPlaces.some(([index]) => index === randomIndex)) {
                    spawnPlaces.push([randomIndex, player.name]);
                    assigned = true;
                    availableSpawnPoints--;
                }
            }
        }

        this.gameBoardRooms.set(room.accessCode, { game, spawnPlaces });
        this.logger.log(`GameBoard setup fait pour room: ${room.accessCode}`);
        this.signalGameBoardSetupDone.next(room.accessCode);
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

    getGameBoardParameters(accessCode: number): GameBoardParameters {
        return this.gameBoardRooms.get(accessCode);
    }
}
