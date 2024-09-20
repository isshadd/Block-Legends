import { Component } from '@angular/core';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { VisibleStateComponent } from '../visible-state/visible-state.component';

const MAPSIZE = 20;
@Component({
    selector: 'app-map',
    standalone: true,
    imports: [PlaceableEntityComponent, VisibleStateComponent],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
})
export class MapComponent {
    // Temp for testing
    constructor(public mapEditorManagerService: MapEditorManagerService) {
        mapEditorManagerService.setMapSize(MAPSIZE);
    }
}
