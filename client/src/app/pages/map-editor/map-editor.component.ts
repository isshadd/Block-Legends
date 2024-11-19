import { Component, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
// eslint-disable-next-line max-len
import { MapEditorOptionsMenuComponent } from '@app/components/map-editor-components/map-editor-options-menu/map-editor-options-menu.component';
// eslint-disable-next-line max-len
import { PlaceableEntityFullMenuComponent } from '@app/components/map-editor-components/placeable-entity-full-menu/placeable-entity-full-menu.component';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { GameShared } from '@common/interfaces/game-shared';

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
    isDragging: boolean = false;
    dragImage: string = '';
    mouseX = 0;
    mouseY = 0;

    constructor(
        public mapEditorManagerService: MapEditorManagerService,
        public gameMapDataManagerService: GameMapDataManagerService,
        public gameServerCommunicationService: GameServerCommunicationService,
        private router: Router,
    ) {
        this.isNewGame = this.gameMapDataManagerService.getLocalStorageIsNewGame();
        this.gameToEdit = this.gameMapDataManagerService.getLocalStorageGameToEdit();

        if (this.isNewGame) {
            this.gameMapDataManagerService.init(this.gameToEdit);
            this.mapEditorManagerService.init();
        } else {
            if (!this.gameToEdit || !this.gameToEdit._id) {
                this.router.navigate(['/administration-game']);
                return;
            }

            this.gameServerCommunicationService.getGame(this.gameToEdit._id).subscribe((game) => {
                this.gameMapDataManagerService.init(game);
                this.mapEditorManagerService.init();
                this.mapEditorManagerService.mapItemCheckup();
            });
        }
    }

    @HostListener('document:mouseup')
    onMouseUp() {
        this.mapEditorManagerService.onMouseUp();
        this.isDragging = false;
    }

    onMapMouseEnter() {
        this.mapEditorManagerService.onMapMouseEnter();
    }

    onMapMouseLeave() {
        this.mapEditorManagerService.onMapMouseLeave();
    }

    onMapTileMouseUp(tile: Tile) {
        this.mapEditorManagerService.onMouseUpMapTile(tile);
    }

    onMouseDown(event: MouseEvent) {
        event.preventDefault();
        if (event.button === 2) return;

        const draggedItem = this.mapEditorManagerService.getDraggedItem();
        if (draggedItem) {
            this.isDragging = true;
            this.dragImage = draggedItem.imageUrl;
            this.onMouseMove(event);
        }
    }

    onMouseMove(event: MouseEvent) {
        if (this.isDragging) {
            this.mouseX = (event as MouseEvent).clientX;
            this.mouseY = (event as MouseEvent).clientY;
        }
    }

    onMapTileMouseDown(event: MouseEvent, tile: Tile) {
        this.mapEditorManagerService.onMouseDownMapTile(event, tile);
        if (tile.isTerrain()) {
            const item = (tile as TerrainTile).item;
            if (item) {
                this.isDragging = true;
                this.dragImage = item.imageUrl;
                this.onMouseMove(event);
            }
        }
        event.preventDefault();
    }

    onMapTileMouseEnter(tile: Tile) {
        this.mapEditorManagerService.onMouseEnter(tile);
    }

    onMapTileMouseMove(tile: Tile) {
        this.mapEditorManagerService.onMouseMoveMapTile(tile);
    }

    onMapTileMouseLeave(tile: Tile) {
        this.mapEditorManagerService.onMouseLeave(tile);
    }
}
