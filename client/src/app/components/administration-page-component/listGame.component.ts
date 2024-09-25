import { Component } from '@angular/core';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.services';
import { Game } from '@common/game.interface';

@Component({
    selector: 'app-list-game',
    templateUrl: './listGame.component.html',
    styleUrls: ['./listGame.component.scss'],
    standalone: true,
})
export class ListGameComponent {
    constructor(private administrationService: AdministrationPageManagerService) {}

    getGames(): Game[] {
        return this.administrationService.games;
    }

    deleteGame(game: Game): void {
        this.administrationService.deleteGame(game);
    }

    toggleVisibility(game: Game): void {
        this.administrationService.toggleVisibility(game);
    }
}
