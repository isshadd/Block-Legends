import { Injectable, OnDestroy } from '@angular/core';
import { GameServerCommunicationService } from '@app/services/game-server-communication/game-server-communication.service';
import { GameShared } from '@common/interfaces/game-shared';
import { Subject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AdministrationPageManagerService implements OnDestroy {
    signalGamesSetted = new Subject<GameShared[]>();
    signalGamesSetted$ = this.signalGamesSetted.asObservable();

    games: GameShared[] = [];
    private subscriptions: Subscription = new Subscription();

    constructor(private gameServerCommunicationService: GameServerCommunicationService) {
        this.setGames();
    }

    setGames(): void {
        this.subscriptions.add(
            this.gameServerCommunicationService.getGames().subscribe((games: GameShared[]) => {
                this.games = games;
                this.signalGamesSetted.next(this.games);
            }),
        );
    }

    deleteGame(id: string): void {
        this.subscriptions.add(
            this.gameServerCommunicationService.deleteGame(id).subscribe(() => {
                this.games = this.games.filter((elem) => elem._id !== id);
                this.signalGamesSetted.next(this.games);
            }),
        );
    }

    toggleVisibility(game: GameShared): void {
        if (!game._id) return;
        game.isVisible = !game.isVisible;
        this.subscriptions.add(
            this.gameServerCommunicationService
                .updateGame(game._id, {
                    isVisible: game.isVisible,
                })
                .subscribe(),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}
