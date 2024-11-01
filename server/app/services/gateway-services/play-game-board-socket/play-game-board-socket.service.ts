import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { GameRoom, GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { MapSize } from '@common/enums/map-size';
import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface GameBoardParameters {
    game: Game;
    spawnPlaces: [number, string][];
}

@Injectable()
export class PlayGameBoardSocketService {
    signalGameBoardSetupDone = new Subject<number>();
    signalGameBoardSetupDone$ = this.signalGameBoardSetupDone.asObservable();

    private readonly logger = new Logger(PlayGameBoardSocketService.name);
    private gameBoardRooms: Map<number, GameBoardParameters> = new Map();

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
        const spawnCounter = this.setSpawnCounter(game.size);
        const spawnPlaces: [number, string][] = [];
        let availableSpawnPoints = spawnCounter;

        for (const player of room.players) {
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

    getGameBoardParameters(accessCode: number): GameBoardParameters {
        return this.gameBoardRooms.get(accessCode);
    }
}
