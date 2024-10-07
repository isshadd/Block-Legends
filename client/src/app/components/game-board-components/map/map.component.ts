import { Component, EventEmitter, Output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Tile } from '@app/classes/Tiles/tile';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { VisibleStateComponent } from '@app/components/game-board-components/visible-state/visible-state.component';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [PlaceableEntityComponent, VisibleStateComponent, MatTooltipModule],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
})
export class MapComponent {
    @Output() mapTileMouseDown = new EventEmitter<{ event: MouseEvent; tile: Tile }>();
    @Output() mapTileMouseEnter = new EventEmitter<Tile>();
    @Output() mapTileMouseMove = new EventEmitter<Tile>();
    @Output() mapTileMouseLeave = new EventEmitter<Tile>();

    constructor(public gameMapDataManagerService: GameMapDataManagerService) {}

    onMouseDown(event: MouseEvent, tile: Tile) {
        this.mapTileMouseDown.emit({ event, tile });
    }

    onMouseEnter(tile: Tile) {
        this.mapTileMouseEnter.emit(tile);
    }

    onMouseMove(tile: Tile) {
        this.mapTileMouseMove.emit(tile);
    }

    onMouseLeave(tile: Tile) {
        this.mapTileMouseLeave.emit(tile);
    }

    onContextMenu(event: MouseEvent) {
        event.preventDefault();
    }
}
