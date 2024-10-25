import { TestBed } from '@angular/core/testing';
import { Item } from '@app/classes/Items/item';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { OpenDoor } from '@app/classes/Tiles/open-door';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { WallTile } from '@app/classes/Tiles/wall-tile';
import { WaterTile } from '@app/classes/Tiles/water-tile';
import { ItemType } from '@common/enums/item-type';
import { TileType } from '@common/enums/tile-type';
import { TileShared } from '@common/interfaces/tile-shared';
import { ItemFactoryService } from './item-factory.service';
import { TileFactoryService } from './tile-factory.service';

describe('TileFactoryService', () => {
    let service: TileFactoryService;
    let itemFactoryServiceSpy: jasmine.SpyObj<ItemFactoryService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('ItemFactoryService', ['createItem']);

        TestBed.configureTestingModule({
            providers: [TileFactoryService, { provide: ItemFactoryService, useValue: spy }],
        });

        service = TestBed.inject(TileFactoryService);
        itemFactoryServiceSpy = TestBed.inject(ItemFactoryService) as jasmine.SpyObj<ItemFactoryService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('#createTile', () => {
        it('should create a GrassTile when TileType.Grass is passed', () => {
            const tile = service.createTile(TileType.Grass);
            expect(tile).toBeInstanceOf(GrassTile);
        });

        it('should create an IceTile when TileType.Ice is passed', () => {
            const tile = service.createTile(TileType.Ice);
            expect(tile).toBeInstanceOf(IceTile);
        });

        it('should create a WaterTile when TileType.Water is passed', () => {
            const tile = service.createTile(TileType.Water);
            expect(tile).toBeInstanceOf(WaterTile);
        });

        it('should create a WallTile when TileType.Wall is passed', () => {
            const tile = service.createTile(TileType.Wall);
            expect(tile).toBeInstanceOf(WallTile);
        });

        it('should create a DoorTile when TileType.Door is passed', () => {
            const tile = service.createTile(TileType.Door);
            expect(tile).toBeInstanceOf(DoorTile);
        });

        it('should create an OpenDoor when TileType.OpenDoor is passed', () => {
            const tile = service.createTile(TileType.OpenDoor);
            expect(tile).toBeInstanceOf(OpenDoor);
        });

        it('should create a generic Tile when an unknown TileType is passed', () => {
            const tile = service.createTile('UnknownType' as TileType);
            expect(tile).toBeInstanceOf(Tile);
        });
    });

    describe('#copyFromTile', () => {
        it('should create a new tile of the same type', () => {
            const originalTile = new WaterTile();
            const copiedTile = service.copyFromTile(originalTile);

            expect(copiedTile).toBeInstanceOf(WaterTile);
            expect(copiedTile).not.toBe(originalTile);
        });
    });

    describe('#loadGridFromJSON', () => {
        it('should load a grid of tiles from JSON', () => {
            const jsonGrid: TileShared[][] = [
                [{ type: TileType.Grass }, { type: TileType.Water }],
                [{ type: TileType.Wall }, { type: TileType.Door }],
            ];

            const grid = service.loadGridFromJSON(jsonGrid);

            expect(grid.length).toBe(2);
            expect(grid[0][0]).toBeInstanceOf(GrassTile);
            expect(grid[0][1]).toBeInstanceOf(WaterTile);
            expect(grid[1][0]).toBeInstanceOf(WallTile);
            expect(grid[1][1]).toBeInstanceOf(DoorTile);
        });

        it('should set coordinates for each tile', () => {
            const jsonGrid: TileShared[][] = [[{ type: TileType.Grass }, { type: TileType.Water }]];

            const grid = service.loadGridFromJSON(jsonGrid);

            expect(grid[0][0].coordinates).toEqual({ x: 0, y: 0 });
            expect(grid[0][1].coordinates).toEqual({ x: 0, y: 1 });
        });

        it('should call itemFactoryService to create items for terrain tiles', () => {
            const jsonGrid: TileShared[][] = [[{ type: TileType.Grass, item: { type: ItemType.Sword } }]];

            const mockItem = { description: 'Sword' } as Item;
            itemFactoryServiceSpy.createItem.and.returnValue(mockItem);

            const grid = service.loadGridFromJSON(jsonGrid);

            expect(itemFactoryServiceSpy.createItem).toHaveBeenCalledWith(ItemType.Sword);
            expect((grid[0][0] as TerrainTile).item).toBe(mockItem);
        });
    });
});
