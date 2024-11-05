import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Tile } from '@app/classes/Tiles/tile';
import { WalkableTile } from '@app/classes/Tiles/walkable-tile';
import { MapEditorOptionsMenuComponent } from '@app/components/map-editor-components/map-editor-options-menu/map-editor-options-menu.component';
import { Vec2 } from '@common/interfaces/vec2';
import { GameMapDataManagerService } from './game-map-data-manager.service';
import { Pathfinder } from './path-finder';

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
        pathfinder = new Pathfinder(gameMapDataManagerService, 3); // Example movementPoints of 3
    });

    it('should return an empty map if start tile is not walkable', () => {
        const startCoordinates: Vec2 = { x: 0, y: 0 };
        const nonWalkableTile = new Tile(); // A generic non-walkable tile

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
        const startTile = new WalkableTile(); // Walkable starting tile
        startTile.moveCost = 1;

        const neighborTile = new WalkableTile(); // Neighbor within movement points
        neighborTile.moveCost = 2;

        gameMapDataManagerService.getTileAt.and.returnValue(startTile);
        spyOn(startTile, 'isWalkable').and.returnValue(true);
        gameMapDataManagerService.getNeighbours.and.returnValue([neighborTile]);

        spyOn(neighborTile, 'isWalkable').and.returnValue(true);
        spyOn(neighborTile, 'hasPlayer').and.returnValue(false);

        const result = pathfinder.findAllReachableTiles(startCoordinates);

        expect(result.size).toBe(2); // Start tile + neighbor tile
        expect(result.get(startTile)).toEqual([startTile]);
        expect(result.get(neighborTile)).toEqual([startTile, neighborTile]);
    });

    it('should skip tiles beyond movement points', () => {
        const startCoordinates: Vec2 = { x: 0, y: 0 };
        const startTile = new WalkableTile();
        startTile.moveCost = 1;

        const farTile = new WalkableTile(); // Neighbor outside movement range
        farTile.moveCost = 4;

        gameMapDataManagerService.getTileAt.and.returnValue(startTile);
        spyOn(startTile, 'isWalkable').and.returnValue(true);
        gameMapDataManagerService.getNeighbours.and.returnValue([farTile]);

        spyOn(farTile, 'isWalkable').and.returnValue(true);
        spyOn(farTile, 'hasPlayer').and.returnValue(false);

        const result = pathfinder.findAllReachableTiles(startCoordinates);

        expect(result.size).toBe(1); // Only the start tile is reachable
        expect(result.get(startTile)).toEqual([startTile]);
        expect(result.has(farTile)).toBeFalse();
    });

    it('should skip tiles with players on them', () => {
        const startCoordinates: Vec2 = { x: 0, y: 0 };
        const startTile = new WalkableTile();
        startTile.moveCost = 1;

        const occupiedTile = new WalkableTile(); // Tile with a player
        occupiedTile.moveCost = 1;

        gameMapDataManagerService.getTileAt.and.returnValue(startTile);
        spyOn(startTile, 'isWalkable').and.returnValue(true);
        gameMapDataManagerService.getNeighbours.and.returnValue([occupiedTile]);

        spyOn(occupiedTile, 'isWalkable').and.returnValue(true);
        spyOn(occupiedTile, 'hasPlayer').and.returnValue(true);

        const result = pathfinder.findAllReachableTiles(startCoordinates);

        expect(result.size).toBe(1); // Only the start tile is reachable
        expect(result.get(startTile)).toEqual([startTile]);
        expect(result.has(occupiedTile)).toBeFalse();
    });

    it('should inject MatDialog as a spy object', () => {
        expect(dialog).toBeTruthy();
        expect(dialog.open).toBeDefined(); // Ensure spy method is defined
        expect(dialog.open).toEqual(jasmine.any(Function)); // Confirm it is a spy function
    });
});
