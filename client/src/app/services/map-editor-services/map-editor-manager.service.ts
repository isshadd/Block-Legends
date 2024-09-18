import { Injectable } from '@angular/core';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { Tile } from '@app/interfaces/tile';

@Injectable({
    providedIn: 'root',
})
export class MapEditorManagerService {
    grid: Tile[][] = [];

    gridCreator(tileNumber: number) {
        for (let i = 0; i < tileNumber; i++) {
            this.grid.push([]);
            for (let j = 0; j < tileNumber; j++) {
                const newTile = new GrassTile();
                this.grid[i].push(newTile);
                newTile.coordinates = { x: j, y: i };
            }
        }
    }

    setMapSize(size: number) {
        this.grid = [];
        this.gridCreator(size);
    }
}
