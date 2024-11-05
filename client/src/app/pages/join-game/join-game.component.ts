import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// import { Router } from '@angular/router';
/* import { BASE_STATS, DICE_4, DICE_6 } from '@app/pages/create-character/create-character.component';*/
import { WebSocketService } from '@app/services/SocketService/websocket.service';

export const MIN_CHAR = 48;
export const MAX_CHAR = 57;
const MAX_VALUE = 4;

@Component({
    selector: 'app-join-game',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './join-game.component.html',
    styleUrl: './join-game.component.scss',
})
export class JoinGameComponent implements OnInit {
    accessCode: number | null;
    errorMessage: string | null;

    constructor(
        // private gameService: GameService, // private router: Router,
        private webSocketService: WebSocketService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.webSocketService.avatarTakenError$.subscribe((message) => {
            if (message) {
                this.errorMessage = message;
                alert(message); // Display the error message in an alert
            }
        });
    }

    joinGame(): void {
        if (!this.accessCode) {
            this.errorMessage = "Le code d'accès est invalide !";
        } else {
            this.errorMessage = null;
            this.webSocketService.init();
            this.webSocketService.joinGame(this.accessCode);
        }
    }

    allowOnlyNumbers(event: KeyboardEvent) {
        const input = event.target as HTMLInputElement;
        const char = event.key;

        if (char < '0' || char > '9') {
            event.preventDefault();
            return;
        }

        const currentValue = input.value;
        if (currentValue.length >= MAX_VALUE) {
            if (!['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) {
                event.preventDefault();
            }
        }
    }

    goHome(): void {
        this.router.navigate(['/']); // Navigate to home route
    }
}
