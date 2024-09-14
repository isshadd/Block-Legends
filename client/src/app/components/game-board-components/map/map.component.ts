import { Component } from '@angular/core';
import { BaseTile } from '@app/classes/Tiles/base-tile';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';

const MAPSIZE = 20;
@Component({
    selector: 'app-map',
    standalone: true,
    imports: [PlaceableEntityComponent],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
})
export class MapComponent {
    // Temp for testing
    constructor(public mapEditorManagerService: MapEditorManagerService) {
        mapEditorManagerService.setMapSize(MAPSIZE);
    }

    onTileClick(tile: BaseTile) {
        alert(`${tile.name} ${tile.coordinates.x}, ${tile.coordinates.y} clicked`);
    }
}
