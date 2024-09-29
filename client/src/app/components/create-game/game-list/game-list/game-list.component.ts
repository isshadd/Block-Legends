import { CommonModule } from '@angular/common'; // Importez CommonModule
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModeService } from '@app/services/game-mode-services/gameMode.service';
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
    ) {}

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
        if (!this.selectedMode) {
            return this.games;
        }
        return this.games.filter((game) => game.isVisible && game.mode === this.selectedMode);
    }
}
