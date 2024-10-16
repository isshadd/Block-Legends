import { VisibleState } from '@app/interfaces/placeable-entity';
import { TileType } from '@common/enums/tile-type';
import { Vec2 } from '@common/interfaces/vec2';
import { Tile } from './tile';

describe('Tile', () => {
    let tile: Tile;

    beforeEach(() => {
        tile = new Tile();
    });

    it('should create an instance of Tile', () => {
        expect(tile).toBeTruthy();
        expect(tile).toBeInstanceOf(Tile);
    });

    it('should have default coordinates set to (-1, -1)', () => {
        expect(tile.coordinates).toEqual({ x: -1, y: -1 });
    });

    it('should have default visibleState set to NotSelected', () => {
        expect(tile.visibleState).toBe(VisibleState.NotSelected);
    });

    it('should return false for isItem()', () => {
        expect(tile.isItem()).toBeFalse();
    });

    it('should return false for isTerrain()', () => {
        expect(tile.isTerrain()).toBeFalse();
    });

    it('should return false for isDoor()', () => {
        expect(tile.isDoor()).toBeFalse();
    });

    it('should allow setting the type, description, and imageUrl properties', () => {
        tile.type = TileType.Grass;
        tile.description = 'A grass tile';
        tile.imageUrl = 'path/to/grass.png';

        expect(tile.type).toBe(TileType.Grass);
        expect(tile.description).toBe('A grass tile');
        expect(tile.imageUrl).toBe('path/to/grass.png');
    });

    it('should allow setting the coordinates property', () => {
        const newCoordinates: Vec2 = { x: 5, y: 10 };
        tile.coordinates = newCoordinates;

        expect(tile.coordinates).toEqual(newCoordinates);
    });

    it('should allow setting the visibleState property', () => {
        tile.visibleState = VisibleState.Selected;
        expect(tile.visibleState).toBe(VisibleState.Selected);
    });
});
