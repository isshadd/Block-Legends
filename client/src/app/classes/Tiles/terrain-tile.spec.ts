import { PlayerMapEntity } from '../Characters/player-map-entity';
import { TerrainTile } from './terrain-tile';

describe('TerrainTile', () => {
    let terrainTile: TerrainTile;

    beforeEach(() => {
        terrainTile = new TerrainTile();
    });

    it('should create an instance', () => {
        expect(new TerrainTile()).toBeTruthy();
    });

    it('should return true for isTerrain()', () => {
        expect(terrainTile.isTerrain()).toBeTrue();
    });

    it('should set player', () => {
        const player = new PlayerMapEntity('test');
        spyOn(player, 'setCoordinates');
        terrainTile.setPlayer(player);
        expect(terrainTile.player).toBe(player);
        expect(player.setCoordinates).toHaveBeenCalledWith(terrainTile.coordinates);
    });
});
