import { TileType } from '@common/enums/tile-type';
import { PlayerMapEntity } from '../Characters/player-map-entity';
import { WalkableTile } from './walkable-tile';

describe('WalkableTile', () => {
    let walkableTile: WalkableTile;
    let mockPlayer: jasmine.SpyObj<PlayerMapEntity>;

    beforeEach(() => {
        walkableTile = new WalkableTile();
        mockPlayer = jasmine.createSpyObj('PlayerMapEntity', ['setCoordinates']);
        walkableTile.coordinates = { x: 0, y: 0 }; // Assuming coordinates property
    });

    it('should be created', () => {
        expect(walkableTile).toBeTruthy();
    });

    it('should return true for isWalkable()', () => {
        expect(walkableTile.isWalkable()).toBeTrue();
    });

    it('should initially have no player', () => {
        expect(walkableTile.hasPlayer()).toBeFalse();
    });

    it('should set and retrieve a player', () => {
        walkableTile.setPlayer(mockPlayer);
        expect(walkableTile.hasPlayer()).toBeTrue();
        expect(walkableTile.player).toBe(mockPlayer);
    });

    it('should call setCoordinates on player with correct parameters when setPlayer is called', () => {
        walkableTile.type = TileType.Ice;
        walkableTile.setPlayer(mockPlayer);
        expect(mockPlayer.setCoordinates).toHaveBeenCalledWith(walkableTile.coordinates, true);
    });

    it('should set player coordinates without sliding if tile is not ice', () => {
        walkableTile.type = TileType.Grass;
        walkableTile.setPlayer(mockPlayer);
        expect(mockPlayer.setCoordinates).toHaveBeenCalledWith(walkableTile.coordinates, false);
    });

    it('should remove the player', () => {
        walkableTile.setPlayer(mockPlayer);
        walkableTile.removePlayer();
        expect(walkableTile.hasPlayer()).toBeFalse();
        expect(walkableTile.player).toBeNull();
    });

    it('should have a default moveCost of 1', () => {
        expect(walkableTile.moveCost).toBe(1);
    });
});
