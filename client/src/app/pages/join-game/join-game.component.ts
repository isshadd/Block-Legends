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
    errorMessage: string | null = '';

    constructor(
        private gameService: GameService, // private router: Router,
    ) {}

    joinGame(): void {
        if (!this.accessCode || this.accessCode !== this.gameService.getAccessCode()) {
            this.errorMessage = "Le code d'accès est invalide !";
        }
    }

    validateAccessCode(event: any): void {
        const input = event.target.value;
        const sanitizedInput = input.replace(/\D/g, '');
        if (sanitizedInput > 9999) {
            this.accessCode = 9999;
        } else {
            this.accessCode = sanitizedInput;
        }
        event.target.value = this.accessCode;
    }
}
