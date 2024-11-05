/* eslint-disable  @typescript-eslint/no-explicit-any */

import { PlayerMapEntity } from '@app/classes/Characters/player-map-entity';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';

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

    it('should remove player', () => {
        const player = new PlayerMapEntity('test');
        terrainTile.setPlayer(player);
        spyOn(player, 'setCoordinates');
        terrainTile.removePlayer();
        expect(terrainTile.player).toBeNull();
    });

    it('should remove item', () => {
        terrainTile.item = {} as any;
        terrainTile.removeItem();
        expect(terrainTile.item).toBeNull();
    });
});
