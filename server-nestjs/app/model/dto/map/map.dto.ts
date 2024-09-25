import { CreateItemSharedDto } from '@common/interfaces/dto/item-shared.dto';
import { CreateMapSharedDto } from '@common/interfaces/dto/map-shared.dto';
import { CreateTileSharedDto } from '@common/interfaces/dto/tile-shared.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsIn, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { MAP_CONSTANTS } from './map.dto.constants';

class CreateItemDto implements CreateItemSharedDto {
    @ApiProperty({})
    @IsString()
    name: string;
}

class CreateTileDto implements CreateTileSharedDto {
    @ApiProperty({})
    @IsString()
    name: string;

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
