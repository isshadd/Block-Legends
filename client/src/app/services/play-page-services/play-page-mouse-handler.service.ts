import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { Subject, takeUntil } from 'rxjs';
import { PlayGameBoardManagerService } from './game-board/play-game-board-manager.service';

enum MouseButton {
    Left = 0,
    Right = 2,
}

@Injectable({
    providedIn: 'root',
})
export class PlayPageMouseHandlerService {
    private destroy$ = new Subject<void>();

    rightClickSelectedPlayerCharacter: PlayerCharacter | null = null;
    rightSelectedTile: Tile | null = null;

    lastTilePath: Tile[] = [];
    actionTiles: Tile[] = [];
    isActionOpen: boolean = false;

    constructor(public playGameBoardManagerService: PlayGameBoardManagerService) {
        playGameBoardManagerService.signalUserStartedMoving$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.clearUI();
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onMapTileMouseDown(event: MouseEvent, tile: Tile) {
        if (event.button === MouseButton.Left) {
            this.handleLeftClick(tile);
        } else if (event.button === MouseButton.Right) {
            this.handleRightClick(tile);
        }
    }

    onMapTileMouseEnter(tile: Tile) {
        const possibleTileMove = this.playGameBoardManagerService.userCurrentPossibleMoves.get(tile);

        if (possibleTileMove) {
            for (const tile of possibleTileMove) {
                if (!this.actionTiles.includes(tile)) {
                    tile.visibleState = VisibleState.Selected;
                }
            }
            this.lastTilePath = possibleTileMove;
        } else if (!this.actionTiles.includes(tile)) {
            tile.visibleState = VisibleState.Hovered;
        }
    }

    onMapTileMouseLeave(tile: Tile) {
        if (this.lastTilePath.length) {
            for (const tile of this.lastTilePath) {
                if (!this.actionTiles.includes(tile)) {
                    tile.visibleState = VisibleState.Valid;
                }
            }
            this.lastTilePath = [];
        } else if (!this.actionTiles.includes(tile)) {
            const possibleTileMove = this.playGameBoardManagerService.userCurrentPossibleMoves.get(tile);

            if (possibleTileMove) {
                tile.visibleState = VisibleState.Valid;
            } else {
                tile.visibleState = VisibleState.NotSelected;
            }
        }
    }

    handleLeftClick(tile: Tile) {
        if (this.actionTiles.includes(tile)) {
            this.clearUI();
            this.playGameBoardManagerService.handlePlayerAction(tile);
        } else {
            this.playGameBoardManagerService.moveUserPlayer(tile);
        }
    }

    handleRightClick(tile: Tile) {
        if (tile.isTerrain() && (tile as TerrainTile).player) {
            const player = (tile as TerrainTile).player;
            if (player) {
                this.discardRightSelectedTile();
                this.rightClickSelectedPlayerCharacter = this.playGameBoardManagerService.findPlayerFromPlayerMapEntity(player);
            }
        } else {
            this.discardRightClickSelecterPlayer();
            this.rightSelectedTile = tile;
        }
    }

    toggleAction(): void {
        if (this.playGameBoardManagerService.isUserTurn) {
            this.isActionOpen = !this.isActionOpen;

            if (this.playGameBoardManagerService.userCurrentActionPoints <= 0) {
                this.isActionOpen = false;
            }

            if (this.isActionOpen) {
                const userTile = this.playGameBoardManagerService.getCurrentPlayerTile();
                if (!userTile) return;

                this.actionTiles = this.playGameBoardManagerService.getAdjacentActionTiles(userTile);
                for (const tile of this.actionTiles) {
                    tile.visibleState = VisibleState.Action;
                }
            } else {
                for (const tile of this.actionTiles) {
                    const possibleTileMove = this.playGameBoardManagerService.userCurrentPossibleMoves.get(tile);

                    if (possibleTileMove) {
                        tile.visibleState = VisibleState.Valid;
                    } else {
                        tile.visibleState = VisibleState.NotSelected;
                    }
                }
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
    }

    discardRightClickSelecterPlayer(): void {
        this.rightClickSelectedPlayerCharacter = null;
    }

    discardRightSelectedTile(): void {
        this.rightSelectedTile = null;
    }
}
