import { GameService } from '@app/services/game/game.service';
import { Body, Injectable } from '@nestjs/common';
import { ItemType } from '@common/enums/item-type';
import { Game } from '@app/model/database/game';
import { TileType } from '@common/enums/tile-type';
import { ExampleService } from '@app/services/example/example.service';
import { title } from 'process';
import { Message } from '@common/message';
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
                if(game.tiles[i][j].type === TileType.Grass) {
                        count++;
                        // Send a message to the server with the type of item
                        this.exampleService.storeMessage(this.message);
                        return count;
                    }
                }
            }
        }
        // retourne le nombre de points de spawn pour un jeu donné
    
}
