import { Injectable } from '@angular/core';
import { BaseTile } from '@app/classes/Tiles/base-tile';

@Injectable({
    providedIn: 'root',
})
export class MapEditorManagerService {
    readonly grid: Array<Array<BaseTile>> = [];

    gridCreator(tileNumber: number) {
        for (let i = 0; i < tileNumber; i++) {
            this.grid.push([]);
            for (let j = 0; j < tileNumber; j++) {
                const newTile = new BaseTile();
                this.grid[i].push(newTile);
                newTile.coordinates = { x: j, y: i };
            }
        }
    }
    setMapSize(size: number) {
        this.gridCreator(size);
    }
}
