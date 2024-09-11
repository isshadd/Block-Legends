import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-game',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './create-game.component.html',
    styleUrl: './create-game.component.scss',
})
export class CreateGameComponent {
    games = [{ id: 1, name: 'Jeu 1', description: "C'est le jeu 1", visible: true }];

    selectedGame: any;
    gameStatus: string | null;

    constructor(private router: Router) {}

    selectGame(game: any /*A CHANGER UNE FOIS LE TYPE DE {game} DEFINI*/) {
        if (!game.visible) {
            this.gameStatus = `Le jeu choisi ${game.name} n'est plus visible ou supprimé`;
            this.selectedGame = null;
        } else {
            this.selectedGame = game;
            this.gameStatus = null;
            this.router.navigate(['/create-character']);
        }
    }
}
