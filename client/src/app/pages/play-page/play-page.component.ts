import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { PlaceableEntityContainerComponent } from '@app/components/map-editor-components/placeable-entity-container/placeable-entity-container.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { PlayersListComponent } from '@app/components/players-list/players-list.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { MapTileInfoComponent } from '../../components/map-tile-info/map-tile-info.component';
import { PlayerMapEntityInfoViewComponent } from '../../components/player-map-entity-info-view/player-map-entity-info-view.component';

@Component({
    selector: 'app-play-page',
    standalone: true,
    imports: [
        MapComponent,
        RouterModule,
        PlayerMapEntityInfoViewComponent,
        PlayerInfoComponent,
        PlayersListComponent,
        MapTileInfoComponent,
        PlaceableEntityContainerComponent,
        TimerComponent,
    ],
    templateUrl: './play-page.component.html',
    styleUrl: './play-page.component.scss',
})
export class PlayPageComponent {
    selectedPlayerCharacter: PlayerCharacter | null = null;
    selectedTile: Tile | null = null;
    mainPlayer: PlayerCharacter = new PlayerCharacter('sam');
    isBattlePhase: boolean = false;
    constructor(
        public playGameBoardManagerService: PlayGameBoardManagerService,
        private router: Router,
    ) {
        this.mainPlayer.avatar = AvatarEnum.Alex;
    }

    onMapTileMouseDown(event: MouseEvent, tile: Tile) {
        if (event.button == 2) {
            if (tile.isTerrain()) {
                const player = (tile as TerrainTile).player;
                if (player) {
                    this.selectedPlayerCharacter = this.playGameBoardManagerService.findPlayerFromPlayerMapEntity(player);
                }
            }
            if (this.selectedPlayerCharacter == null) {
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

    endTurn(): void {
        this.router.navigate(['/administration-game']);
        return;
    }
}
