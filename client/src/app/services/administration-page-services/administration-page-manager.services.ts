import { Injectable } from '@angular/core';
import { Game } from '@common/game.interface';
import { CommunicationService } from '../communication.service';

@Injectable({
    providedIn: 'root',
})
export class AdministrationPageManagerService {
    games: Game[];

    constructor(private communicationService: CommunicationService) {
        this.communicationService.getGames().subscribe((games: Game[]) => {
            this.games = games;
        });
    }

    deleteGame(game: Game): void {
        this.communicationService.deleteOneGame(game.name).subscribe();
        this.games = this.games.filter((elem) => elem.name !== game.name);
    }

    toggleVisibility(game: Game): void {
        game.isVisible = !game.isVisible;
    }
}
