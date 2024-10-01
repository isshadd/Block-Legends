import { TileType } from '@common/enums/tile-type';
import { plainToClass } from 'class-transformer';
import { CreateTileDto } from './create-tile.dto';
import { UpdateGameDto } from './update-game.dto';

describe('UpdateGameDto', () => {
    it('should transform plain tiles array to CreateTileDto instances', () => {
        const rawData = {
            name: 'Updated Game',
            description: 'Updated game description',
            imageUrl: 'test.jpg',
            isVisible: true,
            tiles: [
                [{ type: TileType.Grass }, { type: TileType.Ice }],
                [{ type: TileType.Grass }, { type: TileType.Water }],
            ],
        };

        const transformedDto = plainToClass(UpdateGameDto, rawData);

        transformedDto.tiles?.forEach((row) => {
            row.forEach((tile) => {
                expect(tile).toBeInstanceOf(CreateTileDto);
            });
        });
    });

    it('should handle when tiles are undefined', () => {
        const rawData = {
            name: 'Updated Game',
            description: 'Updated game description',
            isVisible: false,
        };

        const transformedDto = plainToClass(UpdateGameDto, rawData);

        expect(transformedDto.tiles).toBeUndefined();
    });
});
