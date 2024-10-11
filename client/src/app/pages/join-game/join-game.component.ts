import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
/* import { BASE_STATS, DICE_4, DICE_6 } from '@app/pages/create-character/create-character.component';*/
import { GameService } from '@app/services/game-services/game.service';

export const MIN_CHAR = 48;
export const MAX_CHAR = 57;

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
        if (!this.accessCode || this.accessCode !== this.gameService.getAccessCode()) {
            this.errorMessage = "Le code d'accès est invalide !";
        }
    }

    allowOnlyNumbers(event: KeyboardEvent) {
        const char = event.key;
        if (char < '0' || char > '9') {
            // Only ASCII codes for numbers are allowed
            event.preventDefault();
        }
    }
}
