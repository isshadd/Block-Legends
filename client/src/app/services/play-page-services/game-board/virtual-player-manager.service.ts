import { Injectable } from '@angular/core';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';
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

    constructor(
        public playGameBoardManagerService: PlayGameBoardManagerService,
        public gameMapDataManagerService: GameMapDataManagerService,
        public webSocketService: WebSocketService,
    ) {}

    startTurn(playerId: string) {
        const virtualPlayer = this.playGameBoardManagerService.findPlayerFromSocketId(playerId);
        if (virtualPlayer) {
            this.handleVirtualPlayerTurn(virtualPlayer);
        }
    }

    setPossibleMoves(playerCharacter: PlayerCharacter): Map<Tile, Tile[]> {
        return this.gameMapDataManagerService.getPossibleMovementTiles(playerCharacter.mapEntity.coordinates, playerCharacter.currentMovePoints);
    }

    handleVirtualPlayerTurn(player: PlayerCharacter) {
        if (!player.isVirtual) return;

        if (player.comportement === ProfileEnum.Agressive) {
            this.handleAgressiveComportment(player);
        }
        // else if(player.profile === ProfileEnum.defensive) {
        //     this.handleDefensiveComportment(player);
        // }
    }

    private handleAgressiveComportment(player: PlayerCharacter) {
        const possibleMoves = this.setPossibleMoves(player);
        const targetPlayer = this.findNearestPlayer(player) as PlayerCharacter;
        // const targetItemTile = this.findNearestItem();
        // let targetTileIfItem: Tile | null = null;

        // const targetPlayerTileFound = Array.from(possibleMoves.keys()).some(
        //     (tile) => this.calculateDistance(tile.coordinates, targetPlayer.mapEntity.coordinates) === 1 && tile.isWalkable(),
        // );

        // const targetItemTileFound = Array.from(possibleMoves.keys()).some((tile) => {
        //     this.calculateDistance(tile.coordinates, targetItemTile?.coordinates as Vec2) === 0;
        //     targetTileIfItem = tile;
        // });

        const targetTile = this.gameMapDataManagerService.getTileAt(targetPlayer.mapEntity.coordinates) as Tile;
        const adjacentTilesToPlayer = this.gameMapDataManagerService.getNeighbours(targetTile);

        const reachableAdjacentTiles = adjacentTilesToPlayer.filter((adjacentTile) =>
            Array.from(possibleMoves.keys()).some((possibleMoveTile) => this.areTilesEqual(possibleMoveTile, adjacentTile)),
        );

        if (reachableAdjacentTiles.length > 0) {
            const moveToTile = reachableAdjacentTiles[Math.floor(Math.random() * reachableAdjacentTiles.length)];
            this.playGameBoardManagerService.signalUserStartedMoving.next(player.socketId);
            this.signalMoveVirtualPlayer.next({ coordinates: moveToTile.coordinates, virtualPlayerId: player.socketId });
            // this.startVPBattle(player.socketId, targetPlayer.socketId);
        }
        // } else if (targetItemTileFound && targetTileIfItem) {
        //     this.moveVirtualPlayer(targetTileIfItem);
        //
        else {
            const possibleMovesArray = Array.from(possibleMoves.keys());
            const targetTile = possibleMovesArray[Math.floor(Math.random() * possibleMovesArray.length)];
            this.playGameBoardManagerService.signalUserStartedMoving.next(player.socketId);
            this.signalMoveVirtualPlayer.next({ coordinates: targetTile.coordinates, virtualPlayerId: player.socketId });
        }
    }

    findNearestPlayer(virtualPlayer: PlayerCharacter): PlayerCharacter | null {
        const players = this.webSocketService.getRoomInfo().players;
        let nearestPlayer: PlayerCharacter | null = null;
        let minDistance = Number.MAX_SAFE_INTEGER;

        for (const player of players) {
            if (player.socketId !== virtualPlayer.socketId) {
                const distance = this.calculateDistance(virtualPlayer.mapEntity.coordinates, player.mapEntity.coordinates);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestPlayer = player;
                }
            }
        }

        return nearestPlayer;
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
        let didPlayerTripped = false;

        const path = possibleMoves.get(this.gameMapDataManagerService.getTileAt(destination) as WalkableTile);
        if (!path) {
            return;
        }
        const nextPathTile = path[1];
        if (!nextPathTile) {
            this.playGameBoardManagerService.signalUserFinishedMoving.next(player.socketId);
            return;
        }

        this.playGameBoardManagerService.signalUserMoved.next({
            fromTile: lastTile.coordinates,
            toTile: nextPathTile.coordinates,
            playerTurnId: player.socketId,
        });

        didPlayerTripped = this.playGameBoardManagerService.didPlayerTripped(nextPathTile.type, player);
        if (didPlayerTripped) {
            this.playGameBoardManagerService.signalUserGotTurnEnded.next(player.socketId);
            return;
        }

        this.signalMoveVirtualPlayer.next({ coordinates: destination, virtualPlayerId: player.socketId });

        // const didGrabItem = this.handleTileItem(pathTile);
        // if (this.possibleItems.length > 0) {
        //     this.signalUserFinishedMoving.next();
        //     return;
        // }

        // if (didGrabItem) {
        //     break; // SI LE JOUEUR A PRIS UN ITEM, ON ARRETE DE SE DEPLACER
        // }

        // this.checkIfPLayerDidEverything();
        // this.setupPossibleMoves(userPlayerCharacter);
    }

    getCurrentVirtualPlayerCharacter(): PlayerCharacter | null {
        return (
            this.webSocketService.getRoomInfo().players.find((player) => player.isVirtual && player.socketId !== this.webSocketService.socket.id) ||
            null
        );
    }

    // getPlayerTile(player: PlayerCharacter): Tile {
    //     return this.gameMapDataManagerService.getTileAt(player.mapEntity.coordinates) as Tile;
    // }

    // getCurrentVirtualPlayerTile(): Tile | null {
    //     const player = this.getCurrentPlayerCharacter();

    //     if (!player) {
    //         return null;
    //     }

    //     return this.gameMapDataManagerService.getTileAt(player.mapEntity.coordinates);
    // }

    // findNearestItem(): Tile | null {
    //     const currentPlayer = this.findPlayerFromSocketId(this.currentPlayerIdTurn);
    //     if (!currentPlayer) {
    //         return null;
    //     }

    //     const items = this.gameMapDataManagerService.getTilesWithItem();
    //     let nearestItem: Tile | null = null;
    //     let minDistance = Number.MAX_SAFE_INTEGER;

    //     for (const item of items) {
    //         const distance = this.calculateDistance(currentPlayer.mapEntity.coordinates, item.coordinates);
    //         if (distance < minDistance) {
    //             minDistance = distance;
    //             nearestItem = item;
    //         }
    //     }

    //     return nearestItem;
    // }

    // startVPBattle(playerId: string, enemyPlayerId: string) {
    //     const currentPlayer = this.getCurrentVirtualPlayerCharacter();
    //     if (!currentPlayer) return;

    //     if (currentPlayer.socketId !== playerId && currentPlayer.socketId !== enemyPlayerId) {
    //         this.areOtherPlayersInBattle = true;
    //         return;
    //     }

    //     let opponentPlayer: PlayerCharacter | null;
    //     if (currentPlayer.socketId === playerId) {
    //         opponentPlayer = this.findPlayerFromSocketId(enemyPlayerId);
    //     } else {
    //         opponentPlayer = this.findPlayerFromSocketId(playerId);
    //     }

    //     if (!opponentPlayer) return;

    //     this.battleManagerService.init(currentPlayer, opponentPlayer);
    // }
}
