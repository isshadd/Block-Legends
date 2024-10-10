import { Game } from '@app/model/database/game';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Tile } from '@app/model/schema/tile.schema';
import { GameService } from '@app/services/game/game.service';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';
import { Directions } from '@common/interfaces/directions';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameValidationService {
    constructor(private readonly gameService: GameService) {}

    async getNumberOfSpawnPoints(game: Game): Promise<number> {
        let count = 0;
        for (const row of game.tiles) {
            for (const tile of row) {
                if (tile.item && tile.item.type === 'Spawn') {
                    count++;
                }
            }
        }
        return count;
    }

    async isValidSizeBySpawnPoints(game: Game | UpdateGameDto): Promise<boolean> {
        const SPAN_SMALL_MAP = 2;
        const SPAN_MEDIUM_MAP = 4;
        const SPAN_LARGE_MAP = 6;

        let gameToValidate: Game;
        if (game instanceof UpdateGameDto) {
            gameToValidate = await this.gameService.getGameByName(game.name);
        } else {
            gameToValidate = game;
        }

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
        let map: Game;
        if (game instanceof UpdateGameDto) {
            map = await this.gameService.getGameByName(game.name);
        } else {
            map = game;
        }
        const matrix: number[][] = map.tiles.map((row) => row.map((tile) => (tile.type === TileType.Wall || tile.type === TileType.Door ? 1 : 0)));
        return matrix;
    }

    isValid(x: number, y: number, map: number[][], visited: boolean[][]): boolean {
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
                if (this.isValid(nx, ny, map, visited)) {
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

    async validateGame(game: Game | UpdateGameDto): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];
        const isMapValid = await this.mapIsValid(game);
        if (!isMapValid) {
            errors.push('Aucune tuile de terrain ne doit être inaccessible à cause d’un agencement de murs.');
        }

        const isValidSpawn = await this.isValidSizeBySpawnPoints(game);
        if (!isValidSpawn) {
            errors.push('Le nombre de points de spawn est incorrect. (2 pour une carte petite, 4 pour une carte moyenne et 6 pour une carte grande)');
        }
        //if (game instanceof Game) {
        const isNameDescriptionValid = await this.validateName(game);
        if (!isNameDescriptionValid) {
            errors.push('Le nom du jeu doit être unique et sans espaces.');
        }

        const isDescriptionValid = await this.validateDescription(game);
        if (!isDescriptionValid) {
            errors.push('La description du jeu ne doit pas être vide.');
        }

        //}

        const isDoorPlacementValid = await this.isDoorPlacementValid(game);
        if (!isDoorPlacementValid) {
            errors.push('La porte doit être placée entre des tuiles de murs sur un même axe et avoir des tuiles de type terrain sur l’autre axe.');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    async validateName(game: Game | UpdateGameDto): Promise<boolean> {
        const normalizedName = game.name.trim().replace(/\s+/g, ' ');
        const existingGame = await this.gameService.getGameByName(normalizedName);
        if (normalizedName.length === 0 || existingGame) {
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

    async isHalfMapTilesValid(game: Game, size: number): Promise<boolean> {
        let terrainTileCount = 0;

        game.tiles.forEach((row) => {
            row.forEach((tile) => {
                if (tile.type === TileType.Grass || tile.type === TileType.Water || tile.type === TileType.Ice) {
                    terrainTileCount++;
                }
            });
        });

        const totalTiles = size * size;
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
                        return false; // Door is on the edge, which is invalid
                    }

                    const horizontalCondition = await this.isHorizontalAxeDoorValid(game, i, j);
                    const verticalCondition = await this.isVerticalAxeDoorValid(game, i, j);

                    // If both conditions are false, the door placement is invalid
                    if (!horizontalCondition && !verticalCondition) {
                        return false; // Invalid placement found
                    }
                }
            }
        }

        return true; // Return true if all doors have valid placements
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
