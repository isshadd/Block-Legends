import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
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
    @Output() closePanelOutput = new EventEmitter<void>();

    tileTypeToImage(tileType: TileType): string {
        return `assets/images/tiles/blocks/${tileType}.png`;
    }

    closePanel() {
        this.closePanelOutput.emit();
    }

    tileMovementCost(tile: Tile): number | null {
        return tile.isTerrain() ? (tile as TerrainTile).moveCost : null;
    }
}
