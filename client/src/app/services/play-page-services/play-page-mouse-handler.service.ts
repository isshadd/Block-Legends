import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { PlayGameBoardManagerService } from './game-board/play-game-board-manager.service';

@Injectable({
    providedIn: 'root',
})
export class PlayPageMouseHandlerService {
    rightClickSelectedPlayerCharacter: PlayerCharacter | null = null;
    rightSelectedTile: Tile | null = null;

    constructor(public playGameBoardManagerService: PlayGameBoardManagerService) {}

    onMapTileMouseDown(event: MouseEvent, tile: Tile) {
        if (event.button == 2) {
            this.handleRightClick(tile);
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

    discardRightClickSelecterPlayer(): void {
        this.rightClickSelectedPlayerCharacter = null;
    }

    discardRightSelectedTile(): void {
        this.rightSelectedTile = null;
    }
}
