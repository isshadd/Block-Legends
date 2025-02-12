import { Injectable, OnDestroy } from '@angular/core';
import { DebugService } from '@app/services/debug-service/debug.service';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager/play-game-board-manager.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Tile } from '@common/classes/Tiles/tile';
import { VisibleState } from '@common/interfaces/placeable-entity';
import { Subject, Subscription, takeUntil } from 'rxjs';

enum MouseButton {
    Left = 0,
    Right = 2,
}

@Injectable({
    providedIn: 'root',
})
export class PlayPageMouseHandlerService implements OnDestroy {
    rightClickSelectedPlayerCharacter: PlayerCharacter | null = null;
    rightSelectedTile: Tile | null = null;

    lastTilePath: Tile[] = [];
    actionTiles: Tile[] = [];
    isActionOpen: boolean = false;

    private destroy$ = new Subject<void>();
    private subscriptions: Subscription = new Subscription();

    constructor(
        public playGameBoardManagerService: PlayGameBoardManagerService,
        public debugService: DebugService,
    ) {
        this.subscriptions.add(
            playGameBoardManagerService.signalUserStartedMoving$.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.clearUI();
            }),
        );
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.subscriptions.unsubscribe();
    }

    onMapTileMouseDown(event: MouseEvent, tile: Tile) {
        if (event.button === MouseButton.Left) {
            this.handleLeftClick(tile);
        } else if (event.button === MouseButton.Right) {
            this.handleRightClick(event, tile);
        }
    }

    onMapTileMouseEnter(tile: Tile) {
        const possibleTileMove = this.playGameBoardManagerService.userCurrentPossibleMoves.get(tile);

        if (possibleTileMove) {
            this.lastTilePath = possibleTileMove;
            this.lastTilePath.forEach((possibleTile) => {
                if (!this.actionTiles.includes(possibleTile)) {
                    possibleTile.visibleState = VisibleState.Selected;
                }
            });
        } else if (!this.actionTiles.includes(tile)) {
            tile.visibleState = VisibleState.Hovered;
        }
    }

    onMapTileMouseLeave(tile: Tile) {
        if (this.lastTilePath.length) {
            for (const pathTile of this.lastTilePath) {
                pathTile.visibleState = VisibleState.Valid;
            }
            this.lastTilePath = [];
        } else {
            const possibleTileMove = this.playGameBoardManagerService.userCurrentPossibleMoves.get(tile);

            tile.visibleState = possibleTileMove ? VisibleState.Valid : VisibleState.NotSelected;
        }
    }

    handleLeftClick(tile: Tile) {
        this.discardRightClickSelectedPlayer();
        this.discardRightSelectedTile();

        if (this.actionTiles.includes(tile)) {
            this.clearUI();
            this.playGameBoardManagerService.handlePlayerAction(tile);
        } else {
            this.playGameBoardManagerService.moveUserPlayer(tile);
        }
    }

    handleDebugRightClick(event: MouseEvent, tile: Tile) {
        if (this.debugService.isPlayerMoving) return;
        this.playGameBoardManagerService.teleportPlayer(tile);
        event.preventDefault();
    }

    handleRightClick(event: MouseEvent, tile: Tile) {
        this.discardRightClickSelectedPlayer();
        this.discardRightSelectedTile();

        if (this.debugService.isDebugMode) this.handleDebugRightClick(event, tile);
        else {
            this.rightSelectedTile = tile;
            event.preventDefault();
        }
    }

    toggleAction(): void {
        if (this.playGameBoardManagerService.isUserTurn) {
            this.isActionOpen = !this.isActionOpen;

            const userPlayer = this.playGameBoardManagerService.getCurrentPlayerCharacter();
            if (userPlayer && userPlayer.currentActionPoints <= 0) {
                this.isActionOpen = false;
            }

            if (userPlayer && this.isActionOpen) {
                const userTile = this.playGameBoardManagerService.getPlayerTile(userPlayer);
                if (!userTile) return;

                this.actionTiles = this.playGameBoardManagerService.getAdjacentActionTiles(userTile);
                this.actionTiles.forEach((tile) => (tile.visibleState = VisibleState.Action));
            } else {
                this.actionTiles.forEach((tile) => {
                    tile.visibleState = this.playGameBoardManagerService.userCurrentPossibleMoves.has(tile)
                        ? VisibleState.Valid
                        : VisibleState.NotSelected;
                });
                this.actionTiles = [];
            }
        }
    }

    endTurn(): void {
        this.clearUI();
    }

    clearUI(): void {
        for (const tile of this.actionTiles) {
            tile.visibleState = VisibleState.NotSelected;
        }

        this.actionTiles = [];
        this.lastTilePath = [];
        this.isActionOpen = false;
        this.rightClickSelectedPlayerCharacter = null;
        this.rightSelectedTile = null;
    }

    discardRightClickSelectedPlayer(): void {
        this.rightClickSelectedPlayerCharacter = null;
    }

    discardRightSelectedTile(): void {
        this.rightSelectedTile = null;
    }
}
