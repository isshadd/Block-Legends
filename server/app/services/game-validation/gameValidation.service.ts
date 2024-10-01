import { Game } from '@app/model/database/game';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Tile } from '@app/model/schema/tile.schema';
import { ExampleService } from '@app/services/example/example.service';
import { GameService } from '@app/services/game/game.service';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';
import { Directions } from '@common/interfaces/directions';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameValidationService {
    constructor(
        private readonly gameService: GameService,
        private readonly exampleService: ExampleService,
    ) {}

    async isGameNameUnique(name: string): Promise<boolean> {
        const existingGame = await this.gameService.getGameByName(name);
        return !existingGame;
    } // retourne vrai si le nom du jeu est unique

    async getNumberOfSpawnPoints(game: Game | UpdateGameDto): Promise<number> {
        const existingGame = await this.gameService.getGameByName(game.name);
        let count = 0;
        for (let i = 0; i < existingGame.tiles.length; i++) {
            for (let j = 0; j < existingGame.tiles[i].length; j++) {
                if (existingGame.tiles[i][j].item && existingGame.tiles[i][j].item.type == 'Spawn') {
                    count++;
                }
            }
        }
        return count;
    }

    // retourne le nombre de points de spawn pour un jeu donné

    async isValidSizeBySpawnPoints(game: Game | UpdateGameDto): Promise<boolean> {
        const gameToValidate = await this.gameService.getGameByName(game.name);
        const spawnPoints = await this.getNumberOfSpawnPoints(game);
        switch (gameToValidate.size) {
            case MapSize.SMALL:
                return spawnPoints === 2;
            case MapSize.MEDIUM:
                return spawnPoints === 4;
            case MapSize.LARGE:
                return spawnPoints === 6;
            default:
                return false;
        }
    }

    async mapToMatrix(name: string): Promise<number[][]> {
        const map = await this.gameService.getGameByName(name);
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
        const map = await this.mapToMatrix(game.name);
        const n = map.length;
        const m = map[0].length;
        const visited: boolean[][] = Array.from({ length: n }, () => Array(m).fill(false));

        let initX = -1;
        let initY = -1;
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

        this.bfs(map, initX, initY, visited);

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                if (map[i][j] === 0 && !visited[i][j]) {
                    return false; // Si une tuile de terrain n'a pas été visitée, la carte est invalide
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
        const isNameDescriptionValid = await this.validateNameDescription(game);
        if (!isNameDescriptionValid) {
            errors.push('Le nom du jeu doit être unique et la description est obligatoire.');
        }

        const isDoorPlacementValid = await this.isDoorPlacementValid(game);
        if (!isDoorPlacementValid) {
            errors.push('La porte doit être placée entre des tuiles de murs sur un même axe et avoir des tuiles de type terrain sur l’autre axe.');
        }
        if (errors.length) {
            throw new Error(errors.join(','));
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

    async isMapTilesValid(game: Game, size: number): Promise<boolean> {
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
        return tile.type === TileType.Grass || tile.type === TileType.Water || tile.type === TileType.Ice;
    }

    async isTileWall(tile: Tile) {
        return tile.type === TileType.Wall;
    } //retourne vrai si le type de la tile est Wall

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
        const wallLeft = this.isTileWall(game.tiles[i][j - 1]); // Wall to the left
        const wallRight = this.isTileWall(game.tiles[i][j + 1]); // Wall to the right
        const terrainAbove = this.isTileTerrain(game.tiles[i - 1][j]); // Terrain above
        const terrainBelow = this.isTileTerrain(game.tiles[i + 1][j]); // Terrain below

        // Return true only if all conditions are met
        return wallLeft && wallRight && terrainAbove && terrainBelow;
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
