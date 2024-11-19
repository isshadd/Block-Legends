import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { VisibleStateComponent } from '@app/components/game-board-components/visible-state/visible-state.component';
import { Item } from '@common/classes/Items/item';
import { PlayerMapEntity } from '@common/classes/Player/player-map-entity';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [PlaceableEntityComponent, VisibleStateComponent, MatTooltipModule],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
})
export class MapComponent {
    @Input() grid: Tile[][];

    @Output() mapMouseEnter = new EventEmitter();
    @Output() mapMouseLeave = new EventEmitter();
    @Output() mapTileMouseDown = new EventEmitter<{ event: MouseEvent; tile: Tile }>();
    @Output() mapTileMouseEnter = new EventEmitter<Tile>();
    @Output() mapTileMouseMove = new EventEmitter<Tile>();
    @Output() mapTileMouseLeave = new EventEmitter<Tile>();
    @Output() mapTileMouseUp = new EventEmitter<Tile>();

    onMouseMapEnter() {
        this.mapMouseEnter.emit();
    }

    onMouseMapLeave() {
        this.mapMouseLeave.emit();
    }

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

    getPlayer(tile: Tile): PlayerMapEntity | null {
        if (tile.isWalkable()) {
            return (tile as WalkableTile).player;
        }
        return null;
    }
}
