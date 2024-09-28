import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.services';
import { GameShared } from '@common/interfaces/game-shared';

@Component({
    selector: 'app-list-game',
    templateUrl: './listGame.component.html',
    styleUrls: ['./listGame.component.scss'],
    imports: [CommonModule, RouterLink],
    standalone: true,
})
export class ListGameComponent {
    constructor(private administrationService: AdministrationPageManagerService) {}

    getGames(): GameShared[] {
        return this.administrationService.games;
    }

    deleteGame(id: string | null | undefined): void {
        if (!id || id === undefined) {
            return;
        }
        this.administrationService.deleteGame(id);
    }

    toggleVisibility(game: GameShared): void {
        this.administrationService.toggleVisibility(game);
    }
}
