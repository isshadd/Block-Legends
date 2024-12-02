/* eslint-disable max-lines */
import { Injectable } from '@angular/core';
import { DebugService } from '@app/services/debug.service';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { ItemFactoryService } from '@app/services/game-board-services/item-factory.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { Item } from '@common/classes/Items/item';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { PlayerMapEntity } from '@common/classes/Player/player-map-entity';
import { IceTile } from '@common/classes/Tiles/ice-tile';
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

    signalUserMoved = new Subject<{ fromTile: Vec2; toTile: Vec2; isTeleport: boolean }>();
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
    userCurrentPossibleMoves: Map<Tile, Tile[]> = new Map();
    turnOrder: string[] = [];

    possibleItems: Item[] = [];

    winnerPlayer: PlayerCharacter | null = null;

    readonly movingTimeInterval = 150;
    /* eslint-disable max-params */
    constructor(
        public gameMapDataManagerService: GameMapDataManagerService,
        public webSocketService: WebSocketService,
        public tileFactoryService: TileFactoryService,
        public battleManagerService: BattleManagerService,
        public itemFactoryService: ItemFactoryService,
        public eventJournal: EventJournalService,
        public debugService: DebugService,
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
        const player = this.findPlayerFromSocketId(this.currentPlayerIdTurn);

        if (!player) {
            return;
        }

        player.currentMovePoints = player.attributes.speed;
        player.currentActionPoints = 1;

        if (!this.isUserTurn) {
            return;
        }

        this.setupPossibleMoves(player);
    }

    setupPossibleMoves(userPlayerCharacter: PlayerCharacter) {
        if (userPlayerCharacter.currentMovePoints <= 0 || !this.isUserTurn) {
            return;
        }

        this.setPossibleMoves(userPlayerCharacter);
        this.showPossibleMoves();
    }

    setPossibleMoves(playerCharacter: PlayerCharacter) {
        this.userCurrentPossibleMoves = this.gameMapDataManagerService.getPossibleMovementTiles(
            playerCharacter.mapEntity.coordinates,
            playerCharacter.currentMovePoints,
        );
    }

    showPossibleMoves() {
        this.userCurrentPossibleMoves.forEach((path, tile) => {
            tile.visibleState = VisibleState.Valid;
        });
    }

    endTurn() {
        const player = this.findPlayerFromSocketId(this.currentPlayerIdTurn);

        if (!player) {
            return;
        }

        player.currentMovePoints = 0;
        player.currentActionPoints = 0;

        if (!this.isUserTurn) {
            return;
        }

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

        this.signalUserStartedMoving.next();

        let lastTile: WalkableTile | null = null;
        let didPlayerTripped = false;

        for (const pathTile of path) {
            if (lastTile) {
                this.signalUserMoved.next({
                    fromTile: lastTile.coordinates,
                    toTile: pathTile.coordinates,
                    isTeleport: false,
                });

                const didGrabItem = this.handleTileItem(pathTile);
                if (this.possibleItems.length > 0) {
                    this.signalUserFinishedMoving.next();
                    return;
                }

                await this.waitInterval(this.movingTimeInterval);

                didPlayerTripped = this.didPlayerTripped(pathTile.type, userPlayerCharacter);

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

    async teleportPlayer(toTile: Tile) {
        const userPlayerCharacter = this.getCurrentPlayerCharacter();
        const lastTile = this.getCurrentPlayerTile();

        if (
            !userPlayerCharacter ||
            !this.isUserTurn ||
            !lastTile ||
            !toTile.isWalkable() ||
            (toTile as WalkableTile).hasPlayer() ||
            (toTile.isTerrain() && (toTile as TerrainTile).item?.isGrabbable())
        ) {
            return;
        }

        this.hidePossibleMoves();
        this.signalUserMoved.next({
            fromTile: lastTile.coordinates,
            toTile: toTile.coordinates,
            isTeleport: true,
        });
        await this.waitInterval(this.movingTimeInterval);
        this.setupPossibleMoves(userPlayerCharacter);
    }

    movePlayer(playerId: string, fromTile: Vec2, toTile: Vec2, isTeleport: boolean) {
        const userPlayerCharacter = this.findPlayerFromSocketId(playerId);

        if (!userPlayerCharacter) {
            return;
        }

        const fromTileInstance = this.gameMapDataManagerService.getTileAt(fromTile) as WalkableTile;
        fromTileInstance.removePlayer();
        if (this.doesPlayerHaveItem(userPlayerCharacter, ItemType.EnchantedBook)) {
            this.convertTileToIce(fromTileInstance);
        }

        const toTileInstance = this.gameMapDataManagerService.getTileAt(toTile) as WalkableTile;
        toTileInstance.setPlayer(userPlayerCharacter.mapEntity);
        if (!isTeleport) userPlayerCharacter.currentMovePoints -= toTileInstance.moveCost;
        this.checkIfPlayerWonCTFGame(userPlayerCharacter);
    }

    convertTileToIce(tile: Tile) {
        if (tile.isTerrain()) {
            const iceTile = this.tileFactoryService.createTile(TileType.Ice) as IceTile;
            iceTile.coordinates = tile.coordinates;
            if ((tile as TerrainTile).item) {
                iceTile.item = (tile as TerrainTile).item;
            }
            this.gameMapDataManagerService.setTileAt(tile.coordinates, iceTile);
        }
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
            this.eventJournal.broadcastEvent(`${currentPlayer.name} a ramassé l'objet ${terrainTile.item.type}`, [currentPlayer]);
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
                this.addItemEffect(actionPlayer, actionPlayer.inventory[i]);

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
                this.removeItemEffect(actionPlayer, actionPlayer.inventory[i]);
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

        const didPlayerTripped = this.didPlayerTripped(terrainTile.type, currentPlayer);
        if (didPlayerTripped) {
            this.signalUserGotTurnEnded.next();
            return;
        }

        this.checkIfPLayerDidEverything();
        this.setupPossibleMoves(currentPlayer);
    }

    addItemEffect(player: PlayerCharacter, item: Item) {
        switch (item.type) {
            case ItemType.Sword:
                player.attributes.attack += 2;
                player.attributes.defense -= 1;
                break;
            case ItemType.Chestplate:
                player.attributes.defense += 2;
                player.attributes.speed -= 1;
                break;
            case ItemType.Totem:
                player.attributes.defense -= 2;
                break;
            case ItemType.Elytra:
                player.attributes.speed += 1;
                break;
            default:
                break;
        }
    }

    removeItemEffect(player: PlayerCharacter, item: Item) {
        switch (item.type) {
            case ItemType.Sword:
                player.attributes.attack -= 2;
                player.attributes.defense += 1;
                break;
            case ItemType.Chestplate:
                player.attributes.defense -= 2;
                player.attributes.speed += 1;
                break;
            case ItemType.Totem:
                player.attributes.defense += 2;
                break;
            case ItemType.Elytra:
                player.attributes.speed -= 1;
                break;
            default:
                break;
        }
    }

    didPlayerTripped(tileType: TileType, player: PlayerCharacter): boolean {
        if (this.doesPlayerHaveItem(player, ItemType.Elytra)) {
            return false;
        }

        if (this.debugService.isDebugMode) {
            return false;
        }

        if (tileType === TileType.Ice) {
            const result = 0.1;
            if (Math.random() < result) {
                this.eventJournal.broadcastEvent('glissement', [this.eventJournal.player]);
                return true;
            }
        }
        return false;
    }

    async waitInterval(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    handlePlayerAction(tile: Tile) {
        const currentPlayer = this.getCurrentPlayerCharacter();

        if (!this.isUserTurn || !currentPlayer || currentPlayer.currentActionPoints <= 0) {
            return;
        }

        if (tile instanceof WalkableTile && tile.hasPlayer() && tile.player) {
            const playerCharacter = this.findPlayerFromPlayerMapEntity(tile.player);
            if (playerCharacter?.socketId) {
                this.signalUserDidBattleAction.next(playerCharacter.socketId);
                this.hidePossibleMoves();
            }
            return;
        }

        if (tile.isDoor()) {
            this.hidePossibleMoves();
            this.signalUserDidDoorAction.next(tile.coordinates);
            this.checkIfPLayerDidEverything();
            return;
        }
    }

    checkIfPLayerDidEverything() {
        const currentPlayer = this.getCurrentPlayerCharacter();

        if (currentPlayer && currentPlayer.currentMovePoints <= 0) {
            const currentPlayerTile = this.getCurrentPlayerTile();
            if (currentPlayer.currentActionPoints <= 0 || (currentPlayerTile && this.getAdjacentActionTiles(currentPlayerTile).length === 0)) {
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

    playerUsedAction(playerId: string) {
        const player = this.findPlayerFromSocketId(playerId);
        if (player) {
            player.currentActionPoints -= 1;
        }
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
            this.checkIfPlayerWonClassicGame(winnerPlayerCharacter);

            const currentLoserTile: WalkableTile = this.gameMapDataManagerService.getTileAt(
                loserPlayerCharacter.mapEntity.coordinates,
            ) as WalkableTile;
            if (loserPlayerCharacter === this.getCurrentPlayerCharacter()) {
                const spawnTile: WalkableTile = this.gameMapDataManagerService.getClosestWalkableTileWithoutPlayerAt(loserPlayerCharacter.mapEntity);
                this.signalUserRespawned.next({
                    fromTile: currentLoserTile.coordinates,
                    toTile: spawnTile.coordinates,
                });
            }

            this.userDropAllItems(currentLoserTile, loserPlayerCharacter);
        }
    }

    userDropAllItems(startTile: Tile, player: PlayerCharacter) {
        for (const item of player.inventory) {
            if (item.type !== ItemType.EmptyItem) {
                const closestTerrainTileWithoutItem = this.gameMapDataManagerService.getClosestTerrainTileWithoutItemAt(startTile);
                this.throwItem(player.socketId, item.type, closestTerrainTileWithoutItem.coordinates);
            }
        }
    }

    checkIfPlayerWonClassicGame(playerCharacter: PlayerCharacter) {
        if (this.gameMapDataManagerService.isGameModeCTF()) {
            return;
        }

        const currentPlayer = this.getCurrentPlayerCharacter();

        const value = 3;
        if (currentPlayer === playerCharacter && playerCharacter.fightWins >= value) {
            this.signalUserWon.next();
        }
    }

    checkIfPlayerWonCTFGame(playerCharacter: PlayerCharacter) {
        if (!this.gameMapDataManagerService.isGameModeCTF()) {
            return;
        }

        const currentPlayer = this.getCurrentPlayerCharacter();

        if (currentPlayer === playerCharacter && playerCharacter.mapEntity.isOnSpawn() && this.doesPlayerHaveItem(playerCharacter, ItemType.Flag)) {
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

            this.userDropAllItems(tile, playerCharacter);
        }

        if (!this.battleManagerService.isBattleOn) {
            this.continueTurn();
        }
    }

    doesPlayerHaveItem(player: PlayerCharacter, itemType: ItemType): boolean {
        return player.inventory.some((item) => item.type === itemType);
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
        this.userCurrentPossibleMoves = new Map();
        this.turnOrder = [];
        this.possibleItems = [];

        this.winnerPlayer = null;
    }
}
