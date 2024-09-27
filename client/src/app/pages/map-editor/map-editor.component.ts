import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
// eslint-disable-next-line max-len
import { PlaceableEntityFullMenuComponent } from '@app/components/map-editor-components/placeable-entity-full-menu/placeable-entity-full-menu.component';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { MapEditorOptionsMenuComponent } from '../../components/map-editor-components/map-editor-options-menu/map-editor-options-menu.component';

@Component({
    selector: 'app-map-editor',
    standalone: true,
    imports: [RouterLink, MapComponent, PlaceableEntityFullMenuComponent, MapEditorOptionsMenuComponent],
    templateUrl: './map-editor.component.html',
    styleUrl: './map-editor.component.scss',
})
export class MapEditorComponent {
    constructor(public mapEditorManagerService: MapEditorManagerService) {}

    onMouseUp() {
        this.mapEditorManagerService.onMouseUpMapTile();
    }
}
