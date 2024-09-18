import { Component } from '@angular/core';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { TerrainTile } from '@app/interfaces/terrain-tile';
import { Tile } from '@app/interfaces/tile';
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

    onTileClick(tile: Tile) {
        alert(`${tile.name} ${tile.coordinates.x}, ${tile.coordinates.y} clicked`);
    }

    isTerrainTile(tile: Tile): tile is TerrainTile {
        return (tile as TerrainTile).item !== undefined;
    }
}
