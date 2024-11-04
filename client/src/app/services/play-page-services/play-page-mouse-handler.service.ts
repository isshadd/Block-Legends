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

    onMapTileMouseUp(tile: Tile) {}

    onMapTileMouseEnter(tile: Tile) {
        const possibleTileMove = this.playGameBoardManagerService.userCurrentPossibleMoves.get(tile);

        if (possibleTileMove) {
            for (const tile of possibleTileMove) {
                tile.visibleState = VisibleState.Selected;
            }
            this.lastTilePath = possibleTileMove;
        } else {
            tile.visibleState = VisibleState.Hovered;
        }
    }

    onMapTileMouseLeave(tile: Tile) {
        if (this.lastTilePath.length) {
            for (const tile of this.lastTilePath) {
                tile.visibleState = VisibleState.Valid;
            }
            this.lastTilePath = [];
        } else {
            const possibleTileMove = this.playGameBoardManagerService.userCurrentPossibleMoves.get(tile);

            if (possibleTileMove) {
                tile.visibleState = VisibleState.Valid;
            } else {
                tile.visibleState = VisibleState.NotSelected;
            }
        }
    }

    handleLeftClick(tile: Tile) {
        this.playGameBoardManagerService.moveUserPlayer(tile);
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

    endTurn(): void {
        this.clearUI();
    }

    clearUI(): void {
        this.lastTilePath = [];
    }

    discardRightClickSelecterPlayer(): void {
        this.rightClickSelectedPlayerCharacter = null;
    }

    discardRightSelectedTile(): void {
        this.rightSelectedTile = null;
    }
}
