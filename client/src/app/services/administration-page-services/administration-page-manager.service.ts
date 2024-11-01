import { Injectable } from '@angular/core';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { GameShared } from '@common/interfaces/game-shared';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AdministrationPageManagerService {
    signalGamesSetted = new Subject<GameShared[]>();
    signalGamesSetted$ = this.signalGamesSetted.asObservable();

    games: GameShared[] = [];

    constructor(private gameServerCommunicationService: GameServerCommunicationService) {
        this.setGames();
    }

    setGames(): void {
        this.gameServerCommunicationService.getGames().subscribe((games: GameShared[]) => {
            this.games = games;
            this.signalGamesSetted.next(this.games);
        });
    }

    deleteGame(id: string): void {
        this.gameServerCommunicationService.deleteGame(id).subscribe(() => {
            this.games = this.games.filter((elem) => elem._id !== id);
            this.signalGamesSetted.next(this.games);
        });
    }

    toggleVisibility(game: GameShared): void {
        if (!game._id) return;
        console.log(game);
        game.isVisible = !game.isVisible;
        this.gameServerCommunicationService.updateGame(game._id, { isVisible: game.isVisible }).subscribe();
    }
}
