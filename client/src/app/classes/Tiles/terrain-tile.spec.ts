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
});
