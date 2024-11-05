import { WalkableTile } from '@app/classes/Tiles/walkable-tile';
import { Pathfinder } from '@app/services/game-board-services/path-finder';
import { Vec2 } from '@common/interfaces/vec2';
import { GameMapDataManagerService } from './game-map-data-manager.service';

describe('Pathfinder', () => {
    let pathfinder: Pathfinder;
    let gameMapDataManagerServiceMock: jasmine.SpyObj<GameMapDataManagerService>;

    beforeEach(() => {
        gameMapDataManagerServiceMock = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt', 'getNeighbours']);
        pathfinder = new Pathfinder(gameMapDataManagerServiceMock, 5);
    });

    it('should be created', () => {
        expect(pathfinder).toBeTruthy();
    });

    it('should return empty map if starting tile is not walkable', () => {
        const startCoordinates: Vec2 = { x: 0, y: 0 };
        const nonWalkableTile = jasmine.createSpyObj('Tile', ['isWalkable']);
        nonWalkableTile.isWalkable.and.returnValue(false);

        gameMapDataManagerServiceMock.getTileAt.and.returnValue(nonWalkableTile);

        const reachableTiles = pathfinder.findAllReachableTiles(startCoordinates);
        expect(reachableTiles.size).toBe(0);
    });

    it('should return reachable tiles within movement points', () => {
        const startCoordinates: Vec2 = { x: 1, y: 1 };
        const walkableTile1 = new WalkableTile();
        const walkableTile2 = new WalkableTile();
        walkableTile1.moveCost = 3; // Starting tile cost
        walkableTile2.moveCost = 2; // Neighbor cost

        gameMapDataManagerServiceMock.getTileAt.and.returnValue(walkableTile1);
        gameMapDataManagerServiceMock.getNeighbours.and.returnValue([walkableTile2]);

        const reachableTiles = pathfinder.findAllReachableTiles(startCoordinates);

        expect(reachableTiles.size).toBe(2); // 1 for starting tile + 1 for neighbor
        expect(reachableTiles.has(walkableTile1)).toBeTrue();
        expect(reachableTiles.has(walkableTile2)).toBeTrue();
    });

    it('should not include tiles that exceed movement points', () => {
        const startCoordinates: Vec2 = { x: 1, y: 1 };
        const walkableTile1 = new WalkableTile();
        const walkableTile2 = new WalkableTile();
        walkableTile1.moveCost = 4; // Starting tile cost
        walkableTile2.moveCost = 3; // Neighbor cost, total would exceed

        gameMapDataManagerServiceMock.getTileAt.and.returnValue(walkableTile1);
        gameMapDataManagerServiceMock.getNeighbours.and.returnValue([walkableTile2]);

        const reachableTiles = pathfinder.findAllReachableTiles(startCoordinates);

        expect(reachableTiles.size).toBe(1); // Only the starting tile should be reachable
        expect(reachableTiles.has(walkableTile1)).toBeTrue();
        expect(reachableTiles.has(walkableTile2)).toBeFalse();
    });

    it('should skip non-walkable neighbors', () => {
        const startCoordinates: Vec2 = { x: 1, y: 1 };
        const walkableTile = new WalkableTile();
        walkableTile.moveCost = 0; // Starting tile cost

        const nonWalkableTile = jasmine.createSpyObj('Tile', ['isWalkable']);
        nonWalkableTile.isWalkable.and.returnValue(false);

        gameMapDataManagerServiceMock.getTileAt.and.returnValue(walkableTile);
        gameMapDataManagerServiceMock.getNeighbours.and.returnValue([nonWalkableTile]);

        const reachableTiles = pathfinder.findAllReachableTiles(startCoordinates);

        expect(reachableTiles.size).toBe(1); // Only the starting tile should be reachable
        expect(reachableTiles.has(walkableTile)).toBeTrue();
    });
});
