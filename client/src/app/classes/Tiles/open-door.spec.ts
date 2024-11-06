import { VisibleState } from '@app/interfaces/placeable-entity';
import { TileType } from '@common/enums/tile-type';
import { OpenDoor } from './open-door';

describe('OpenDoor', () => {
    let openDoor: OpenDoor;

    beforeEach(() => {
        openDoor = new OpenDoor();
    });

    it('should create an instance of OpenDoor', () => {
        expect(openDoor).toBeTruthy();
        expect(openDoor).toBeInstanceOf(OpenDoor);
    });

    it('should have the correct default type set to OpenDoor', () => {
        expect(openDoor.type).toBe(TileType.OpenDoor);
    });

    it('should have the correct description set', () => {
        expect(openDoor.description).toBe('Porte ouverte, vous pouvez entrer.');
    });

    it('should have the correct imageUrl set', () => {
        expect(openDoor.imageUrl).toBe('assets/images/tiles/open-door.png');
    });

    it('should return true for isDoor()', () => {
        expect(openDoor.isDoor()).toBeTrue();
    });

    it('should inherit default values from Tile class', () => {
        expect(openDoor.coordinates).toEqual({ x: -1, y: -1 });
        expect(openDoor.visibleState).toBe(VisibleState.NotSelected);
    });
});
