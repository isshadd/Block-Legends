import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WebSocketService } from '@app/services/socket-service/websocket-service/websocket.service';
import { GAME_CODE_MAX_VALUE } from '@common/constants/game_constants';
import { SocketEvents } from '@common/enums/gateway-events/socket-events';

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
    isErrorMessageVisible: boolean = false;

    constructor(
        private webSocketService: WebSocketService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.webSocketService.avatarTakenError$.subscribe((message) => {
            if (message) {
                this.errorMessage = message;
            }
        });
    }

    joinGame(): void {
        if (this.accessCode) {
            this.webSocketService.init();
            this.webSocketService.joinGame(this.accessCode);
        }
        this.webSocketService.socket.on(SocketEvents.JOIN_GAME_RESPONSE_CODE_INVALID, (response: { message: string }) => {
            this.isErrorMessageVisible = true;
            this.errorMessage = response.message;
        });
        this.webSocketService.socket.on(SocketEvents.JOIN_GAME_RESPONSE_LOCKED_ROOM, (response: { message: string }) => {
            this.isErrorMessageVisible = true;
            this.errorMessage = response.message;
        });
    }

    allowOnlyNumbers(event: KeyboardEvent) {
        const input = event.target as HTMLInputElement;
        const char = event.key;

        if (char < '0' || char > '9') {
            event.preventDefault();
            return;
        }

        const currentValue = input.value;
        if (currentValue.length >= GAME_CODE_MAX_VALUE) {
            if (!['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) {
                event.preventDefault();
            }
        }
    }

    goHome(): void {
        this.router.navigate(['/']);
    }
}
