import { CommonModule } from '@angular/common'; // Importez CommonModule
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.services';
import { ModeService } from '@app/services/game-mode-services/gameMode.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { GameMode } from '@common/enums/game-mode';
import { GameShared } from '@common/interfaces/game-shared';

@Component({
    selector: 'app-game-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './game-list.component.html',
    styleUrl: './game-list.component.scss',
})
export class GameListComponent implements OnInit {
    games: GameShared[] = [];
    selectedGame: GameShared | null;
    gameStatus: string | null;
    selectedMode: GameMode = GameMode.Classique;

    constructor(
        private modeService: ModeService,
        private router: Router,
        private administrationService: AdministrationPageManagerService,
        private gameServerCommunicationService: GameServerCommunicationService,
    ) {
        this.gameServerCommunicationService.getGames().subscribe((games: GameShared[]) => {
            this.games = games;
        });
    }

    getGames(): GameShared[] {
        return this.administrationService.games;
    }

    ngOnInit(): void {
        this.modeService.selectedMode$.subscribe((mode) => {
            this.selectedMode = mode;
        });
    }

    homeButton() {
        this.router.navigate(['/home']);
    }

    selectGame(game: GameShared) {
        if (!game.isVisible) {
            this.gameStatus = `Le jeu choisi ${game.name} n'est plus visible ou supprimé`;
            this.selectedGame = null;
        } else {
            this.selectedGame = game;
            this.gameStatus = null;
            this.router.navigate(['/create-character']);
        }
    }

    getFilteredGames() {
        return this.games.filter((game) => game.isVisible && game.mode === this.selectedMode);
    }
}
