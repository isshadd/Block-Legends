import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { PlayGameBoardManagerService } from './game-board/play-game-board-manager.service';

@Injectable({
    providedIn: 'root',
})
export class PlayPageMouseHandlerService {
    rightClickSelectedPlayerCharacter: PlayerCharacter | null = null;
    rightSelectedTile: Tile | null = null;

    lastTilePath: Tile[] = [];

    constructor(public playGameBoardManagerService: PlayGameBoardManagerService) {}

    onMapTileMouseDown(event: MouseEvent, tile: Tile) {
        if (event.button == 2) {
            this.handleRightClick(tile);
        }
    }

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
        this.lastTilePath = [];
    }

    discardRightClickSelecterPlayer(): void {
        this.rightClickSelectedPlayerCharacter = null;
    }

    discardRightSelectedTile(): void {
        this.rightSelectedTile = null;
    }
}
