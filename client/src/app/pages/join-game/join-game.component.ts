import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
/* import { BASE_STATS, DICE_4, DICE_6 } from '@app/pages/create-character/create-character.component';*/
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-join-game',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './join-game.component.html',
    styleUrl: './join-game.component.scss',
})
export class JoinGameComponent {
    accessCode: number | null;
    errorMessage: string | null;

    constructor(
        private gameService: GameService, // private router: Router,
    ) {}

    joinGame(): void {
        /*
        const playerCharacter = {
            name: 'Player 1',
            avatar: 'avatar_url',
            life: BASE_STATS, // LES 4 LIGNES SUIVANTES DEVRONT ETRE MODIFIEES PLUS TARD
            speed: BASE_STATS,
            attack: BASE_STATS + Math.floor(Math.random() * DICE_6) + 1,
            defense: BASE_STATS + Math.floor(Math.random() * DICE_4) + 1,
        };
        */
        if (!this.accessCode || this.accessCode !== this.gameService.getAccessCode()) {
            this.errorMessage = "Le code d'accès est invalide !";
        }
    }
}
