// src/app/services/tile-factory.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { OpenDoor } from '@app/classes/Tiles/open-door';
import { Tile } from '@app/classes/Tiles/tile';
import { WallTile } from '@app/classes/Tiles/wall-tile';
import { WaterTile } from '@app/classes/Tiles/water-tile';
import { TileType } from '@common/enums/tile-type';
import { TileFactoryService } from './tile-factory.service';

describe('TileFactoryService', () => {
    let service: TileFactoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TileFactoryService],
        });
        service = TestBed.inject(TileFactoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('createTile', () => {
        it('should create a GrassTile when TileType.Grass is passed', () => {
            const tile = service.createTile(TileType.Grass);
            expect(tile).toBeInstanceOf(GrassTile);
            expect(tile.type).toBe(TileType.Grass);
        });

        it('should create an IceTile when TileType.Ice is passed', () => {
            const tile = service.createTile(TileType.Ice);
            expect(tile).toBeInstanceOf(IceTile);
            expect(tile.type).toBe(TileType.Ice);
        });

        it('should create a WaterTile when TileType.Water is passed', () => {
            const tile = service.createTile(TileType.Water);
            expect(tile).toBeInstanceOf(WaterTile);
            expect(tile.type).toBe(TileType.Water);
        });

        it('should create a WallTile when TileType.Wall is passed', () => {
            const tile = service.createTile(TileType.Wall);
            expect(tile).toBeInstanceOf(WallTile);
            expect(tile.type).toBe(TileType.Wall);
        });

        it('should create a DoorTile when TileType.Door is passed', () => {
            const tile = service.createTile(TileType.Door);
            expect(tile).toBeInstanceOf(DoorTile);
            expect(tile.type).toBe(TileType.Door);
        });

        it('should create an OpenDoor when TileType.OpenDoor is passed', () => {
            const tile = service.createTile(TileType.OpenDoor);
            expect(tile).toBeInstanceOf(OpenDoor);
            expect(tile.type).toBe(TileType.OpenDoor);
        });

        it('should create a generic Tile when an unknown TileType is passed', () => {
            const unknownType = 'UnknownType' as TileType;
            const tile = service.createTile(unknownType);
            expect(tile).toBeInstanceOf(Tile);
            expect(tile.type).toBeUndefined();
        });
    });

    describe('copyFromTile', () => {
        it('should create a new tile of the same type', () => {
            const originalTile = service.createTile(TileType.Water);
            const copiedTile = service.copyFromTile(originalTile);

            expect(copiedTile).toBeInstanceOf(WaterTile);
            expect(copiedTile.type).toBe(originalTile.type);
        });

        it('should return a different instance when copying a tile', () => {
            const originalTile = service.createTile(TileType.Grass);
            const copiedTile = service.copyFromTile(originalTile);

            expect(copiedTile).not.toBe(originalTile);
        });

        it('should handle copying a generic Tile', () => {
            const originalTile = service.createTile('Generic' as TileType);
            const copiedTile = service.copyFromTile(originalTile);

            expect(copiedTile).toBeInstanceOf(Tile);
            expect(copiedTile).not.toBe(originalTile);
        });
    });
});
