import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';
import { plainToClass } from 'class-transformer';
import { CreateGameDto } from './create-game.dto';
import { CreateTileDto } from './create-tile.dto';

describe('CreateGameDto', () => {
    it('should transform plain tiles array to CreateTileDto instances', async () => {
        const rawData = {
            name: 'Test Game',
            description: 'A game for testing',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            imageUrl: 'test.jpg',
            isVisible: true,
            tiles: [
                [{ type: TileType.Grass }, { type: TileType.Ice }],
                [{ type: TileType.Grass }, { type: TileType.Door }],
            ],
        };

        const transformedDto = plainToClass(CreateGameDto, rawData);

        transformedDto.tiles.forEach((row) => {
            row.forEach((tile) => {
                expect(tile).toBeInstanceOf(CreateTileDto);
            });
        });
    });
});
