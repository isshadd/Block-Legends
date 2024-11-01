import { Game } from '@app/model/database/game';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Tile } from '@app/model/schema/tile.schema';
import { GameService } from '@app/services/game/game.service';
import { ItemType } from '@common/enums/item-type';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';
import { Directions } from '@common/interfaces/directions';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GameValidationService {
    constructor(
        @Inject(forwardRef(() => GameService))
        private readonly gameService: GameService,
    ) {}

    async validateGame(game: Game | UpdateGameDto): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];
        const isMapValid = await this.mapIsValid(game);
        if (!isMapValid) {
            errors.push('Aucune tuile de terrain ne doit être inaccessible à cause d’un agencement de murs.');
        }

        const isHalfMapValid = await this.isHalfMapTilesValid(game);
        if (!isHalfMapValid) {
            errors.push('Plus de 50 % de la carte doit être composée de tuiles de type Grass, Water ou Ice.');
        }

        const isValidSpawn = await this.isValidSizeBySpawnPoints(game);
        if (!isValidSpawn) {
            errors.push('Le nombre de points de spawn est incorrect. (2 pour une carte petite, 4 pour une carte moyenne et 6 pour une carte grande)');
        }
        if (game instanceof Game) {
            const isNameValid = await this.validateName(game);
            if (!isNameValid) {
                errors.push('Le nom du jeu doit être unique et sans espaces.');
            }
        }

        const isDescriptionValid = await this.validateDescription(game);
        if (!isDescriptionValid) {
            errors.push('La description du jeu ne doit pas être vide.');
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

    async getNumberOfSpawnPoints(game: Game): Promise<number> {
        let count = 0;
        for (const row of game.tiles) {
            for (const tile of row) {
                if (tile.item && tile.item.type === ItemType.Spawn) {
                    count++;
                }
            }
        }
        return count;
    }

    async assignGameToRightType(game: Game | UpdateGameDto): Promise<Game> {
        let gameToValidate: Game;
        if (game instanceof UpdateGameDto) {
            gameToValidate = await this.gameService.getGameByName(game.name);
        } else {
            gameToValidate = game;
        }
        return gameToValidate;
    }

    async isValidSizeBySpawnPoints(game: Game | UpdateGameDto): Promise<boolean> {
        const SPAN_SMALL_MAP = 2;
        const SPAN_MEDIUM_MAP = 4;
        const SPAN_LARGE_MAP = 6;

        const gameToValidate = await this.assignGameToRightType(game);
        const spawnPoints = await this.getNumberOfSpawnPoints(gameToValidate);
        switch (gameToValidate.size) {
            case MapSize.SMALL:
                return spawnPoints === SPAN_SMALL_MAP;
            case MapSize.MEDIUM:
                return spawnPoints === SPAN_MEDIUM_MAP;
            case MapSize.LARGE:
                return spawnPoints === SPAN_LARGE_MAP;
            default:
                return false;
        }
    }

    async mapToMatrix(game: Game | UpdateGameDto): Promise<number[][]> {
        const map = await this.assignGameToRightType(game);
        const matrix: number[][] = map.tiles.map((row) => row.map((tile) => (tile.type === TileType.Wall ? 1 : 0)));
        return matrix;
    }

    isValidForTraversal(x: number, y: number, map: number[][], visited: boolean[][]): boolean {
        const n = map.length;
        const m = map[0].length;
        return x >= 0 && x < n && y >= 0 && y < m && map[x][y] === 0 && !visited[x][y];
    }

    async bfs(map: number[][], initialX: number, initialY: number, visited: boolean[][]) {
        const queue: [number, number][] = [];
        queue.push([initialX, initialY]);
        visited[initialX][initialY] = true;

        while (queue.length > 0) {
            const [x, y] = queue.shift(); // Obtenir la première case de la file
            for (const [dx, dy] of Directions) {
                const nx = x + dx;
                const ny = y + dy;
                if (this.isValidForTraversal(nx, ny, map, visited)) {
                    visited[nx][ny] = true;
                    queue.push([nx, ny]);
                }
            }
        }
    }

    async mapIsValid(game: Game | UpdateGameDto): Promise<boolean> {
        const map = await this.mapToMatrix(game);
        const n = map.length;
        const m = map[0].length;
        const visited: boolean[][] = Array.from({ length: n }, () => Array(m).fill(false));

        let initX = -1;
        let initY = -1;

        // Find a valid starting point in the map
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                if (map[i][j] === 0) {
                    initX = i;
                    initY = j;
                    break;
                }
            }
            if (initX !== -1) break;
        }

        // If no valid starting point is found, return false
        if (initX === -1 || initY === -1) {
            return false; // Invalid map
        }

        await this.bfs(map, initX, initY, visited);

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                if (map[i][j] === 0 && !visited[i][j]) {
                    return false; // Unvisited terrain tile means the map is invalid
                }
            }
        }
        return true;
    }

    async validateName(game: Game): Promise<boolean> {
        //const normalizedName = game.name.trim();
        const existingGame = await this.gameService.getGameByName(game.name);
        if (existingGame instanceof Game) {
            return false;
        }
        return true;
    }

    async validateDescription(game: Game | UpdateGameDto): Promise<boolean> {
        const description = game.description.trim();
        const descriptionValid = description.length > 0;
        if (game.name.length === 0) {
            return false;
        }
        return descriptionValid;
    }

    async isHalfMapTilesValid(game: Game | UpdateGameDto): Promise<boolean> {
        let terrainTileCount = 0;
        const gameToValidate = await this.assignGameToRightType(game);
        gameToValidate.tiles.forEach((row) => {
            row.forEach((tile) => {
                if (tile.type === TileType.Grass || tile.type === TileType.Water || tile.type === TileType.Ice) {
                    terrainTileCount++;
                }
            });
        });

        const totalTiles = gameToValidate.size * gameToValidate.size;
        return terrainTileCount > totalTiles / 2;
    }

    async isTileTerrain(tile: Tile) {
        let isTerrain = tile.type === TileType.Grass;
        isTerrain = isTerrain || tile.type === TileType.Water;
        isTerrain = isTerrain || tile.type === TileType.Ice;
        return isTerrain;
    }

    async isTileWall(tile: Tile) {
        return tile.type === TileType.Wall;
    }

    async isDoorPlacementValid(game: Game | UpdateGameDto): Promise<boolean> {
        for (let i = 0; i < game.tiles.length; i++) {
            for (let j = 0; j < game.tiles[i].length; j++) {
                const tile = game.tiles[i][j];

                if (tile.type === TileType.Door) {
                    // Check if the door is not on the edges of the grid
                    if (i <= 0 || i >= game.tiles.length - 1 || j <= 0 || j >= game.tiles[i].length - 1) {
                        return false;
                    }

                    const horizontalCondition = await this.isHorizontalAxeDoorValid(game, i, j);
                    const verticalCondition = await this.isVerticalAxeDoorValid(game, i, j);
                    if (!horizontalCondition && !verticalCondition) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    async isHorizontalAxeDoorValid(game: Game | UpdateGameDto, i: number, j: number): Promise<boolean> {
        // Ensure we're not accessing out of bounds
        if (i <= 0 || i >= game.tiles.length - 1 || j <= 0 || j >= game.tiles[i].length - 1) {
            return false;
        }

        const wallLeft = await this.isTileWall(game.tiles[i - 1][j]); // Wall to the left
        const wallRight = await this.isTileWall(game.tiles[i + 1][j]); // Wall to the right
        const terrainAbove = await this.isTileTerrain(game.tiles[i][j - 1]); // Terrain above
        const terrainBelow = await this.isTileTerrain(game.tiles[i][j + 1]); // Terrain below

        return wallLeft && wallRight && terrainAbove && terrainBelow;
    }

    async isVerticalAxeDoorValid(game: Game | UpdateGameDto, i: number, j: number): Promise<boolean> {
        // Ensure we're not accessing out of bounds
        if (i <= 0 || i >= game.tiles.length - 1 || j <= 0 || j >= game.tiles[i].length - 1) {
            return false;
        }

        return (
            (await this.isTileWall(game.tiles[i][j + 1])) && // Wall below
            (await this.isTileWall(game.tiles[i][j - 1])) && // Wall above
            (await this.isTileTerrain(game.tiles[i + 1][j])) && // Terrain on the right
            (await this.isTileTerrain(game.tiles[i - 1][j])) // Terrain on the left
        );
    }
}
