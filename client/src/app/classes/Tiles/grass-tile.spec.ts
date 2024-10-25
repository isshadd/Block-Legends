import { VisibleState } from '@app/interfaces/placeable-entity';
import { TileType } from '@common/enums/tile-type';
import { DoorTile } from './door-tile';

describe('DoorTile', () => {
    let doorTile: DoorTile;

    beforeEach(() => {
        doorTile = new DoorTile();
    });

    it('should create an instance of DoorTile', () => {
        expect(doorTile).toBeTruthy();
        expect(doorTile).toBeInstanceOf(DoorTile);
    });

    it('should have the correct type set to Door', () => {
        expect(doorTile.type).toBe(TileType.Door);
    });

    it('should have the correct description set', () => {
        const expectedDescription = "Porte fermée. Ne peut être franchie que si elle est ouverte. Cliquez avec une autre porte pour l'ouvrir.";
        expect(doorTile.description).toBe(expectedDescription);
    });

    it('should have the correct imageUrl set', () => {
        expect(doorTile.imageUrl).toBe('assets/images/tiles/door.jpg');
    });

    it('should return true for isDoor()', () => {
        expect(doorTile.isDoor()).toBeTrue();
    });

    it('should inherit default values from Tile class', () => {
        expect(doorTile.coordinates).toEqual({ x: -1, y: -1 });
        expect(doorTile.visibleState).toBe(VisibleState.NotSelected);
    });
});
