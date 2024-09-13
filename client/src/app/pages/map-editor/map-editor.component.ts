import { Component } from '@angular/core';
import { BaseTile } from '@app/classes/Tiles/base-tile';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { WallTile } from '@app/classes/Tiles/wall-tile';
import { WaterTile } from '@app/classes/Tiles/water-tile';

@Component({
    selector: 'app-map-editor',
    standalone: true,
    imports: [],
    templateUrl: './map-editor.component.html',
    styleUrl: './map-editor.component.scss',
})
export class MapEditorComponent {
    gridType: Array<BaseTile> = [new WaterTile(), new DoorTile(), new IceTile(), new WallTile(), new BaseTile()];

    grid: Array<Array<BaseTile>> = [];

    gridCreator(tileNumber: number) {
        for (let i = 0; i < tileNumber; i++) {
            this.grid.push([]);
            for (let j = 0; j < tileNumber; j++) {
                this.grid[i].push(this.gridType[Math.floor(Math.random() * this.gridType.length)]);
            }
        }
    }

    constructor() {
        this.gridCreator(20);
    }

    onTileClick(i: number, j: number, tile: BaseTile) {
        alert(`${tile.name} ${j}, ${i} clicked`);
    }
}
