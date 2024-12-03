/* eslint-disable max-lines */ // pour le moment, le service est trop complexe pour être simplifié

import { Injectable } from '@angular/core';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { Item } from '@common/classes/Items/item';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { DoorTile } from '@common/classes/Tiles/door-tile';
import { OpenDoor } from '@common/classes/Tiles/open-door';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';
import { ItemType } from '@common/enums/item-type';
import { ProfileEnum } from '@common/enums/profile';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject } from 'rxjs';
import { PlayGameBoardManagerService } from './play-game-board-manager.service';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerManagerService {
    signalMoveVirtualPlayer = new Subject<{ coordinates: Vec2; virtualPlayerId: string }>();
    signalMoveVirtualPlayer$ = this.signalMoveVirtualPlayer.asObservable();

    signalVirtualPlayerContinueTurn = new Subject<string>();
    signalVirtualPlayerContinueTurn$ = this.signalVirtualPlayerContinueTurn.asObservable();

    signalVirtualPlayerEndedTurn = new Subject<string>();
    signalVirtualPlayerEndedTurn$ = this.signalVirtualPlayerEndedTurn.asObservable();

    constructor(
        public playGameBoardManagerService: PlayGameBoardManagerService,
        public gameMapDataManagerService: GameMapDataManagerService,
        public webSocketService: WebSocketService,
    ) {}

    startTurn(playerId: string) {
        const virtualPlayer = this.playGameBoardManagerService.findPlayerFromSocketId(playerId);
        if (virtualPlayer) {
            this.handleVirtualPlayerTurn(virtualPlayer, true);
        }
    }

    continueTurn(playerId: string) {
        const virtualPlayer = this.playGameBoardManagerService.findPlayerFromSocketId(playerId);
        if (virtualPlayer) {
            this.handleVirtualPlayerTurn(virtualPlayer, false);
        }
    }

    setPossibleMoves(playerCharacter: PlayerCharacter): Map<Tile, Tile[]> {
        return this.gameMapDataManagerService.getPossibleMovementTiles(playerCharacter.mapEntity.coordinates, playerCharacter.currentMovePoints);
    }

    handleVirtualPlayerTurn(player: PlayerCharacter, didTurnStarted: boolean) {
        if (!player.isVirtual) return;

        if (player.comportement === ProfileEnum.Agressive) {
            this.handleAgressiveComportment(player, didTurnStarted);
        } else if (player.comportement === ProfileEnum.Defensive) {
            this.handleDefensiveComportment(player, didTurnStarted);
        }
    }

    handleAgressiveComportment(player: PlayerCharacter, didTurnStarted: boolean) {
        const didPlayerDoAction = this.handleAggressiveActions(player);

        if (!didPlayerDoAction) {
            this.handleAggressiveMovement(player, didTurnStarted);
        }
    }

    handleAggressiveActions(player: PlayerCharacter): boolean {
        if (player.currentActionPoints <= 0) {
            return false;
        }

        const playerTile = this.gameMapDataManagerService.getTileAt(player.mapEntity.coordinates) as Tile;
        const actionTiles: Tile[] = this.playGameBoardManagerService.getAdjacentActionTiles(playerTile);

        if (actionTiles.length === 0) {
            return false;
        }

        for (const actionTile of actionTiles) {
            if (actionTile instanceof WalkableTile && actionTile.hasPlayer() && actionTile.player) {
                const enemyPlayer = this.playGameBoardManagerService.findPlayerFromPlayerMapEntity(actionTile.player);
                if (enemyPlayer?.socketId) {
                    this.playGameBoardManagerService.signalUserDidBattleAction.next({
                        playerTurnId: player.socketId,
                        enemyPlayerId: enemyPlayer.socketId,
                    });
                    return true;
                }
            }
        }

        for (const actionTile of actionTiles) {
            if (actionTile instanceof DoorTile) {
                this.playGameBoardManagerService.signalUserDidDoorAction.next({
                    tileCoordinate: actionTile.coordinates,
                    playerTurnId: player.socketId,
                });
                this.playGameBoardManagerService.checkIfPLayerDidEverything(player);
                this.signalVirtualPlayerContinueTurn.next(player.socketId);
                return true;
            }
        }

        return false;
    }

    handleAggressiveMovement(player: PlayerCharacter, didTurnStarted: boolean) {
        const possibleMoves = this.setPossibleMoves(player);
        let targetTile: Tile | null = null;

        const targetPlayerTile = this.findNearestPossiblePlayer(player, possibleMoves);
        if (targetPlayerTile) {
            targetTile = targetPlayerTile;
        } else {
            const targetItemTile = this.findNearestPossibleItem(player, possibleMoves);
            if (targetItemTile) {
                targetTile = targetItemTile;
            } else {
                const targetDoorTile = this.findNearestClosedDoor(player, possibleMoves);
                if (targetDoorTile) {
                    targetTile = targetDoorTile;
                } else {
                    if (didTurnStarted) {
                        const possibleMovesArray = Array.from(possibleMoves.keys());
                        targetTile = possibleMovesArray[Math.floor(Math.random() * possibleMovesArray.length)];
                    } else {
                        this.signalVirtualPlayerEndedTurn.next(player.socketId);
                    }
                }
            }
        }

        if (targetTile) {
            const playerTile = this.gameMapDataManagerService.getTileAt(player.mapEntity.coordinates) as Tile;
            if (this.areTilesEqual(playerTile, targetTile)) {
                this.signalVirtualPlayerEndedTurn.next(player.socketId);
                return;
            }

            this.playGameBoardManagerService.signalUserStartedMoving.next(player.socketId);
            this.signalMoveVirtualPlayer.next({ coordinates: targetTile.coordinates, virtualPlayerId: player.socketId });
        }
    }

    handleDefensiveComportment(player: PlayerCharacter, didTurnStarted: boolean) {
        const didPlayerDoAction = this.handleDefensiveActions(player, didTurnStarted);

        if (!didPlayerDoAction) {
            this.handleDefensiveMovement(player, didTurnStarted);
        }
    }

    handleDefensiveActions(player: PlayerCharacter, didTurnStarted: boolean): boolean {
        if (player.currentActionPoints <= 0 || didTurnStarted) {
            return false;
        }

        const playerTile = this.gameMapDataManagerService.getTileAt(player.mapEntity.coordinates) as Tile;
        const actionTiles: Tile[] = this.playGameBoardManagerService.getAdjacentActionTiles(playerTile);

        if (actionTiles.length === 0) {
            return false;
        }

        for (const actionTile of actionTiles) {
            if (actionTile instanceof OpenDoor && !actionTile.hasPlayer()) {
                this.playGameBoardManagerService.signalUserDidDoorAction.next({
                    tileCoordinate: actionTile.coordinates,
                    playerTurnId: player.socketId,
                });
                this.playGameBoardManagerService.checkIfPLayerDidEverything(player);
                this.signalVirtualPlayerContinueTurn.next(player.socketId);
                return true;
            }
        }

        return false;
    }

    handleDefensiveMovement(player: PlayerCharacter, didTurnStarted: boolean) {
        const possibleMoves = this.setPossibleMoves(player);
        let targetTile: Tile | null = null;

        const itemTile = this.findNearestPossibleItem(player, possibleMoves);
        if (itemTile) {
            targetTile = itemTile;
        } else {
            const nearestOpenDoorTile = this.findNearestOpenDoor(player, possibleMoves);
            if (nearestOpenDoorTile) {
                targetTile = nearestOpenDoorTile;
            } else {
                const furthestTileFromPlayers = this.findFurthestTileFromPlayers(player, possibleMoves);
                if (furthestTileFromPlayers) {
                    targetTile = furthestTileFromPlayers;
                } else {
                    if (didTurnStarted) {
                        const possibleMovesArray = Array.from(possibleMoves.keys());
                        targetTile = possibleMovesArray[Math.floor(Math.random() * possibleMovesArray.length)];
                    } else {
                        this.signalVirtualPlayerEndedTurn.next(player.socketId);
                        return;
                    }
                }
            }
        }

        if (targetTile) {
            const playerTile = this.gameMapDataManagerService.getTileAt(player.mapEntity.coordinates) as Tile;
            if (this.areTilesEqual(playerTile, targetTile)) {
                this.signalVirtualPlayerEndedTurn.next(player.socketId);
                return;
            }

            this.playGameBoardManagerService.signalUserStartedMoving.next(player.socketId);
            this.signalMoveVirtualPlayer.next({ coordinates: targetTile.coordinates, virtualPlayerId: player.socketId });
        }
    }

    findFurthestTileFromPlayers(player: PlayerCharacter, possibleMoves: Map<Tile, Tile[]>): WalkableTile | null {
        const players = this.webSocketService.getRoomInfo().players;
        let furthestTile: WalkableTile | null = null;
        let maxDistance = 0;

        for (const possibleMove of possibleMoves.keys()) {
            let minDistanceToAnyPlayer = Number.MAX_SAFE_INTEGER;

            for (const otherPlayer of players) {
                if (otherPlayer.socketId !== player.socketId) {
                    const playerTile = this.gameMapDataManagerService.getTileAt(otherPlayer.mapEntity.coordinates) as Tile;
                    const distance = this.calculateDistance(possibleMove.coordinates, playerTile.coordinates);
                    if (distance < minDistanceToAnyPlayer) {
                        minDistanceToAnyPlayer = distance;
                    }
                }
            }

            if (minDistanceToAnyPlayer > maxDistance) {
                maxDistance = minDistanceToAnyPlayer;
                furthestTile = possibleMove as WalkableTile;
            }
        }

        if (!furthestTile && possibleMoves.size > 0) {
            const possibleMovesArray = Array.from(possibleMoves.keys());
            furthestTile = possibleMovesArray[Math.floor(Math.random() * possibleMovesArray.length)] as WalkableTile;
        }

        return furthestTile;
    }

    findNearestOpenDoor(player: PlayerCharacter, possibleMoves: Map<Tile, Tile[]>): OpenDoor | null {
        let nearestOpenDoor: OpenDoor | null = null;
        let minDistance = Number.MAX_SAFE_INTEGER;

        for (const possibleMove of possibleMoves.keys()) {
            if (possibleMove instanceof OpenDoor) {
                const distance = this.calculateDistance(player.mapEntity.coordinates, possibleMove.coordinates);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestOpenDoor = possibleMove;
                }
            }
        }

        if (nearestOpenDoor) {
            const adjacentTiles = this.gameMapDataManagerService.getNeighbours(nearestOpenDoor);
            const accessibleTiles = adjacentTiles.filter(
                (tile) =>
                    tile instanceof WalkableTile &&
                    (!tile.hasPlayer() || (tile.player && this.playGameBoardManagerService.findPlayerFromPlayerMapEntity(tile.player) !== player)) &&
                    Array.from(possibleMoves.keys()).some((possibleMoveTile) => this.areTilesEqual(possibleMoveTile, tile)),
            );

            if (accessibleTiles.length > 0) {
                nearestOpenDoor = accessibleTiles[0] as OpenDoor;
            }
        }
        return nearestOpenDoor;
    }

    findNearestClosedDoor(player: PlayerCharacter, possibleMoves: Map<Tile, Tile[]>): WalkableTile | null {
        for (const possibleMove of possibleMoves.keys()) {
            const adjacentTiles = this.gameMapDataManagerService.getNeighbours(possibleMove);
            for (const adjacentTile of adjacentTiles) {
                if (adjacentTile instanceof DoorTile) {
                    return possibleMove as WalkableTile;
                }
            }
        }

        return null;
    }

    findNearestPossiblePlayer(virtualPlayer: PlayerCharacter, possibleMoves: Map<Tile, Tile[]>): WalkableTile | null {
        const players = this.webSocketService.getRoomInfo().players;
        let nearestTile: WalkableTile | null = null;
        let minDistance = Number.MAX_SAFE_INTEGER;

        for (const player of players) {
            if (player.socketId !== virtualPlayer.socketId) {
                const playerTile = this.gameMapDataManagerService.getTileAt(player.mapEntity.coordinates) as Tile;
                const adjacentTilesToPlayer = this.gameMapDataManagerService.getNeighbours(playerTile);

                const reachableAdjacentTiles = adjacentTilesToPlayer.filter((adjacentTile) =>
                    Array.from(possibleMoves.keys()).some((possibleMoveTile) => this.areTilesEqual(possibleMoveTile, adjacentTile)),
                );

                for (const reachableAdjacentTile of reachableAdjacentTiles) {
                    const distance = this.calculateDistance(virtualPlayer.mapEntity.coordinates, reachableAdjacentTile.coordinates);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestTile = reachableAdjacentTile as WalkableTile;
                    }
                }
            }
        }

        return nearestTile;
    }

    findNearestPossibleItem(virtualPlayer: PlayerCharacter, possibleMoves: Map<Tile, Tile[]>): TerrainTile | null {
        let nearestTile: TerrainTile | null = null;
        let highestPriority = -1;
        let minDistance = Number.MAX_SAFE_INTEGER;

        for (const possibleMove of possibleMoves.keys()) {
            if (possibleMove.isTerrain()) {
                const item = (possibleMove as TerrainTile).item;
                if (item && item.isGrabbable()) {
                    let priority = 0;
                    if (virtualPlayer.comportement === ProfileEnum.Agressive) {
                        priority = this.getAggressivePlayerItemPriority(item.type);
                    } else if (virtualPlayer.comportement === ProfileEnum.Defensive) {
                        priority = this.getDefensivePlayerItemPriority(item.type);
                    }

                    const distance = this.calculateDistance(virtualPlayer.mapEntity.coordinates, possibleMove.coordinates);

                    if (priority > highestPriority || (priority === highestPriority && distance < minDistance)) {
                        highestPriority = priority;
                        minDistance = distance;
                        nearestTile = possibleMove as TerrainTile;
                    }
                }
            }
        }

        return nearestTile;
    }

    getAggressivePlayerItemPriority(itemType: ItemType): number {
        const AGGRESSIVE_PRIORITY = {
            [ItemType.Sword]: 10,
            [ItemType.Flag]: 10,
            [ItemType.Totem]: 8,
        };

        return AGGRESSIVE_PRIORITY[itemType as keyof typeof AGGRESSIVE_PRIORITY] || 0;
    }

    getDefensivePlayerItemPriority(itemType: ItemType): number {
        const DEFENSIVE_PRIORITY = {
            [ItemType.MagicShield]: 10,
            [ItemType.Flag]: 10,
            [ItemType.Chestplate]: 9,
            [ItemType.EnchantedBook]: 8,
        };

        return DEFENSIVE_PRIORITY[itemType as keyof typeof DEFENSIVE_PRIORITY] || 0;
    }

    calculateDistance(from: Vec2, to: Vec2): number {
        return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
    }

    areTilesEqual(tile1: Tile, tile2: Tile): boolean {
        return tile1.coordinates.x === tile2.coordinates.x && tile1.coordinates.y === tile2.coordinates.y;
    }

    moveVirtualPlayer(virtualPlayerId: string, destination: Vec2) {
        const player = this.playGameBoardManagerService.findPlayerFromSocketId(virtualPlayerId);

        if (!player) {
            return;
        }
        const possibleMoves = this.setPossibleMoves(player);

        const lastTile: WalkableTile = this.gameMapDataManagerService.getTileAt(player.mapEntity.coordinates) as WalkableTile;

        const path = possibleMoves.get(this.gameMapDataManagerService.getTileAt(destination) as WalkableTile);
        if (!path) {
            return;
        }
        const nextPathTile = path[1];
        if (!nextPathTile) {
            this.playGameBoardManagerService.signalUserFinishedMoving.next(player.socketId);
            this.playGameBoardManagerService.checkIfPLayerDidEverything(player);
            this.signalVirtualPlayerContinueTurn.next(player.socketId);
            return;
        }

        this.playGameBoardManagerService.signalUserMoved.next({
            fromTile: lastTile.coordinates,
            toTile: nextPathTile.coordinates,
            playerTurnId: player.socketId,
            isTeleport: false,
        });

        if (this.checkIfVirtualPlayerWonCTFGame(player, nextPathTile)) {
            return;
        }

        const possibleItems: Item[] = [];
        const didGrabItem = this.playGameBoardManagerService.handleTileItem(nextPathTile, player, possibleItems);
        if (didGrabItem) {
            if (possibleItems.length > 0) {
                this.throwItemInListAndKeepTheRest(player, possibleItems, nextPathTile);
            }

            if (this.didPlayerTripped(nextPathTile, player)) {
                return;
            }

            this.playGameBoardManagerService.signalUserFinishedMoving.next(player.socketId);
            this.playGameBoardManagerService.checkIfPLayerDidEverything(player);
            this.signalVirtualPlayerContinueTurn.next(player.socketId);
            return;
        }

        if (this.didPlayerTripped(nextPathTile, player)) {
            return;
        }

        this.signalMoveVirtualPlayer.next({ coordinates: destination, virtualPlayerId: player.socketId });
    }

    didPlayerTripped(tile: Tile, player: PlayerCharacter): boolean {
        if (this.playGameBoardManagerService.didPlayerTripped(tile.type, player)) {
            this.playGameBoardManagerService.signalUserFinishedMoving.next(player.socketId);
            this.playGameBoardManagerService.signalUserGotTurnEnded.next(player.socketId);
            return true;
        }
        return false;
    }

    throwItemInListAndKeepTheRest(player: PlayerCharacter, possibleItems: Item[], nextPathTile: Tile) {
        // TODO: Choose item to throw based on priority
        const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];
        this.throwItem(player, possibleItems, item, nextPathTile);
    }

    throwItem(player: PlayerCharacter, possibleItems: Item[], item: Item, nextPathTile: Tile) {
        const terrainTile = nextPathTile as TerrainTile;

        const lastItem = possibleItems.pop();
        if (item !== lastItem) {
            this.playGameBoardManagerService.signalUserThrewItem.next({
                itemType: item.type,
                tileCoordinates: terrainTile.coordinates,
                playerTurnId: player.socketId,
            });
            if (terrainTile.item) {
                this.playGameBoardManagerService.signalUserGrabbedItem.next({
                    itemType: terrainTile.item.type,
                    tileCoordinates: terrainTile.coordinates,
                    playerTurnId: player.socketId,
                });
            }
        }
    }

    wonBattle(playerId: string) {
        const virtualPlayer = this.playGameBoardManagerService.findPlayerFromSocketId(playerId);
        if (virtualPlayer) {
            this.checkIfPlayerWonClassicGame(virtualPlayer);
        }
    }

    lostBattle(playerId: string) {
        const virtualPlayer = this.playGameBoardManagerService.findPlayerFromSocketId(playerId);
        if (virtualPlayer) {
            const playerTile = this.gameMapDataManagerService.getTileAt(virtualPlayer.mapEntity.coordinates) as WalkableTile;
            const spawnTile = this.gameMapDataManagerService.getClosestWalkableTileWithoutPlayerAt(virtualPlayer.mapEntity) as WalkableTile;

            this.playGameBoardManagerService.signalUserRespawned.next({
                playerTurnId: virtualPlayer.socketId,
                fromTile: playerTile.coordinates,
                toTile: spawnTile.coordinates,
            });
        }
    }

    checkIfPlayerWonClassicGame(player: PlayerCharacter) {
        if (this.gameMapDataManagerService.isGameModeCTF()) {
            return;
        }

        const value = 3;
        if (player.fightWins >= value) {
            this.playGameBoardManagerService.signalUserWon.next(player.socketId);
        }
    }

    checkIfVirtualPlayerWonCTFGame(player: PlayerCharacter, newPlayerTile: Tile): boolean {
        if (!this.gameMapDataManagerService.isGameModeCTF()) {
            return false;
        }

        const spawnTile = this.gameMapDataManagerService.getTileAt(player.mapEntity.spawnCoordinates) as WalkableTile;

        if (this.areTilesEqual(spawnTile, newPlayerTile) && this.playGameBoardManagerService.doesPlayerHaveItem(player, ItemType.Flag)) {
            this.playGameBoardManagerService.signalUserWon.next(player.socketId);
            return true;
        }

        return false;
    }
}
