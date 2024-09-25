import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsIn, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { MAP_CONSTANTS } from './map.dto.constants';

class CreateItemDto {
    @ApiProperty({})
    @IsString()
    name: string;
}

class CreateTileDto {
    @ApiProperty({})
    @IsString()
    name: string;

    @ApiProperty({})
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateItemDto)
    item?: CreateItemDto;
}

export class CreateMapDto {
    @ApiProperty({})
    @IsString()
    @MaxLength(MAP_CONSTANTS.NAME_MAX_LENGTH)
    name: string;

    @ApiProperty({})
    @IsString()
    @MaxLength(MAP_CONSTANTS.DESCRIPTION_MAX_LENGTH)
    description: string;

    @ApiProperty({})
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
