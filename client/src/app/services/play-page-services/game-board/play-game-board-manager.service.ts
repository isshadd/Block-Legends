import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { PlayerMapEntity } from '@app/classes/Characters/player-map-entity';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { WalkableTile } from '@app/classes/Tiles/walkable-tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameBoardParameters, WebSocketService } from '@app/services/SocketService/websocket.service';
import { GameShared } from '@common/interfaces/game-shared';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayGameBoardManagerService {
    signalUserMoved = new Subject<{ fromTile: Vec2; toTile: Vec2 }>();
    signalUserMoved$ = this.signalUserMoved.asObservable();

    signalUserStartedMoving = new Subject<void>();
    signalUserStartedMoving$ = this.signalUserStartedMoving.asObservable();

    signalUserFinishedMoving = new Subject<void>();
    signalUserFinishedMoving$ = this.signalUserFinishedMoving.asObservable();

    currentTime: number = 0;
    isBattleOn: boolean = false;
    currentPlayerIdTurn: string = '';
    isUserTurn: boolean = false;
    userCurrentMovePoints: number = 0;
    userCurrentPossibleMoves: Map<Tile, Tile[]> = new Map();
    turnOrder: string[];

    constructor(
        public gameMapDataManagerService: GameMapDataManagerService,
        public webSocketService: WebSocketService,
    ) {}

    init(gameBoardParameters: GameBoardParameters) {
        this.initGameBoard(gameBoardParameters.game);
        this.initCharacters(gameBoardParameters.spawnPlaces);
        this.turnOrder = gameBoardParameters.turnOrder;
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

    startTurn() {
        const userPlayerCharacter = this.findPlayerFromSocketId(this.webSocketService.socket.id);

        if (!this.isUserTurn || !userPlayerCharacter) {
            return;
        }

        this.userCurrentMovePoints = userPlayerCharacter.attributes.speed;

        this.setPossibleMoves(userPlayerCharacter);
        this.showPossibleMoves();
    }

    setPossibleMoves(playerCharacter: PlayerCharacter) {
        this.userCurrentPossibleMoves = this.gameMapDataManagerService.getPossibleMovementTiles(
            playerCharacter.mapEntity.coordinates,
            this.userCurrentMovePoints,
        );
    }

    showPossibleMoves() {
        this.userCurrentPossibleMoves.forEach((path, tile) => {
            tile.visibleState = VisibleState.Valid;
        });
    }

    endTurn() {
        const userPlayerCharacter = this.findPlayerFromSocketId(this.webSocketService.socket.id);

        if (!this.isUserTurn || !userPlayerCharacter) {
            return;
        }

        this.hidePossibleMoves();
    }

    hidePossibleMoves() {
        this.userCurrentPossibleMoves.forEach((path, tile) => {
            tile.visibleState = VisibleState.NotSelected;
        });
        this.userCurrentPossibleMoves.clear();
    }

    async moveUserPlayer(tile: Tile) {
        const userPlayerCharacter = this.findPlayerFromSocketId(this.webSocketService.socket.id);

        if (!this.isUserTurn || !userPlayerCharacter) {
            return;
        }

        const path = this.userCurrentPossibleMoves.get(tile);
        const movingTimeInterval = 150;

        if (path) {
            this.signalUserStartedMoving.next();

            let lastTile: WalkableTile | null = null;
            for (const tile of path) {
                if (lastTile) {
                    this.signalUserMoved.next({
                        fromTile: lastTile.coordinates,
                        toTile: tile.coordinates,
                    });
                    await this.waitInterval(movingTimeInterval);
                }

                lastTile = tile as WalkableTile;
            }

            this.signalUserFinishedMoving.next();
        }
    }

    movePlayer(playerId: string, fromTile: Vec2, toTile: Vec2) {
        const userPlayerCharacter = this.findPlayerFromSocketId(playerId);

        if (!userPlayerCharacter) {
            return;
        }

        const fromTileInstance = this.gameMapDataManagerService.getTileAt(fromTile) as WalkableTile;
        fromTileInstance.removePlayer();

        const toTileInstance = this.gameMapDataManagerService.getTileAt(toTile) as WalkableTile;
        toTileInstance.setPlayer(userPlayerCharacter.mapEntity);
    }

    async waitInterval(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    removePlayerFromMap(playerId: string) {
        const playerCharacter = this.findPlayerFromSocketId(playerId);

        if (playerCharacter) {
            const playerMapEntity = playerCharacter.mapEntity;

            const tile: TerrainTile = this.gameMapDataManagerService.getTileAt(playerMapEntity.coordinates) as TerrainTile;
            tile.removePlayer();

            const spawnTile: TerrainTile = this.gameMapDataManagerService.getTileAt(playerMapEntity.spawnCoordinates) as TerrainTile;
            spawnTile.removeItem();
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

    findPlayerFromSocketId(socketId: string | undefined): PlayerCharacter | null {
        if (!socketId) {
            return null;
        }
        return this.webSocketService.getRoomInfo().players.find((player) => player.socketId === socketId) || null;
    }

    getCurrentPlayerTurnName(): string {
        return this.webSocketService.getRoomInfo().players.find((player) => player.socketId === this.currentPlayerIdTurn)?.name || '';
    }
}
