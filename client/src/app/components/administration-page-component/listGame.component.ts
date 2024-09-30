import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.services';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameShared } from '@common/interfaces/game-shared';

@Component({
    selector: 'app-list-game',
    templateUrl: './listGame.component.html',
    styleUrls: ['./listGame.component.scss'],
    imports: [CommonModule, RouterLink],
    standalone: true,
})
export class ListGameComponent {
    constructor(
        private administrationService: AdministrationPageManagerService,
        public gameMapDataManagerService: GameMapDataManagerService,
        private router: Router,
    ) {
        this.administrationService.setGames();
    }

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

    editGame(game: GameShared): void {
        localStorage.setItem('isNewGame', JSON.stringify(false));
        localStorage.setItem('gameToEdit', JSON.stringify(game));
        this.router.navigate(['/map-editor']);
    }
}
