import { Injectable } from '@angular/core';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { GameShared } from '@common/interfaces/game-shared';

@Injectable({
    providedIn: 'root',
})
export class AdministrationPageManagerService {
    games: GameShared[] = [];

    constructor(private gameServerCommunicationService: GameServerCommunicationService) {
        this.gameServerCommunicationService.getGames().subscribe((games: GameShared[]) => {
            this.games = games;
        });
    }

    deleteGame(id: string): void {
        this.gameServerCommunicationService.deleteGame(id).subscribe();
        this.games = this.games.filter((elem) => elem._id !== id);
    }

    toggleVisibility(game: GameShared): void {
        if (!game._id) {
            console.error('Game id is not defined');
            return;
        }
        game.isVisible = !game.isVisible;
        this.gameServerCommunicationService.updateGame(game._id, { isVisible: game.isVisible }).subscribe();
    }
}
