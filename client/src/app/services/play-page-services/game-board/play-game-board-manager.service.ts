import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { PlayerMapEntity } from '@app/classes/Characters/player-map-entity';
import { Tile } from '@app/classes/Tiles/tile';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameBoardParameters, WebSocketService } from '@app/services/SocketService/websocket.service';
import { GameShared } from '@common/interfaces/game-shared';

@Injectable({
    providedIn: 'root',
})
export class PlayGameBoardManagerService {
    currentTime: number = 0;
    isBattleOn: boolean = false;
    currentPlayerIdTurn: string = '';
    isUserTurn: boolean = false;

    constructor(
        public gameMapDataManagerService: GameMapDataManagerService,
        public webSocketService: WebSocketService,
    ) {}

    init(gameBoardParameters: GameBoardParameters) {
        this.initGameBoard(gameBoardParameters.game);
        this.initCharacters(gameBoardParameters.spawnPlaces);
    }

    initGameBoard(game: GameShared) {
        this.gameMapDataManagerService.init(game);
    }

    initCharacters(spawnPlaces: [number, string][]) {
        const tilesWithSpawn = this.gameMapDataManagerService.getTilesWithSpawn();
        const availableTiles = [...tilesWithSpawn];

        for (const spawnPlace of spawnPlaces) {
            const [index, playerSocketId] = spawnPlace;
            const player = this.webSocketService.getRoomInfo().players.find((p) => p.socketId === playerSocketId);
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

    findPlayerFromPlayerMapEntity(playerMapEntity: PlayerMapEntity): PlayerCharacter | null {
        return this.webSocketService.getRoomInfo().players.find((player) => player.mapEntity === playerMapEntity) || null;
    }

    findPlayerFromName(name: string): PlayerCharacter | null {
        return this.webSocketService.getRoomInfo().players.find((player) => player.name === name) || null;
    }

    getCurrentPlayerTurnName(): string {
        return this.webSocketService.getRoomInfo().players.find((player) => player.socketId === this.currentPlayerIdTurn)?.name || '';
    }
}
