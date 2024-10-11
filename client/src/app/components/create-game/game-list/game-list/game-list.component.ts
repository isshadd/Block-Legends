import { CommonModule } from '@angular/common'; // Importez CommonModule
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalOneOptionComponent } from '@app/components/modal-one-option/modal-one-option.component';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.services';
import { ModeService } from '@app/services/game-mode-services/gameMode.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { GameMode } from '@common/enums/game-mode';
import { GameShared } from '@common/interfaces/game-shared';

@Component({
    selector: 'app-game-list',
    standalone: true,
    imports: [CommonModule, ModalOneOptionComponent],
    templateUrl: './game-list.component.html',
    styleUrl: './game-list.component.scss',
})
export class GameListComponent implements OnInit {
    games: GameShared[] = [];
    selectedGame: GameShared | null;
    gameStatus: string | null;
    selectedMode: GameMode = GameMode.Classique;
    isModalOpen = false;

    constructor(
        private modeService: ModeService,
        private router: Router,
        private administrationService: AdministrationPageManagerService,
        private gameServerCommunicationService: GameServerCommunicationService,
    ) {}

    getGames(): GameShared[] {
        return this.administrationService.games;
    }

    ngOnInit(): void {
        this.modeService.selectedMode$.subscribe((mode) => {
            this.selectedMode = mode;
        });
        this.gameServerCommunicationService.getGames().subscribe((games: GameShared[]) => {
            this.games = games;
        });
    }

    homeButton() {
        this.router.navigate(['/home']);
    }

    selectGame(game: GameShared) {
        this.gameServerCommunicationService.getGame(game._id).subscribe((updatedGame: GameShared) => {
            if (!updatedGame || !updatedGame.isVisible ) {
                this.gameStatus = `Le jeu choisi ${updatedGame ? updatedGame.name : ''} n'est plus disponible`;
                this.selectedGame = null;
            } else {
                this.selectedGame = updatedGame;
                this.gameStatus = null;
                this.router.navigate(['/create-character']);
            }
        });
    }

    getFilteredGames() {
        return this.games.filter((game) => game.isVisible && game.mode === this.selectedMode && game != null);
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        this.gameStatus = null; // Réinitialiser le message d'erreur
    }

    confirmBack() {
        this.closeModal();
        // this.router.navigate(['/create-game']);
        window.location.reload();
    }

}
