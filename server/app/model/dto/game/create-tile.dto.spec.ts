import { ItemType } from '@common/enums/item-type';
import { TileType } from '@common/enums/tile-type';
import { plainToClass } from 'class-transformer';
import { CreateItemDto } from './create-item.dto';
import { CreateTileDto } from './create-tile.dto';

describe('CreateTileDto', () => {
    it('should transform plain item object into CreateItemDto instance', () => {
        const rawData = {
            type: TileType.Grass,
            item: {
                type: ItemType.Sword,
            },
        };

        const transformedDto = plainToClass(CreateTileDto, rawData);

        expect(transformedDto.item).toBeInstanceOf(CreateItemDto);
        expect(transformedDto.item?.type).toBe(ItemType.Sword);
    });

    it('should handle when item is undefined', () => {
        const rawData = {
            type: TileType.Wall,
        };

        const transformedDto = plainToClass(CreateTileDto, rawData);

        expect(transformedDto.item).toBeUndefined();
    });
});
