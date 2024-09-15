import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-waiting-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './waiting-view.component.html',
    styleUrl: './waiting-view.component.scss',
    providers: [GameService],
})
export class WaitingViewComponent implements OnInit {
    accessCode: string = '';
    players: { name: string; avatar: string; life: number; speed: number; attack: number; defense: number }[] = [];
    isOrganizer: boolean = true;
    organizerCharacter: { name: string; avatar: string; life: number; speed: number; attack: number; defense: number } = {
        name: 'Organizer', // A CHANGER PLUS TARD, CECI EST SEULEMENT POUR LE TEST DE LA PAGE
        avatar: '',
        life: 4,
        speed: 4,
        attack: 4,
        defense: 4,
    };
    virtualPlayersCounter = 0;

    constructor(
        @Inject(GameService) private gameService: GameService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.gameService.generateAccessCode();
        this.accessCode = this.gameService.getAccessCode();

        if (this.isOrganizer) {
            this.players.push(this.organizerCharacter);
            console.log(this.organizerCharacter);
        }
    }

    addVirtualPlayers(): void {
        this.players.push(this.gameService.generateVirtualCharacters()[this.virtualPlayersCounter]);
        this.virtualPlayersCounter += 1;
    }

    playerLeave(): void {
        this.router.navigate(['/home']);
    }
}
