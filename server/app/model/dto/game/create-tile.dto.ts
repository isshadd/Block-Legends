import { TileType } from '@common/enums/tile-type';
import { CreateTileSharedDto } from '@common/interfaces/dto/game/tile-shared.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { CreateItemDto } from './create-item.dto';

export class CreateTileDto implements CreateTileSharedDto {
    @ApiProperty({})
    @IsEnum(TileType)
    type: TileType;

    @ApiProperty({})
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateItemDto)
    item?: CreateItemDto;
}
