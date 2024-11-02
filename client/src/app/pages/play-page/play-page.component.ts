import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { MapTileInfoComponent } from '../../components/map-tile-info/map-tile-info.component';
import { PlayerMapEntityInfoViewComponent } from '../../components/player-map-entity-info-view/player-map-entity-info-view.component';

@Component({
    selector: 'app-play-page',
    standalone: true,
    imports: [MapComponent, RouterLink, PlayerMapEntityInfoViewComponent, MapTileInfoComponent],
    templateUrl: './play-page.component.html',
    styleUrl: './play-page.component.scss',
})
export class PlayPageComponent {
    selectedPlayerCharacter: PlayerCharacter | null = null;
    selectedTile: Tile | null = null;
    constructor(public playGameBoardManagerService: PlayGameBoardManagerService) {
        this.playGameBoardManagerService.init();
    }

    onMapTileMouseDown(event: MouseEvent, tile: Tile) {
        if (event.button == 2) {
            if (tile.isTerrain() && (tile as TerrainTile).player) {
                const player = (tile as TerrainTile).player;
                if (player) {
                    this.closeTileInfoPanel();
                    this.selectedPlayerCharacter = this.playGameBoardManagerService.findPlayerFromPlayerMapEntity(player);
                }
            } else {
                this.closePlayerInfoPanel();
                this.selectedTile = tile;
            }
        }
    }

    closePlayerInfoPanel(): void {
        this.selectedPlayerCharacter = null;
    }

    closeTileInfoPanel(): void {
        this.selectedTile = null;
    }
}
