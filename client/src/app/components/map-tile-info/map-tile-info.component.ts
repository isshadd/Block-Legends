import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { TileType } from '@common/enums/tile-type';

@Component({
    selector: 'app-map-tile-info',
    standalone: true,
    imports: [],
    templateUrl: './map-tile-info.component.html',
    styleUrl: './map-tile-info.component.scss',
})
export class MapTileInfoComponent {
    @Input() tile: Tile;
    @Output() close = new EventEmitter<void>();

    tileTypeToImage(tileType: TileType): string {
        return `/assets/images/tiles/blocks/${tileType}.png`;
    }

    closePanel() {
        this.close.emit();
    }

    tileMovementCost(tile: Tile): number | null {
        if (tile.isTerrain()) {
            return (tile as TerrainTile).moveCost;
        }
        return null;
    }
}
