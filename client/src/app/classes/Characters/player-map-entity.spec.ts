import { VisibleState } from '@app/interfaces/placeable-entity';
import { Vec2 } from '@common/interfaces/vec2';
import { PlayerMapEntity } from './player-map-entity'; // Adjust the import path as necessary

describe('PlayerMapEntity', () => {
    let playerMapEntity: PlayerMapEntity;

    beforeEach(() => {
        playerMapEntity = new PlayerMapEntity('test-image-url');
    });

    it('should create an instance', () => {
        expect(playerMapEntity).toBeTruthy();
    });

    it('should have a default description as an empty string', () => {
        expect(playerMapEntity.description).toBe('');
    });

    it('should set the imageUrl in the constructor', () => {
        expect(playerMapEntity.imageUrl).toBe('test-image-url');
    });

    it('should have default coordinates as {x: -1, y: -1}', () => {
        expect(playerMapEntity.coordinates).toEqual({ x: -1, y: -1 });
    });

    it('should set visibleState to NotSelected by default', () => {
        expect(playerMapEntity.visibleState).toBe(VisibleState.NotSelected);
    });

    it('should return false for isItem()', () => {
        expect(playerMapEntity.isItem()).toBe(false);
    });

    it('should update coordinates with setCoordinates()', () => {
        const newCoordinates: Vec2 = { x: 10, y: 20 };
        playerMapEntity.setCoordinates(newCoordinates);
        expect(playerMapEntity.coordinates).toEqual(newCoordinates);
    });

    it('should update spawnCoordinates with setSpawnCoordinates()', () => {
        const newCoordinates: Vec2 = { x: 10, y: 20 };
        playerMapEntity.setSpawnCoordinates(newCoordinates);
        expect(playerMapEntity.spawnCoordinates).toEqual(newCoordinates);
    });
});
