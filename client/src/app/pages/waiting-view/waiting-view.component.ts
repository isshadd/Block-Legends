import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game.service';
import { PlayerAttributes } from 'src/app/classes/Characters/player-attributes';
import { PlayerCharacter } from 'src/app/classes/Characters/player-character';

@Component({
    selector: 'app-waiting-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './waiting-view.component.html',
    styleUrl: './waiting-view.component.scss',
    providers: [GameService],
})
export class WaitingViewComponent implements OnInit {
    accessCode: number;
    players: PlayerCharacter[] = [];
    organizerCharacter = new PlayerCharacter('Organizer', '', new PlayerAttributes());
    virtualPlayersCounter = 0;

    constructor(
        @Inject(GameService) private gameService: GameService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.gameService.generateAccessCode();
        this.accessCode = this.gameService.getAccessCode();
        this.organizerCharacter.setOrganizer();

        if (this.organizerCharacter.isOrganizer) {
            this.players.push(this.organizerCharacter);
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
