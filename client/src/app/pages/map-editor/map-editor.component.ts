import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
// eslint-disable-next-line max-len
import { PlaceableEntityFullMenuComponent } from '@app/components/map-editor-components/placeable-entity-full-menu/placeable-entity-full-menu.component';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { GameShared } from '@common/interfaces/game-shared';
import { MapEditorOptionsMenuComponent } from '../../components/map-editor-components/map-editor-options-menu/map-editor-options-menu.component';

@Component({
    selector: 'app-map-editor',
    standalone: true,
    imports: [RouterLink, MapComponent, PlaceableEntityFullMenuComponent, MapEditorOptionsMenuComponent],
    templateUrl: './map-editor.component.html',
    styleUrl: './map-editor.component.scss',
})
export class MapEditorComponent {
    isNewGame: boolean;
    gameToEdit: GameShared;

    constructor(
        public mapEditorManagerService: MapEditorManagerService,
        public gameMapDataManagerService: GameMapDataManagerService,
        public gameServerCommunicationService: GameServerCommunicationService,
        private router: Router,
    ) {
        this.isNewGame = JSON.parse(localStorage.getItem('isNewGame') || 'false');
        this.gameToEdit = JSON.parse(localStorage.getItem('gameToEdit') || '{}');

        if (this.isNewGame) {
            this.gameMapDataManagerService.newGame(this.gameToEdit);
        } else {
            if (!this.gameToEdit._id || this.gameToEdit._id === '') {
                this.router.navigate(['/administration']);
                return;
            }

            this.gameServerCommunicationService.getGame(this.gameToEdit._id).subscribe((game) => {
                this.gameMapDataManagerService.loadGame(game);
            });
        }
    }

    onMouseUp() {
        this.mapEditorManagerService.onMouseUpMapTile();
    }
}
