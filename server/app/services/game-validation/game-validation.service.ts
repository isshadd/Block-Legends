import { Game } from '@app/model/database/game';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Tile } from '@app/model/schema/tile.schema';
import { GameService } from '@app/services/game/game.service';
import { GameMode } from '@common/enums/game-mode';
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

        const isDescriptionValid = await this.validateDescription(game);
        if (!isDescriptionValid) {
            errors.push('La description du jeu ne doit pas être vide.');
        }

        const isDoorPlacementValid = await this.isDoorPlacementValid(game);
        if (!isDoorPlacementValid) {
            errors.push('La porte doit être placée entre des tuiles de murs sur un même axe et avoir des tuiles de type terrain sur l’autre axe.');
        }

        const isValidateCTF = await this.isValidCTF(game);
        if (!isValidateCTF) {
            errors.push('Un jeu en mode CTF doit nécessairement contenir un drapeau.');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    async getNumberOfSpawnPoints(game: Game): Promise<number> {
        return game.tiles.flat().filter((tile) => tile.item?.type === ItemType.Spawn).length;
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

    async isValidCTF(game: Game | UpdateGameDto): Promise<boolean> {
        const gameToValidate = await this.assignGameToRightType(game);
        if (gameToValidate.mode === GameMode.CTF) {
            for (const row of gameToValidate.tiles) {
                for (const tile of row) {
                    if (tile.item && tile.item.type === ItemType.Flag) {
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
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
            const [x, y] = queue.shift();
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

        const [initX, initY] = this.findStartingPoint(map, n, m);

        if (initX === -1 || initY === -1) {
            return false; // Invalid map
        }

        await this.bfs(map, initX, initY, visited);

        return this.areAllTerrainTilesVisited(map, visited, n, m);
    }

    findStartingPoint(map: number[][], n: number, m: number): [number, number] {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                if (map[i][j] === 0) {
                    return [i, j];
                }
            }
        }
        return [-1, -1];
    }

    areAllTerrainTilesVisited(map: number[][], visited: boolean[][], n: number, m: number): boolean {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                if (map[i][j] === 0 && !visited[i][j]) {
                    return false; // Unvisited terrain tile means the map is invalid
                }
            }
        }
        return true;
    }

    async validateGameName(game: Game): Promise<boolean> {
        const existingGame = await this.gameService.getGameByName(game.name.trim());
        return !existingGame || existingGame._id === game._id;
    }

    async validateUpdatedGameName(id: string, game: UpdateGameDto): Promise<boolean> {
        const normalizedName = game.name.trim();
        const foundGame = await this.gameService.getGameByName(normalizedName);
        return !foundGame || foundGame._id === id;
    }

    async validateDescription(game: Game | UpdateGameDto): Promise<boolean> {
        return game.name.length > 0 && game.description.trim().length > 0;
    }
    async isHalfMapTilesValid(game: Game | UpdateGameDto): Promise<boolean> {
        const gameToValidate = await this.assignGameToRightType(game);
        const terrainTileCount = gameToValidate.tiles
            .flat()
            .filter((tile) => [TileType.Grass, TileType.Water, TileType.Ice].includes(tile.type)).length;
        const totalTiles = gameToValidate.size ** 2;
        return terrainTileCount > totalTiles / 2;
    }

    async isTileTerrain(tile: Tile) {
        return [TileType.Grass, TileType.Water, TileType.Ice].includes(tile.type);
    }

    async isTileWall(tile: Tile) {
        return tile.type === TileType.Wall;
    }

    async isDoorPlacementValid(game: Game | UpdateGameDto): Promise<boolean> {
        for (const [i, row] of game.tiles.entries()) {
            for (const [j, tile] of row.entries()) {
                if (tile.type === TileType.Door) {
                    if (this.isEdgeTile(game, i, j) || !(await this.isDoorValid(game, i, j))) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    isEdgeTile(game: Game | UpdateGameDto, i: number, j: number): boolean {
        return i <= 0 || i >= game.tiles.length - 1 || j <= 0 || j >= game.tiles[i].length - 1;
    }

    async isDoorValid(game: Game | UpdateGameDto, i: number, j: number): Promise<boolean> {
        const horizontalCondition = await this.isHorizontalAxeDoorValid(game, i, j);
        const verticalCondition = await this.isVerticalAxeDoorValid(game, i, j);
        return horizontalCondition || verticalCondition;
    }
    async isHorizontalAxeDoorValid(game: Game | UpdateGameDto, i: number, j: number): Promise<boolean> {
        if (i <= 0 || i >= game.tiles.length - 1 || j <= 0 || j >= game.tiles[i].length - 1) {
            return false;
        }

        return (
            (await this.isTileWall(game.tiles[i - 1][j])) &&
            (await this.isTileWall(game.tiles[i + 1][j])) &&
            (await this.isTileTerrain(game.tiles[i][j - 1])) &&
            (await this.isTileTerrain(game.tiles[i][j + 1]))
        );
    }

    async isVerticalAxeDoorValid(game: Game | UpdateGameDto, i: number, j: number): Promise<boolean> {
        if (i <= 0 || i >= game.tiles.length - 1 || j <= 0 || j >= game.tiles[i].length - 1) {
            return false;
        }

        return (
            (await this.isTileWall(game.tiles[i][j + 1])) &&
            (await this.isTileWall(game.tiles[i][j - 1])) &&
            (await this.isTileTerrain(game.tiles[i + 1][j])) &&
            (await this.isTileTerrain(game.tiles[i - 1][j]))
        );
    }
}
