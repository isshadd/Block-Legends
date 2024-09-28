import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { CreateGameSharedDto } from '@common/interfaces/dto/game/create-game-shared.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsDate, IsIn, IsInt, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreateTileDto } from './create-tile.dto';
import { MAP_CONSTANTS } from './game.dto.constants';

export class CreateGameDto implements CreateGameSharedDto {
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
    size: MapSize;

    @ApiProperty({ enum: MAP_CONSTANTS.ALLOWED_MODES })
    @IsString()
    @IsIn(MAP_CONSTANTS.ALLOWED_MODES)
    mode: GameMode;

    @ApiProperty({})
    @IsString()
    imageUrl: string;

    @ApiProperty({})
    @IsDate()
    lastModificationDate: Date;

    @ApiProperty({})
    @IsBoolean()
    isVisible: boolean;

    @ApiProperty({})
    @IsArray()
    @ValidateNested({ each: true })
    @ArrayNotEmpty()
    @Type(() => CreateTileDto)
    tiles: CreateTileDto[][];
}
