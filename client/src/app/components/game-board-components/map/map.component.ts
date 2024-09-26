import { Component } from '@angular/core';
import { Tile } from '@app/classes/Tiles/tile';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { VisibleStateComponent } from '../visible-state/visible-state.component';

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [PlaceableEntityComponent, VisibleStateComponent],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
})
export class MapComponent {
    // Temp for testing
    constructor(public mapEditorManagerService: MapEditorManagerService) {}

    onMouseDown(event: MouseEvent, tile: Tile) {
        this.mapEditorManagerService.onMouseDownMapTile(event, tile);
    }

    onMouseEnter(tile: Tile) {
        this.mapEditorManagerService.onMouseEnter(tile);
    }

    onMouseMove(tile: Tile) {
        this.mapEditorManagerService.onMouseMoveMapTile(tile);
    }

    onMouseLeave(tile: Tile) {
        this.mapEditorManagerService.onMouseLeave(tile);
    }

    onContextMenu(event: MouseEvent) {
        event.preventDefault();
    }
}
