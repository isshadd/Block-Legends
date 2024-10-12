import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Item } from '@app/classes/Items/item';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { VisibleStateComponent } from '@app/components/game-board-components/visible-state/visible-state.component';

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [PlaceableEntityComponent, VisibleStateComponent, MatTooltipModule],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
})
export class MapComponent {
    @Input() grid: Tile[][];

    @Output() mapTileMouseDown = new EventEmitter<{ event: MouseEvent; tile: Tile }>();
    @Output() mapTileMouseEnter = new EventEmitter<Tile>();
    @Output() mapTileMouseMove = new EventEmitter<Tile>();
    @Output() mapTileMouseLeave = new EventEmitter<Tile>();
    @Output() mapTileMouseUp = new EventEmitter<Tile>();

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

    onMouseUp(tile: Tile) {
        this.mapTileMouseUp.emit(tile);
    }

    onContextMenu(event: MouseEvent) {
        event.preventDefault();
    }

    getTerrainItem(tile: Tile): Item | null {
        if (tile.isTerrain()) {
            return (tile as TerrainTile).item;
        }
        return null;
    }
}
