import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { PlayerMapEntity } from '@app/classes/Characters/player-map-entity';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { WalkableTile } from '@app/classes/Tiles/walkable-tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { GameBoardParameters, WebSocketService } from '@app/services/SocketService/websocket.service';
import { TileType } from '@common/enums/tile-type';
import { GameShared } from '@common/interfaces/game-shared';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject } from 'rxjs';
import { BattleManagerService } from './battle-manager.service';

@Injectable({
    providedIn: 'root',
})
export class PlayGameBoardManagerService {
    signalManagerFinishedInit = new Subject<void>();
    signalManagerFinishedInit$ = this.signalManagerFinishedInit.asObservable();

    signalUserMoved = new Subject<{ fromTile: Vec2; toTile: Vec2 }>();
    signalUserMoved$ = this.signalUserMoved.asObservable();

    signalUserRespawned = new Subject<{ fromTile: Vec2; toTile: Vec2 }>();
    signalUserRespawned$ = this.signalUserRespawned.asObservable();

    signalUserStartedMoving = new Subject<void>();
    signalUserStartedMoving$ = this.signalUserStartedMoving.asObservable();

    signalUserFinishedMoving = new Subject<void>();
    signalUserFinishedMoving$ = this.signalUserFinishedMoving.asObservable();

    signalUserGotTurnEnded = new Subject<void>();
    signalUserGotTurnEnded$ = this.signalUserGotTurnEnded.asObservable();

    signalUserDidDoorAction = new Subject<Vec2>();
    signalUserDidDoorAction$ = this.signalUserDidDoorAction.asObservable();

    signalUserDidBattleAction = new Subject<string>();
    signalUserDidBattleAction$ = this.signalUserDidBattleAction.asObservable();

    signalUserWon = new Subject<void>();
    signalUserWon$ = this.signalUserWon.asObservable();

    currentTime: number = 0;
    areOtherPlayersInBattle: boolean = false;
    currentPlayerIdTurn: string = '';
    isUserTurn: boolean = false;
    userCurrentMovePoints: number = 0;
    userCurrentActionPoints: number = 0;
    userCurrentPossibleMoves: Map<Tile, Tile[]> = new Map();
    turnOrder: string[];

    winnerPlayer: PlayerCharacter | null = null;

    constructor(
        public gameMapDataManagerService: GameMapDataManagerService,
        public webSocketService: WebSocketService,
        public tileFactoryService: TileFactoryService,
        public battleManagerService: BattleManagerService,
    ) {}

    init(gameBoardParameters: GameBoardParameters) {
        this.initGameBoard(gameBoardParameters.game);
        this.initCharacters(gameBoardParameters.spawnPlaces);
        this.turnOrder = gameBoardParameters.turnOrder;
        this.signalManagerFinishedInit.next();
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
        this.userCurrentActionPoints = 1;

        this.setupPossibleMoves(userPlayerCharacter);
    }

    setupPossibleMoves(userPlayerCharacter: PlayerCharacter) {
        if (this.userCurrentMovePoints <= 0 || !this.isUserTurn) {
            return;
        }
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
        const userPlayerCharacter = this.getCurrentPlayerCharacter();

        if (!this.isUserTurn || !userPlayerCharacter) {
            return;
        }

        this.userCurrentMovePoints = 0;
        this.hidePossibleMoves();
    }

    hidePossibleMoves() {
        this.userCurrentPossibleMoves.forEach((path, tile) => {
            tile.visibleState = VisibleState.NotSelected;
        });
        this.userCurrentPossibleMoves.clear();
    }

    async moveUserPlayer(tile: Tile) {
        const userPlayerCharacter = this.getCurrentPlayerCharacter();
        const path = this.userCurrentPossibleMoves.get(tile);

        if (!this.isUserTurn || !userPlayerCharacter || !path) {
            return;
        }

        this.hidePossibleMoves();
        const movingTimeInterval = 150;

        this.signalUserStartedMoving.next();

        let lastTile: WalkableTile | null = null;
        let didPlayerTripped = false;

        for (const tile of path) {
            if (lastTile) {
                this.userCurrentMovePoints -= (tile as WalkableTile).moveCost;
                this.signalUserMoved.next({
                    fromTile: lastTile.coordinates,
                    toTile: tile.coordinates,
                });
                await this.waitInterval(movingTimeInterval);

                if (tile.type === TileType.Ice) {
                    if (Math.random() < 0.1) {
                        didPlayerTripped = true;
                        break;
                    }
                }
            }

            lastTile = tile as WalkableTile;
        }

        this.signalUserFinishedMoving.next();

        if (didPlayerTripped) {
            this.signalUserGotTurnEnded.next();
            return;
        }

        this.checkIfPLayerDidEverything();
        this.setupPossibleMoves(userPlayerCharacter);
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

    handlePlayerAction(tile: Tile) {
        if (!this.isUserTurn || this.userCurrentActionPoints <= 0) {
            return;
        }

        if (tile instanceof WalkableTile && tile.hasPlayer() && tile.player) {
            const playerCharacter = this.findPlayerFromPlayerMapEntity(tile.player);
            if (playerCharacter?.socketId) {
                this.signalUserDidBattleAction.next(playerCharacter.socketId);
                this.hidePossibleMoves();
                this.userCurrentActionPoints -= 1;
            }
            return;
        }

        if (tile.isDoor()) {
            this.hidePossibleMoves();
            this.signalUserDidDoorAction.next(tile.coordinates);
            this.userCurrentActionPoints -= 1;
            this.checkIfPLayerDidEverything();
            return;
        }
    }

    checkIfPLayerDidEverything() {
        if (this.userCurrentMovePoints <= 0) {
            const currentPlayerTile = this.getCurrentPlayerTile();
            if (this.userCurrentActionPoints <= 0 || (currentPlayerTile && this.getAdjacentActionTiles(currentPlayerTile).length === 0)) {
                this.signalUserGotTurnEnded.next();
            }
        }
    }

    toggleDoor(tileCoordinate: Vec2) {
        const tile = this.gameMapDataManagerService.getTileAt(tileCoordinate);

        if (tile && tile.isDoor()) {
            if (tile.type === TileType.Door) {
                const openDoor = this.tileFactoryService.createTile(TileType.OpenDoor);
                openDoor.coordinates = tile.coordinates;
                this.gameMapDataManagerService.setTileAt(tileCoordinate, openDoor);
            } else if (tile.type === TileType.OpenDoor) {
                const door = this.tileFactoryService.createTile(TileType.Door);
                door.coordinates = tile.coordinates;
                this.gameMapDataManagerService.setTileAt(tileCoordinate, door);
            }

            const userPlayerCharacter = this.getCurrentPlayerCharacter();
            if (userPlayerCharacter && this.isUserTurn) {
                this.setupPossibleMoves(userPlayerCharacter);
            }
        }
    }

    startBattle(playerId: string, enemyPlayerId: string) {
        const userId = this.webSocketService.socket.id;
        if (userId !== playerId && userId !== enemyPlayerId) {
            this.areOtherPlayersInBattle = true;
            return;
        }

        const currentPlayer = this.getCurrentPlayerCharacter();
        if (!currentPlayer) return;

        let opponentPlayer: PlayerCharacter | null;
        if (currentPlayer.socketId === playerId) {
            opponentPlayer = this.findPlayerFromSocketId(enemyPlayerId);
        } else {
            opponentPlayer = this.findPlayerFromSocketId(playerId);
        }

        if (!opponentPlayer) return;

        this.battleManagerService.init(currentPlayer, opponentPlayer);
    }

    continueTurn() {
        const userPlayerCharacter = this.getCurrentPlayerCharacter();
        if (userPlayerCharacter && this.isUserTurn) {
            this.checkIfPLayerDidEverything();
            this.setupPossibleMoves(userPlayerCharacter);
        }
    }

    endBattleByDeath(winnerPlayer: string, loserPlayer: string) {
        const winnerPlayerCharacter = this.findPlayerFromSocketId(winnerPlayer);
        const loserPlayerCharacter = this.findPlayerFromSocketId(loserPlayer);

        if (winnerPlayerCharacter && loserPlayerCharacter) {
            winnerPlayerCharacter.fightWins++;
            this.checkIfPlayerWonGame(winnerPlayerCharacter);

            if (loserPlayerCharacter === this.getCurrentPlayerCharacter()) {
                const currentTile: WalkableTile = this.gameMapDataManagerService.getTileAt(
                    loserPlayerCharacter.mapEntity.coordinates,
                ) as WalkableTile;
                const spawnTile: WalkableTile = this.gameMapDataManagerService.getClosestWalkableTileWithoutPlayerAt(loserPlayerCharacter.mapEntity);
                this.signalUserRespawned.next({
                    fromTile: currentTile.coordinates,
                    toTile: spawnTile.coordinates,
                });
            }
        }
    }

    checkIfPlayerWonGame(playerCharacter: PlayerCharacter) {
        const currentPlayer = this.getCurrentPlayerCharacter();

        if (currentPlayer === playerCharacter && playerCharacter.fightWins >= 3) {
            this.signalUserWon.next();
        }
    }

    endGame(playerId: string) {
        this.winnerPlayer = this.findPlayerFromSocketId(playerId);
    }

    getWinnerPlayer(): PlayerCharacter | null {
        return this.winnerPlayer;
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

        if (!this.battleManagerService.isBattleOn) {
            this.continueTurn();
        }
    }

    getCurrentGrid(): Tile[][] {
        return this.gameMapDataManagerService.getCurrentGrid();
    }

    getCurrentPlayerTile(): Tile | null {
        const player = this.getCurrentPlayerCharacter();

        if (!player) {
            return null;
        }

        return this.gameMapDataManagerService.getTileAt(player.mapEntity.coordinates);
    }

    getAdjacentActionTiles(tile: Tile): Tile[] {
        const neighboursTiles = this.gameMapDataManagerService.getNeighbours(tile);

        return neighboursTiles.filter((neighbourTile) => {
            return (neighbourTile instanceof WalkableTile && neighbourTile.hasPlayer()) || neighbourTile.isDoor();
        });
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

    getCurrentPlayerCharacter(): PlayerCharacter | null {
        return this.findPlayerFromSocketId(this.webSocketService.socket.id);
    }

    resetManager() {
        this.currentTime = 0;
        this.areOtherPlayersInBattle = false;
        this.currentPlayerIdTurn = '';
        this.isUserTurn = false;
        this.userCurrentMovePoints = 0;
        this.userCurrentActionPoints = 0;
        this.userCurrentPossibleMoves = new Map();
        this.turnOrder;

        this.winnerPlayer = null;
    }
}
