import { Injectable } from '@angular/core';
import { PlayerMapEntity } from '@app/classes/Characters/player-map-entity';
import { Tile } from '@app/classes/Tiles/tile';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { GameRoom, WebSocketService } from '@app/services/SocketService/websocket.service';

@Injectable({
    providedIn: 'root',
})
export class PlayGameBoardManagerService {
    roomInfo: GameRoom = this.webSocketService.getRoomInfo();

    constructor(
        public gameMapDataManagerService: GameMapDataManagerService,
        public webSocketService: WebSocketService,
        public gameServerCommunicationService: GameServerCommunicationService,
    ) {
        gameServerCommunicationService.getGame(this.roomInfo.roomId).subscribe((game) => {
            this.gameMapDataManagerService.init(game);
            this.initCharacters();
        });

        // console.log(this.webSocketService.getRoomInfo());
    }

    initCharacters() {
        const tilesWithSpawn = this.gameMapDataManagerService.getTilesWithSpawn();
        const availableTiles = [...tilesWithSpawn];

        for (const player of this.roomInfo.players) {
            player.mapEntity = new PlayerMapEntity(player.avatar.headImage);

            let assigned = false;
            while (!assigned && availableTiles.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableTiles.length);
                const randomTile = availableTiles[randomIndex];

                if (!randomTile.player) {
                    randomTile.setPlayer(player.mapEntity);
                    player.mapEntity.setSpawnCoordinates(randomTile.coordinates);
                    assigned = true;
                    availableTiles.splice(randomIndex, 1);
                }
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
