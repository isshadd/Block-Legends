import { Tile } from '@app/model/schema/tile.schema';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsIn, IsInt, IsString, MaxLength } from 'class-validator';
import { MAP_CONSTANTS } from './map.dto.constants';

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
    @ArrayNotEmpty()
    tiles: Tile[][];
}
