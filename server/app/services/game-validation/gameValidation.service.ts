import { GameService } from '@app/services/game/game.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameValidationService {
    constructor(private readonly gameService: GameService) {}

    async isGameNameUnique(name: string): Promise<boolean> {
        const existingGame = await this.gameService.getGameByName(name);
        return !existingGame;
    } // retourne vrai si le nom du jeu est unique
}
