import { UpdateGameSharedDto } from '@common/interfaces/dto/game/update-game-shared.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsDate, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreateTileDto } from './create-tile.dto';
import { MAP_CONSTANTS } from './game.dto.constants';

export class UpdateGameDto implements UpdateGameSharedDto {
    @ApiProperty({ maxLength: MAP_CONSTANTS.NAME_MAX_LENGTH, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(MAP_CONSTANTS.NAME_MAX_LENGTH)
    name?: string;

    @ApiProperty({ maxLength: MAP_CONSTANTS.DESCRIPTION_MAX_LENGTH, required: false })
    @IsString()
    @IsOptional()
    @MaxLength(MAP_CONSTANTS.DESCRIPTION_MAX_LENGTH)
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiProperty({})
    @IsDate()
    lastModificationDate: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isVisible?: boolean;

    @ApiProperty({ required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @ArrayNotEmpty()
    @IsOptional()
    @Type(() => CreateTileDto)
    tiles?: CreateTileDto[][];
}
