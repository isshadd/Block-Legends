import { Injectable } from '@angular/core';
import { Game } from '@common/game.interface';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';

@Injectable({
    providedIn: 'root',
})
export class AdministrationPageManagerService {
    games: Game[];

    constructor(private gameServerCommunicationService: GameServerCommunicationService) {
        this.gameServerCommunicationService.getGames().subscribe((games: Game[]) => {
            this.games = games;
        });
    }

    deleteGame(game: Game): void {
        this.gameServerCommunicationService.deleteOneGame(game.name).subscribe();
        this.games = this.games.filter((elem) => elem.name !== game.name);
    }

    toggleVisibility(game: Game): void {
        game.isVisible = !game.isVisible;
    }
}
