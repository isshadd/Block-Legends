import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MapEditorOptionsMenuComponent } from '@app/components/map-editor-components/map-editor-options-menu/map-editor-options-menu.component';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { Pathfinder } from '@app/services/game-board-services/path-finder';
import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';
import { Vec2 } from '@common/interfaces/vec2';

describe('Pathfinder', () => {
    let pathfinder: Pathfinder;
    let gameMapDataManagerService: jasmine.SpyObj<GameMapDataManagerService>;
    let dialog: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        TestBed.configureTestingModule({
            imports: [MapEditorOptionsMenuComponent],
            providers: [{ provide: MatDialog, useValue: dialogSpy }],
        });

        dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        gameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt', 'getNeighbours']);
        const movementPoints = 3;
        pathfinder = new Pathfinder(gameMapDataManagerService, movementPoints);
    });

    it('should return an empty map if start tile is not walkable', () => {
        const startCoordinates: Vec2 = { x: 0, y: 0 };
        const nonWalkableTile = new Tile();

        gameMapDataManagerService.getTileAt.and.returnValue(nonWalkableTile);
        spyOn(nonWalkableTile, 'isWalkable').and.returnValue(false);

        const result = pathfinder.findAllReachableTiles(startCoordinates);

        expect(result.size).toBe(0);
    });

    it('should return an empty map if no start tile is found', () => {
        const startCoordinates: Vec2 = { x: 0, y: 0 };
        gameMapDataManagerService.getTileAt.and.returnValue(null);

        const result = pathfinder.findAllReachableTiles(startCoordinates);

        expect(result.size).toBe(0);
    });

    it('should return reachable tiles within movement points', () => {
        const startCoordinates: Vec2 = { x: 0, y: 0 };
        const startTile = new WalkableTile();
        startTile.moveCost = 1;

        const neighborTile = new WalkableTile();
        neighborTile.moveCost = 2;

        gameMapDataManagerService.getTileAt.and.returnValue(startTile);
        spyOn(startTile, 'isWalkable').and.returnValue(true);
        gameMapDataManagerService.getNeighbours.and.returnValue([neighborTile]);

        spyOn(neighborTile, 'isWalkable').and.returnValue(true);
        spyOn(neighborTile, 'hasPlayer').and.returnValue(false);

        const result = pathfinder.findAllReachableTiles(startCoordinates);

        expect(result.size).toBe(2);
        expect(result.get(startTile)).toEqual([startTile]);
        expect(result.get(neighborTile)).toEqual([startTile, neighborTile]);
    });

    it('should skip tiles beyond movement points', () => {
        const startCoordinates: Vec2 = { x: 0, y: 0 };
        const startTile = new WalkableTile();
        startTile.moveCost = 1;

        const farTile = new WalkableTile();
        farTile.moveCost = 4;

        gameMapDataManagerService.getTileAt.and.returnValue(startTile);
        spyOn(startTile, 'isWalkable').and.returnValue(true);
        gameMapDataManagerService.getNeighbours.and.returnValue([farTile]);

        spyOn(farTile, 'isWalkable').and.returnValue(true);
        spyOn(farTile, 'hasPlayer').and.returnValue(false);

        const result = pathfinder.findAllReachableTiles(startCoordinates);

        expect(result.size).toBe(1);
        expect(result.get(startTile)).toEqual([startTile]);
        expect(result.has(farTile)).toBeFalse();
    });

    it('should skip tiles with players on them', () => {
        const startCoordinates: Vec2 = { x: 0, y: 0 };
        const startTile = new WalkableTile();
        startTile.moveCost = 1;

        const occupiedTile = new WalkableTile();
        occupiedTile.moveCost = 1;

        gameMapDataManagerService.getTileAt.and.returnValue(startTile);
        spyOn(startTile, 'isWalkable').and.returnValue(true);
        gameMapDataManagerService.getNeighbours.and.returnValue([occupiedTile]);

        spyOn(occupiedTile, 'isWalkable').and.returnValue(true);
        spyOn(occupiedTile, 'hasPlayer').and.returnValue(true);

        const result = pathfinder.findAllReachableTiles(startCoordinates);

        expect(result.size).toBe(1);
        expect(result.get(startTile)).toEqual([startTile]);
        expect(result.has(occupiedTile)).toBeFalse();
    });

    it('should inject MatDialog as a spy object', () => {
        expect(dialog).toBeTruthy();
        expect(dialog.open).toBeDefined();
        expect(dialog.open).toEqual(jasmine.any(Function));
    });

    it('should prefer paths with lower cost when multiple paths reach the same tile', () => {
        const startCoordinates: Vec2 = { x: 0, y: 0 };

        const startTile = new WalkableTile();
        startTile.moveCost = 1;
        spyOn(startTile, 'isWalkable').and.returnValue(true);

        const neighbor1 = new WalkableTile();
        neighbor1.moveCost = 1;
        spyOn(neighbor1, 'isWalkable').and.returnValue(true);
        spyOn(neighbor1, 'hasPlayer').and.returnValue(false);

        const neighbor2 = new WalkableTile();
        neighbor2.moveCost = 2;
        spyOn(neighbor2, 'isWalkable').and.returnValue(true);
        spyOn(neighbor2, 'hasPlayer').and.returnValue(false);

        const targetTile = new WalkableTile();
        targetTile.moveCost = 1;
        spyOn(targetTile, 'isWalkable').and.returnValue(true);
        spyOn(targetTile, 'hasPlayer').and.returnValue(false);

        gameMapDataManagerService.getTileAt.and.returnValue(startTile);

        gameMapDataManagerService.getNeighbours.and.callFake((tile: Tile) => {
            if (tile === startTile) {
                return [neighbor1, neighbor2];
            } else if (tile === neighbor1 || tile === neighbor2) {
                return [targetTile];
            }
            return [];
        });

        const result = pathfinder.findAllReachableTiles(startCoordinates);

        const expectedReachableTilesCount = 4;
        expect(result.size).toBe(expectedReachableTilesCount);

        expect(result.has(startTile)).toBeTrue();
        expect(result.has(neighbor1)).toBeTrue();
        expect(result.has(neighbor2)).toBeTrue();
        expect(result.has(targetTile)).toBeTrue();

        expect(result.get(startTile)).toEqual([startTile]);
        expect(result.get(neighbor1)).toEqual([startTile, neighbor1]);
        expect(result.get(neighbor2)).toEqual([startTile, neighbor2]);
        expect(result.get(targetTile)).toEqual([startTile, neighbor1, targetTile]);

        const expectedPathLength = 3;
        expect(result.get(targetTile)?.length).toBe(expectedPathLength);
    });

    it('should skip non-walkable neighbors', () => {
        // Arrange
        const startCoordinates: Vec2 = { x: 0, y: 0 };
        const startTile = new WalkableTile();
        startTile.moveCost = 1;
        spyOn(startTile, 'isWalkable').and.returnValue(true);

        const nonWalkableNeighbor = new Tile(); // Neighbor tile that is not walkable
        spyOn(nonWalkableNeighbor, 'isWalkable').and.returnValue(false);

        // Mock the GameMapDataManagerService to return startTile and its neighbor
        gameMapDataManagerService.getTileAt.and.returnValue(startTile);
        gameMapDataManagerService.getNeighbours.and.returnValue([nonWalkableNeighbor]);

        // Act
        const result = pathfinder.findAllReachableTiles(startCoordinates);

        // Assert
        expect(result.size).toBe(1); // Only the start tile should be reachable
        expect(result.has(startTile)).toBeTrue();
        expect(result.get(startTile)).toEqual([startTile]);
        expect(result.has(nonWalkableNeighbor)).toBeFalse(); // Non-walkable neighbor should be skipped
    });

    it('should skip processing a neighbor that has already been visited with a lower or equal cost', () => {
        // Arrange
        const startCoordinates: Vec2 = { x: 0, y: 0 };
        const startTile = new WalkableTile();
        startTile.moveCost = 1;
        spyOn(startTile, 'isWalkable').and.returnValue(true);

        const neighborTile = new WalkableTile();
        neighborTile.moveCost = 1;
        spyOn(neighborTile, 'isWalkable').and.returnValue(true);
        spyOn(neighborTile, 'hasPlayer').and.returnValue(false);

        // Mock GameMapDataManagerService methods
        gameMapDataManagerService.getTileAt.and.returnValue(startTile);

        // First, return the neighbor normally; then return it again to simulate a revisit
        gameMapDataManagerService.getNeighbours.and.callFake((tile: Tile) => {
            if (tile === startTile) return [neighborTile];
            if (tile === neighborTile) return [startTile]; // Simulate a revisit to the start tile (loop)
            return [];
        });

        // Act
        const result = pathfinder.findAllReachableTiles(startCoordinates);

        // Assert
        expect(result.size).toBe(2); // Only startTile and neighborTile should be present
        expect(result.get(startTile)).toEqual([startTile]);
        expect(result.get(neighborTile)).toEqual([startTile, neighborTile]);
        expect(gameMapDataManagerService.getNeighbours).toHaveBeenCalledTimes(2); // Ensures loop was processed only once for neighborTile
    });
});
