import { Injectable } from '@angular/core';
import { PlayerMapEntity } from '@app/classes/Characters/player-map-entity';
import { Tile } from '@app/classes/Tiles/tile';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { GameShared } from '@common/interfaces/game-shared';
import { PlayGameBoardSocketService } from './play-game-board-socket.service';

@Injectable({
    providedIn: 'root',
})
export class PlayGameBoardManagerService {
    constructor(
        public gameMapDataManagerService: GameMapDataManagerService,
        public webSocketService: WebSocketService,
        public playGameBoardSocketService: PlayGameBoardSocketService,
    ) {
        this.playGameBoardSocketService.signalInitGameBoard$.subscribe((game) => {
            this.initGameBoard(game);
        });
        this.playGameBoardSocketService.signalInitCharacters$.subscribe((spawnPlaces) => {
            this.initCharacters(spawnPlaces);
        });

        this.playGameBoardSocketService.initGameBoard(webSocketService.currentRoom.accessCode);
    }

    initGameBoard(game: GameShared) {
        this.gameMapDataManagerService.init(game);
    }

    initCharacters(spawnPlaces: [number, string][]) {
        const tilesWithSpawn = this.gameMapDataManagerService.getTilesWithSpawn();
        const availableTiles = [...tilesWithSpawn];

        for (const spawnPlace of spawnPlaces) {
            const [index, playerName] = spawnPlace;
            const player = this.webSocketService.getRoomInfo().players.find((player) => player.name === playerName);
            const tile = tilesWithSpawn[index];

            if (player && tile) {
                player.mapEntity = new PlayerMapEntity(player.avatar.headImage);
                tile.setPlayer(player.mapEntity);
                player.mapEntity.setSpawnCoordinates(tile.coordinates);
                availableTiles.splice(availableTiles.indexOf(tile), 1);
            }
        }
        for (const tile of availableTiles) {
            tile.item = null;
        }
    }

    getCurrentGrid(): Tile[][] {
        return this.gameMapDataManagerService.getCurrentGrid();
    }
}
