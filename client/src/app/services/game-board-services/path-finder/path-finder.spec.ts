import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager/game-map-data-manager.service';
import { Pathfinder } from '@app/services/game-board-services/path-finder/path-finder';
import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';

describe('Pathfinder', () => {
    let pathfinder: Pathfinder;
    let mockGameMapDataManagerService: jasmine.SpyObj<GameMapDataManagerService>;
    let mockTile: jasmine.SpyObj<Tile>;
    let mockWalkableTile: jasmine.SpyObj<WalkableTile>;

    beforeEach(() => {
        mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt', 'getNeighbours']);
        const pathfinderMaxValue = 5;
        pathfinder = new Pathfinder(mockGameMapDataManagerService, pathfinderMaxValue);

        mockTile = jasmine.createSpyObj('Tile', ['isWalkable']);
        mockWalkableTile = jasmine.createSpyObj('WalkableTile', ['isWalkable', 'hasPlayer'], { moveCost: 1 });
    });

    it('should return an empty map if the start tile is null', () => {
        mockGameMapDataManagerService.getTileAt.and.returnValue(null);

        const result = pathfinder.findAllReachableTiles({ x: 0, y: 0 });

        expect(result.size).toBe(0);
        expect(mockGameMapDataManagerService.getTileAt).toHaveBeenCalledWith({ x: 0, y: 0 });
    });

    it('should return an empty map if the start tile is not walkable', () => {
        mockTile.isWalkable.and.returnValue(false);
        mockGameMapDataManagerService.getTileAt.and.returnValue(mockTile);

        const result = pathfinder.findAllReachableTiles({ x: 0, y: 0 });

        expect(result.size).toBe(0);
        expect(mockTile.isWalkable).toHaveBeenCalled();
    });

    it('should process walkable tiles and find reachable tiles', () => {
        // Setup start tile
        mockWalkableTile.isWalkable.and.returnValue(true);
        mockWalkableTile.hasPlayer.and.returnValue(false);
        mockGameMapDataManagerService.getTileAt.and.returnValue(mockWalkableTile);

        // Setup neighbors
        const neighborTile = jasmine.createSpyObj('WalkableTile', ['isWalkable', 'hasPlayer'], { moveCost: 1 });
        neighborTile.isWalkable.and.returnValue(true);
        neighborTile.hasPlayer.and.returnValue(false);
        mockGameMapDataManagerService.getNeighbours.and.returnValue([neighborTile]);

        const result = pathfinder.findAllReachableTiles({ x: 0, y: 0 });

        expect(result.size).toBeGreaterThan(0);
        expect(mockGameMapDataManagerService.getTileAt).toHaveBeenCalledWith({ x: 0, y: 0 });
        expect(mockGameMapDataManagerService.getNeighbours).toHaveBeenCalledWith(mockWalkableTile);
    });

    it('should skip non-walkable neighbors', () => {
        // Setup start tile
        mockWalkableTile.isWalkable.and.returnValue(true);
        mockWalkableTile.hasPlayer.and.returnValue(false);
        mockGameMapDataManagerService.getTileAt.and.returnValue(mockWalkableTile);

        // Setup non-walkable neighbor
        const nonWalkableTile = jasmine.createSpyObj('Tile', ['isWalkable']);
        nonWalkableTile.isWalkable.and.returnValue(false);
        mockGameMapDataManagerService.getNeighbours.and.returnValue([nonWalkableTile]);

        const result = pathfinder.findAllReachableTiles({ x: 0, y: 0 });

        expect(result.size).toBe(1); // Only the start tile should be in the result
        expect(mockGameMapDataManagerService.getNeighbours).toHaveBeenCalledWith(mockWalkableTile);
        expect(nonWalkableTile.isWalkable).toHaveBeenCalled();
    });

    it('should skip tiles with players', () => {
        // Setup start tile
        mockWalkableTile.isWalkable.and.returnValue(true);
        mockWalkableTile.hasPlayer.and.returnValue(false);
        mockGameMapDataManagerService.getTileAt.and.returnValue(mockWalkableTile);

        // Setup neighbor with a player
        const playerTile = jasmine.createSpyObj('WalkableTile', ['isWalkable', 'hasPlayer'], { moveCost: 1 });
        playerTile.isWalkable.and.returnValue(true);
        playerTile.hasPlayer.and.returnValue(true);
        mockGameMapDataManagerService.getNeighbours.and.returnValue([playerTile]);

        const result = pathfinder.findAllReachableTiles({ x: 0, y: 0 });

        expect(result.size).toBe(1); // Only the start tile should be in the result
        expect(mockGameMapDataManagerService.getNeighbours).toHaveBeenCalledWith(mockWalkableTile);
        expect(playerTile.hasPlayer).toHaveBeenCalled();
    });

    it('should skip tiles exceeding movement points', () => {
        // Setup start tile
        mockWalkableTile.isWalkable.and.returnValue(true);
        mockWalkableTile.hasPlayer.and.returnValue(false);
        mockGameMapDataManagerService.getTileAt.and.returnValue(mockWalkableTile);

        // Setup neighbor with high movement cost
        const expensiveTile = jasmine.createSpyObj('WalkableTile', ['isWalkable', 'hasPlayer'], { moveCost: 10 });
        expensiveTile.isWalkable.and.returnValue(true);
        expensiveTile.hasPlayer.and.returnValue(false);
        mockGameMapDataManagerService.getNeighbours.and.returnValue([expensiveTile]);

        const result = pathfinder.findAllReachableTiles({ x: 0, y: 0 });

        expect(result.size).toBe(1); // Only the start tile should be in the result
        expect(mockGameMapDataManagerService.getNeighbours).toHaveBeenCalledWith(mockWalkableTile);
    });
});
