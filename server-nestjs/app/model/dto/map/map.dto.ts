import { ItemType } from '@common/enums/item-type';
import { TileType } from '@common/enums/tile-type';
import { CreateItemSharedDto } from '@common/interfaces/dto/item-shared.dto';
import { CreateMapSharedDto } from '@common/interfaces/dto/map-shared.dto';
import { CreateTileSharedDto } from '@common/interfaces/dto/tile-shared.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { MAP_CONSTANTS } from './map.dto.constants';

class CreateItemDto implements CreateItemSharedDto {
    @ApiProperty({})
    @IsEnum(ItemType)
    type: ItemType;
}

class CreateTileDto implements CreateTileSharedDto {
    @ApiProperty({})
    @IsEnum(TileType)
    type: TileType;

    @ApiProperty({})
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateItemDto)
    item?: CreateItemDto;
}

export class CreateMapDto implements CreateMapSharedDto {
    @ApiProperty({ maxLength: MAP_CONSTANTS.NAME_MAX_LENGTH })
    @IsString()
    @MaxLength(MAP_CONSTANTS.NAME_MAX_LENGTH)
    name: string;

    @ApiProperty({ maxLength: MAP_CONSTANTS.DESCRIPTION_MAX_LENGTH })
    @IsString()
    @MaxLength(MAP_CONSTANTS.DESCRIPTION_MAX_LENGTH)
    description: string;

    @ApiProperty({ enum: MAP_CONSTANTS.ALLOWED_SIZES })
    @IsInt()
    @IsIn(MAP_CONSTANTS.ALLOWED_SIZES)
    size: number;

    @ApiProperty({})
    @IsArray()
    @ValidateNested({ each: true })
    @ArrayNotEmpty()
    @Type(() => CreateTileDto)
    tiles: CreateTileDto[][];
}
