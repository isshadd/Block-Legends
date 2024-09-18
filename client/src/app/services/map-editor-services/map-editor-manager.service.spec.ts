import { TestBed } from '@angular/core/testing';

import { GrassTile } from '@app/classes/Tiles/base-tile';
import { MapEditorManagerService } from './map-editor-manager.service';

describe('MapEditorManagerService', () => {
    let service: MapEditorManagerService;
    let grid: GrassTile[][];

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [MapEditorManagerService] });
        service = TestBed.inject(MapEditorManagerService);
        grid = [];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create a square grid of BaseTiles', () => {
        const MAP_SIZE = 2;

        service.gridCreator(MAP_SIZE);

        grid = [
            [new GrassTile(), new GrassTile()],
            [new GrassTile(), new GrassTile()],
        ];
        grid[0][0].coordinates = { x: 0, y: 0 };
        grid[0][1].coordinates = { x: 1, y: 0 };
        grid[1][0].coordinates = { x: 0, y: 1 };
        grid[1][1].coordinates = { x: 1, y: 1 };

        expect(service.grid).toEqual(grid);
        expect(service.grid.length).toBe(MAP_SIZE);
        expect(service.grid[0].length).toBe(MAP_SIZE);
    });

    it('should not create a grid if the size is 0 or smaller', () => {
        service.gridCreator(0);
        expect(service.grid).toEqual([]);

        service.gridCreator(-1);
        expect(service.grid).toEqual([]);
    });

    it('should clear the grid before setting the size', () => {
        const INITIAL_MAP_SIZE = 2;
        const FINAL_MAP_SIZE = 4;

        service.gridCreator(INITIAL_MAP_SIZE);
        service.setMapSize(FINAL_MAP_SIZE);
        expect(service.grid.length).toBe(FINAL_MAP_SIZE);
        expect(service.grid[0].length).toBe(FINAL_MAP_SIZE);
    });
});
