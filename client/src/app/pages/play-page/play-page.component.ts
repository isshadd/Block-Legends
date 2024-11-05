import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { Tile } from '@app/classes/Tiles/tile';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { PlaceableEntityContainerComponent } from '@app/components/map-editor-components/placeable-entity-container/placeable-entity-container.component';
import { MapTileInfoComponent } from '@app/components/map-tile-info/map-tile-info.component';
import { TimerComponent } from '@app/components/play-page-components/timer/timer.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { PlayersListComponent } from '@app/components/players-list/players-list.component';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayGameBoardSocketService } from '@app/services/play-page-services/game-board/play-game-board-socket.service';
import { PlayPageMouseHandlerService } from '@app/services/play-page-services/play-page-mouse-handler.service';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { InfoPanelComponent } from '../../components/info-panel/info-panel.component';
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
        InfoPanelComponent,
    ],
    templateUrl: './play-page.component.html',
    styleUrl: './play-page.component.scss',
})
export class PlayPageComponent {
    mainPlayer: PlayerCharacter = new PlayerCharacter('sam');
    constructor(
        public playGameBoardManagerService: PlayGameBoardManagerService,
        public playPageMouseHandlerService: PlayPageMouseHandlerService,
        public playGameBoardSocketService: PlayGameBoardSocketService,
        public router: Router,
    ) {
        this.playGameBoardManagerService.signalManagerFinishedInit$.subscribe(() => {
            this.onPlayGameBoardManagerInit();
        });

        this.playGameBoardSocketService.init();
        this.mainPlayer.avatar = AvatarEnum.Alex;
    }

    onPlayGameBoardManagerInit() {
        // do something
    }

    onMapTileMouseDown(event: MouseEvent, tile: Tile) {
        this.playPageMouseHandlerService.onMapTileMouseDown(event, tile);
    }

    onMapTileMouseEnter(tile: Tile) {
        this.playPageMouseHandlerService.onMapTileMouseEnter(tile);
    }

    onMapTileMouseLeave(tile: Tile) {
        this.playPageMouseHandlerService.onMapTileMouseLeave(tile);
    }

    closePlayerInfoPanel(): void {
        this.playPageMouseHandlerService.discardRightClickSelectedPlayer();
    }

    closeTileInfoPanel(): void {
        this.playPageMouseHandlerService.discardRightSelectedTile();
    }

    toggleAction(): void {
        this.playPageMouseHandlerService.toggleAction();
    }

    endTurn(): void {
        this.playGameBoardSocketService.endTurn();
    }

    leaveGame(): void {
        this.playGameBoardSocketService.leaveGame();
        this.router.navigate(['/home']);
    }
}
