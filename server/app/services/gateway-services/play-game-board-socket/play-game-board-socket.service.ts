import { Game } from '@app/model/database/game';
import { GameRoom, GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class PlayGameBoardSocketService {
    signalGameBoardSetupDone = new Subject<number>();
    signalGameBoardSetupDone$ = this.signalGameBoardSetupDone.asObservable();

    private readonly logger = new Logger(PlayGameBoardSocketService.name);

    constructor(private readonly gameSocketRoomService: GameSocketRoomService) {}

    initRoomGameBoard(accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        const gameBoardRoom = this.gameSocketRoomService.getGameBoardParameters(accessCode);

        if (!room) {
            this.logger.error(`Room pas trouve pour code: ${accessCode}`);
            return;
        }

        this.setupSpawnPoints(room, gameBoardRoom.game);
    }

    setupSpawnPoints(room: GameRoom, game: Game) {
        const spawnCounter = this.gameSocketRoomService.setSpawnCounter(game.size);
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

        this.gameSocketRoomService.setGameBoardParameters(room.accessCode, { game, spawnPlaces });
        this.logger.log(`GameBoard setup fait pour room: ${room.accessCode}`);
        this.signalGameBoardSetupDone.next(room.accessCode);
    }
}
