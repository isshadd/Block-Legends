import { Game } from '@app/model/database/game';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Tile } from '@app/model/schema/tile.schema';
import { GameService } from '@app/services/game/game.service';
import { TileType } from '@common/enums/tile-type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameValidationService {
    constructor(private readonly gameService: GameService) {}

    async validateGame(game: Game | UpdateGameDto): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];

        const isNameDescriptionValid = await this.validateNameDescription(game);
        if (!isNameDescriptionValid) {
            errors.push('Le nom du jeu doit être unique et la description est obligatoire.');
        }

        const isTilesValid = await this.isMapTilesValid(game);
        if (!isTilesValid) {
            errors.push('Plus de la moitié de la map doit être composée de tiles de type Grass, Water ou Ice.');
        }

        const isDoorPlacementValid = await this.isDoorPlacementValid(game);
        if (!isDoorPlacementValid) {
            errors.push('La porte doit être placée entre des tuiles de murs sur un même axe et avoir des tuiles de type terrain sur l’autre axe.');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    async validateNameDescription(game: Game | UpdateGameDto): Promise<boolean> {
        const descriptionValid = game.description.length > 0;
        if (game.name.length === 0) {
            return false;
        }
        const existingGame = await this.gameService.getGameByName(game.name);

        return !existingGame && descriptionValid;
    }

    async isMapTilesValid(game: Game | UpdateGameDto): Promise<boolean> {
        let terrainTileCount = 0;
        game.tiles.forEach((row) => {
            row.forEach((tile) => {
                if (tile.type === TileType.Grass || tile.type === TileType.Water || tile.type === TileType.Ice) {
                    terrainTileCount++;
                }
            });
        });
        const totalTiles = game.size * game.size;
        return terrainTileCount > totalTiles / 2;
    } //retourne vrai si la moitie de la map est composée de tiles de type Grass, Water ou Ice

    async isTileTerrain(tile: Tile) {
        return tile.type === TileType.Grass || tile.type === TileType.Water || tile.type === TileType.Ice;
    } //retourne vrai si le type de la tile est Grass, Water ou Ice

    async isTileWall(tile: Tile) {
        return tile.type === TileType.Wall;
    } //retourne vrai si le type de la tile est Wall

    async isDoorPlacementValid(game: Game | UpdateGameDto): Promise<boolean> {
        let doorValid = true;

        for (let i = 0; i < game.tiles.length; i++) {
            for (let j = 0; j < game.tiles[i].length; j++) {
                const tile = game.tiles[i][j];

                if (tile.type === TileType.Door) {
                    // Check if the door is not on the edges of the grid
                    if (i > 0 && i < game.tiles.length - 1 && j > 0 && j < game.tiles[i].length - 1) {
                        const horizontalCondition = await this.isHorizontalAxeDoorValid(game, i, j);
                        const verticalCondition = await this.isVerticalAxeDoorValid(game, i, j);

                        if (!horizontalCondition && !verticalCondition) {
                            doorValid = false;
                            break; // Exit the loops if invalid placement is found
                        }
                    } else {
                        doorValid = false; // Door is on the edge, which is invalid
                        break;
                    }
                }
            }
            if (!doorValid) break; // Exit the loops if invalid placement is found
        }
        return doorValid; // Return true if all doors have valid placement
    }

    async isHorizontalAxeDoorValid(game: Game | UpdateGameDto, i: number, j: number): Promise<boolean> {
        return (
            this.isTileWall(game.tiles[i][j + 1]) &&
            this.isTileWall(game.tiles[i][j - 1]) &&
            this.isTileTerrain(game.tiles[i + 1][j]) &&
            this.isTileTerrain(game.tiles[i - 1][j])
        );
    }

    async isVerticalAxeDoorValid(game: Game | UpdateGameDto, i: number, j: number): Promise<boolean> {
        return (
            this.isTileWall(game.tiles[i + 1][j]) && // Wall below
            this.isTileWall(game.tiles[i - 1][j]) && // Wall above
            this.isTileTerrain(game.tiles[i][j + 1]) && // Terrain on the right
            this.isTileTerrain(game.tiles[i][j - 1]) // Terrain on the left
        );
    }
}
