import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { CreateGameSharedDto } from '@common/interfaces/dto/game/create-game-shared.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreateTileDto } from './create-tile.dto';
import { MAP_CONSTANTS } from './game.dto.constants';

export class CreateGameDto implements CreateGameSharedDto {
    @ApiProperty({ maxLength: MAP_CONSTANTS.nameMaxLength })
    @IsNotEmpty({ message: 'Le nom est obligatoire' })
    @IsString({ message: 'Le nom doit être une chaîne de caractères' })
    @MaxLength(MAP_CONSTANTS.nameMaxLength, { message: 'Le nom doit contenir moins de 50 caractères' })
    name: string;

    @ApiProperty({ maxLength: MAP_CONSTANTS.descriptionMaxLength })
    @IsNotEmpty({ message: 'La description est obligatoire' })
    @IsString({ message: 'La description doit être une chaîne de caractères' })
    @MaxLength(MAP_CONSTANTS.descriptionMaxLength, { message: 'La description doit contenir moins de 100 caractères' })
    description: string;

    @ApiProperty({ enum: MAP_CONSTANTS.allowedSizes })
    @IsInt({ message: 'La taille du jeu doit être un nombre entier' })
    @IsIn(MAP_CONSTANTS.allowedSizes, { message: 'La taille du jeu doit être une des valeurs suivantes : 10, 15, 20' })
    size: MapSize;

    @ApiProperty({ enum: MAP_CONSTANTS.allowedModes })
    @IsString({ message: 'Le mode doit être une chaîne de caractères' })
    @IsIn(MAP_CONSTANTS.allowedModes, { message: 'Le mode doit être une des valeurs suivantes : "classic", "CTF"' })
    mode: GameMode;

    @ApiProperty({})
    @IsString({ message: "L'URL de l'image doit être une chaîne de caractères" })
    @IsNotEmpty({ message: "L'URL de l'image est obligatoire" })
    imageUrl: string;

    @ApiProperty({})
    @IsBoolean({ message: 'La visibilité doit être un booléen' })
    isVisible: boolean;

    @ApiProperty({})
    @IsArray({ message: 'La carte doit être un tableau 2D' })
    @ValidateNested({ each: true })
    @ArrayNotEmpty({ message: 'La carte doit être un tableau 2D de tuiles avec auttant de lignes que de colonnes' })
    @Type(() => CreateTileDto)
    tiles: CreateTileDto[][];
}
