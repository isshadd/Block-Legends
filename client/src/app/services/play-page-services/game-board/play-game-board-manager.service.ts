import { Injectable } from '@angular/core';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { ItemFactoryService } from '@app/services/game-board-services/item-factory.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { Item } from '@common/classes/Items/item';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { PlayerMapEntity } from '@common/classes/Player/player-map-entity';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';
import { ItemType } from '@common/enums/item-type';
import { TileType } from '@common/enums/tile-type';
import { GameBoardParameters } from '@common/interfaces/game-board-parameters';
import { GameShared } from '@common/interfaces/game-shared';
import { VisibleState } from '@common/interfaces/placeable-entity';
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

    signalUserGrabbedItem = new Subject<{ itemType: ItemType; tileCoordinates: Vec2 }>();
    signalUserGrabbedItem$ = this.signalUserGrabbedItem.asObservable();

    signalUserThrewItem = new Subject<{ itemType: ItemType; tileCoordinates: Vec2 }>();
    signalUserThrewItem$ = this.signalUserThrewItem.asObservable();

    signalUserWon = new Subject<void>();
    signalUserWon$ = this.signalUserWon.asObservable();

    currentTime: number = 0;
    areOtherPlayersInBattle: boolean = false;
    currentPlayerIdTurn: string = '';
    isUserTurn: boolean = false;
    userCurrentMovePoints: number = 0;
    userCurrentActionPoints: number = 0;
    userCurrentPossibleMoves: Map<Tile, Tile[]> = new Map();
    turnOrder: string[] = [];

    possibleItems: Item[] = [];

    winnerPlayer: PlayerCharacter | null = null;

    constructor(
        public gameMapDataManagerService: GameMapDataManagerService,
        public webSocketService: WebSocketService,
        public tileFactoryService: TileFactoryService,
        public battleManagerService: BattleManagerService,
        public itemFactoryService: ItemFactoryService,
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
        const userPlayerCharacter = this.getCurrentPlayerCharacter();

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
        this.possibleItems = [];
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

        for (const pathTile of path) {
            if (lastTile) {
                this.userCurrentMovePoints -= (pathTile as WalkableTile).moveCost;
                this.signalUserMoved.next({
                    fromTile: lastTile.coordinates,
                    toTile: pathTile.coordinates,
                });

                const didGrabItem = this.handleTileItem(pathTile);
                if (this.possibleItems.length > 0) {
                    this.signalUserFinishedMoving.next();
                    return;
                }

                await this.waitInterval(movingTimeInterval);

                didPlayerTripped = this.didPlayerTripped(pathTile.type);

                if (didGrabItem) {
                    break;
                }
            }

            lastTile = pathTile as WalkableTile;
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

    handleTileItem(tile: Tile): boolean {
        const currentPlayer = this.getCurrentPlayerCharacter();

        if (!tile.isTerrain() || !currentPlayer) {
            return false;
        }

        const terrainTile = tile as TerrainTile;
        if (terrainTile.item?.isGrabbable()) {
            if (currentPlayer.inventory.some((item) => item.type === ItemType.EmptyItem)) {
                this.signalUserGrabbedItem.next({ itemType: terrainTile.item.type, tileCoordinates: terrainTile.coordinates });
            } else {
                for (const item of currentPlayer.inventory) {
                    this.possibleItems.push(item);
                }
                this.possibleItems.push(terrainTile.item);
            }
            return true;
        }
        return false;
    }

    grabItem(player: string, itemType: ItemType, tileCoordinate: Vec2) {
        const actionPlayer = this.findPlayerFromSocketId(player);

        if (!actionPlayer) {
            return;
        }

        for (let i = 0; i < actionPlayer.inventory.length; i++) {
            if (actionPlayer.inventory[i].type === ItemType.EmptyItem) {
                actionPlayer.inventory[i] = this.itemFactoryService.createItem(itemType);

                const tile = this.gameMapDataManagerService.getTileAt(tileCoordinate);
                if (tile?.isTerrain() && (tile as TerrainTile).item?.type === itemType) {
                    (tile as TerrainTile).removeItem();
                }
                break;
            }
        }
    }

    throwItem(player: string, itemType: ItemType, tileCoordinate: Vec2) {
        const actionPlayer = this.findPlayerFromSocketId(player);

        if (!actionPlayer) {
            return;
        }

        for (let i = 0; i < actionPlayer.inventory.length; i++) {
            if (actionPlayer.inventory[i].type === itemType) {
                actionPlayer.inventory[i] = this.itemFactoryService.createItem(ItemType.EmptyItem);

                const item = this.itemFactoryService.createItem(itemType);
                const tile = this.gameMapDataManagerService.getTileAt(tileCoordinate);
                if (tile?.isTerrain()) {
                    (tile as TerrainTile).item = item;
                }
                break;
            }
        }
    }

    userThrewItem(item: Item) {
        const currentPlayer = this.getCurrentPlayerCharacter();

        if (!currentPlayer) {
            return;
        }

        const terrainTile = this.gameMapDataManagerService.getTileAt(currentPlayer.mapEntity.coordinates) as TerrainTile;

        const lastItem = this.possibleItems.pop();
        if (item !== lastItem) {
            this.signalUserThrewItem.next({ itemType: item.type, tileCoordinates: terrainTile.coordinates });
            if (terrainTile.item) {
                this.signalUserGrabbedItem.next({ itemType: terrainTile.item.type, tileCoordinates: terrainTile.coordinates });
            }
        }

        this.possibleItems = [];

        const didPlayerTripped = this.didPlayerTripped(terrainTile.type);
        if (didPlayerTripped) {
            this.signalUserGotTurnEnded.next();
            return;
        }

        this.checkIfPLayerDidEverything();
        this.setupPossibleMoves(currentPlayer);
    }

    didPlayerTripped(tileType: TileType): boolean {
        if (tileType === TileType.Ice) {
            const result = 0.1;
            if (Math.random() < result) {
                return true;
            }
        }
        return false;
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
        const currentPlayer = this.getCurrentPlayerCharacter();
        if (!currentPlayer) return;

        if (currentPlayer.socketId !== playerId && currentPlayer.socketId !== enemyPlayerId) {
            this.areOtherPlayersInBattle = true;
            return;
        }

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
            loserPlayerCharacter.fightLoses++;
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

        const value = 3;
        if (currentPlayer === playerCharacter && playerCharacter.fightWins >= value) {
            this.signalUserWon.next();
        }
    }

    endGame(winnerPlayerId: string) {
        this.winnerPlayer = this.findPlayerFromSocketId(winnerPlayerId);
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
        this.turnOrder = [];
        this.possibleItems = [];

        this.winnerPlayer = null;
    }
}
