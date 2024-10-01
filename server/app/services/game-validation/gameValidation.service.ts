import { GameService } from '@app/services/game/game.service';
import { Body, Injectable } from '@nestjs/common';
import { ItemType } from '@common/enums/item-type';
import { Game } from '@app/model/database/game';
import { TileType } from '@common/enums/tile-type';
import { ExampleService } from '@app/services/example/example.service';
import { title } from 'process';
import { Message } from '@common/message';
import { Item } from '@app/model/schema/item.schema';
import { MapSize } from '@common/enums/map-size';
import { Directions } from '@common/interfaces/directions';
@Injectable()
export class GameValidationService {
    message : Message = {title : "`SpawnPoint found ",
    body : "A spawn point has been found",  
    };
    constructor(private readonly gameService: GameService, private readonly exampleService : ExampleService) {}

    async isGameNameUnique(name: string): Promise<boolean> {
        const existingGame = await this.gameService.getGameByName(name);
        return !existingGame;
    } // retourne vrai si le nom du jeu est unique

    async getNumberOfSpawnPoints(id: string): Promise<number> {
        const game = await this.gameService.getGame(id);
        let count = 0;
        for (let i = 0; i < game.tiles.length; i++) {
            for(let j = 0; j < game.tiles[i].length; j++) {
                if(game.tiles[i][j].item && game.tiles[i][j].item.type == "Spawn") {
                        count++;
                    }
                }
            }
            return count;
    }
        // retourne le nombre de points de spawn pour un jeu donné

    async isValidSizeBySpawnPoints(id: string): Promise<boolean> {
        const game = await this.gameService.getGame(id);
        const spawnPoints = await this.getNumberOfSpawnPoints(id);
        switch (game.size) {
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
    

    async mapToMatrix(id: string): Promise<number[][]> {
        const map = await this.gameService.getGame(id);
        const matrix: number[][] = map.tiles.map(row => 
            row.map(tile => 
                tile.type === TileType.Wall || tile.type === TileType.Door ? 1 : 0
            )
        );
        return matrix;
    }

    isValid(x:number,y:number, map:number[][], visited: boolean[][]): boolean {
        const n = map.length;
        const m = map[0].length;
        return x >= 0 && x < n && y >= 0 && y < m && map[x][y] === 0 && !visited[x][y];
    }

    async bfs(map:number[][], initialX: number, initialY: number, visited: boolean[][]) {
        const queue: [number, number][] = [];
        queue.push([initialX, initialY]);
        visited[initialX][initialY] = true;

        while (queue.length > 0) {
            const [x, y] = queue.shift(); // Obtenir la première case de la file
            for (const [dx, dy] of Directions) {
                const nx = x + dx;
                const ny = y + dy;
                if (this.isValid(nx, ny, map, visited)) {
                    console.log(nx, ny, this.isValid(nx, ny, map, visited));
                    visited[nx][ny] = true;
                    queue.push([nx, ny]);
                }
            }
        }
    }
    
    async mapIsValid(id: string): Promise<boolean> {
        const map = await this.mapToMatrix(id);
        const n = map.length;
        const m = map[0].length;
        const visited : boolean[][] = Array.from({ length: n }, () => Array(m).fill(false));
        
        let initX = -1;
        let initY = -1;
        for(let i = 0; i < n ; i++) {
            for(let j = 0; j < m; j++) {
                if(map[i][j] === 0) {
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
}
