import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { CreateGameSharedDto } from '@common/interfaces/dto/game/create-game-shared.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsIn, IsInt, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreateTileDto } from './create-tile.dto';
import { MAP_CONSTANTS } from './game.dto.constants';

export class CreateGameDto implements CreateGameSharedDto {
    @ApiProperty({ maxLength: MAP_CONSTANTS.nameMaxLength })
    @IsString()
    @MaxLength(MAP_CONSTANTS.nameMaxLength)
    name: string;

    @ApiProperty({ maxLength: MAP_CONSTANTS.descriptionMaxLength })
    @IsString()
    @MaxLength(MAP_CONSTANTS.descriptionMaxLength)
    description: string;

    @ApiProperty({ enum: MAP_CONSTANTS.allowedSizes })
    @IsInt()
    @IsIn(MAP_CONSTANTS.allowedSizes)
    size: MapSize;

    @ApiProperty({ enum: MAP_CONSTANTS.allowedModes })
    @IsString()
    @IsIn(MAP_CONSTANTS.allowedModes)
    mode: GameMode;

    @ApiProperty({})
    @IsString()
    imageUrl: string;

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
