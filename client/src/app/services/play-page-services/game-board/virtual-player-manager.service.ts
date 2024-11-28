import { Injectable } from '@angular/core';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { Item } from '@common/classes/Items/item';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { DoorTile } from '@common/classes/Tiles/door-tile';
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
        }
        // else if(player.profile === ProfileEnum.defensive) {
        //     this.handleDefensiveComportment(player);
        // }
    }

    private handleAgressiveComportment(player: PlayerCharacter, didTurnStarted: boolean) {
        const didPlayerDoAction = this.handleAggressiveActions(player);

        if (!didPlayerDoAction) {
            this.handleAggressiveMovement(player, didTurnStarted);
        }
    }

    private handleAggressiveActions(player: PlayerCharacter): boolean {
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

    private handleAggressiveMovement(player: PlayerCharacter, didTurnStarted: boolean) {
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
                // TODO : Check for closed Doors
                if (didTurnStarted) {
                    const possibleMovesArray = Array.from(possibleMoves.keys());
                    targetTile = possibleMovesArray[Math.floor(Math.random() * possibleMovesArray.length)];
                } else {
                    this.signalVirtualPlayerEndedTurn.next(player.socketId);
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
        const excludeTypes = [ItemType.Spawn, ItemType.EmptyItem, ItemType.Random];
        let nearestTile: TerrainTile | null = null;
        let minDistance = Number.MAX_SAFE_INTEGER;

        for (const possibleMove of possibleMoves.keys()) {
            if (possibleMove.isTerrain()) {
                const item = (possibleMove as TerrainTile).item;
                if (item && !excludeTypes.includes(item.type)) {
                    const distance = this.calculateDistance(virtualPlayer.mapEntity.coordinates, possibleMove.coordinates);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestTile = possibleMove as TerrainTile;
                    }
                }
            }
        }

        return nearestTile;
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

        let lastTile: WalkableTile = this.gameMapDataManagerService.getTileAt(player.mapEntity.coordinates) as WalkableTile;

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
        });

        let possibleItems: Item[] = [];
        const didGrabItem = this.playGameBoardManagerService.handleTileItem(nextPathTile, player, possibleItems);
        if (didGrabItem) {
            this.playGameBoardManagerService.signalUserFinishedMoving.next(player.socketId);

            if (possibleItems.length > 0) {
                // TODO Choose what item to throw
                return;
            }

            this.playGameBoardManagerService.checkIfPLayerDidEverything(player);
            this.signalVirtualPlayerContinueTurn.next(player.socketId);
            return;
        }

        const didPlayerTripped = this.playGameBoardManagerService.didPlayerTripped(nextPathTile.type, player);
        if (didPlayerTripped) {
            this.playGameBoardManagerService.signalUserFinishedMoving.next(player.socketId);
            this.playGameBoardManagerService.signalUserGotTurnEnded.next(player.socketId);
            return;
        }

        this.signalMoveVirtualPlayer.next({ coordinates: destination, virtualPlayerId: player.socketId });
    }
}
