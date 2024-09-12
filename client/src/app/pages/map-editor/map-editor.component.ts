import { Component } from '@angular/core';

@Component({
    selector: 'app-map-editor',
    standalone: true,
    imports: [],
    templateUrl: './map-editor.component.html',
    styleUrl: './map-editor.component.scss',
})
export class MapEditorComponent {
    gridType: Array<string> = ['stone', 'water', 'grass'];

    grid: Array<Array<string>> = [];

    gridCreator(tileNumber: number) {
        for (let i = 0; i < tileNumber; i++) {
            this.grid.push([]);
            for (let j = 0; j < tileNumber; j++) {
                this.grid[i].push(this.gridType[Math.floor(Math.random() * this.gridType.length)]);
            }
        }
    }

    constructor() {
        this.gridCreator(10);
    }

    onTileClick(i: number, j: number) {
        alert(`Tile ${j}, ${i} clicked`);
    }
}
