import { TestBed } from '@angular/core/testing';

import { BaseTile } from '@app/classes/Tiles/base-tile';
import { MapEditorManagerService } from './map-editor-manager.service';

describe('MapEditorManagerService', () => {
    let service: MapEditorManagerService;
    let grid: BaseTile[][];

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [MapEditorManagerService] });
        service = TestBed.inject(MapEditorManagerService);
        grid = [];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create a square grid of BaseTiles', () => {
        service.gridCreator(2);
        grid = [
            [new BaseTile(), new BaseTile()],
            [new BaseTile(), new BaseTile()],
        ];
        grid[0][0].coordinates = { x: 0, y: 0 };
        grid[0][1].coordinates = { x: 1, y: 0 };
        grid[1][0].coordinates = { x: 0, y: 1 };
        grid[1][1].coordinates = { x: 1, y: 1 };

        expect(service.grid).toEqual(grid);
        expect(service.grid.length).toBe(2);
        expect(service.grid[0].length).toBe(2);
    });

    it('should not create a grid if the size is 0 or smaller', () => {
        service.gridCreator(0);
        expect(service.grid).toEqual([]);

        service.gridCreator(-1);
        expect(service.grid).toEqual([]);
    });

    it('should clear the grid before setting the size', () => {
        service.gridCreator(2);
        service.setMapSize(4);
        expect(service.grid.length).toBe(4);
        expect(service.grid[0].length).toBe(4);
    });
});
