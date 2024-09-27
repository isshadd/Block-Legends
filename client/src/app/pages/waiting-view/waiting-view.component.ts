import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService, VP_NUMBER } from '@app/services/game-services/game.service';
import { PlayerCharacter } from 'src/app/classes/Characters/player-character';

@Component({
    selector: 'app-waiting-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './waiting-view.component.html',
    styleUrl: './waiting-view.component.scss',
})
export class WaitingViewComponent implements OnInit {
    accessCode: number;
    players: PlayerCharacter[] = [];
    organizerCharacter: PlayerCharacter;
    playersCounter = 0;
    maxPlayerMessage = 'Le nombre maximum de joueurs est atteint !';
    isMaxPlayer: boolean;
    storedCharacter = this.gameService.getStoredCharacter();

    constructor(
        @Inject(GameService) private gameService: GameService,
        private router: Router,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.gameService.generateAccessCode();
        this.accessCode = this.gameService.getAccessCode();
        if (this.storedCharacter) {
            this.organizerCharacter = this.storedCharacter;
            this.organizerCharacter.setOrganizer();
            this.players.push(this.organizerCharacter);
        } else {
            this.gameService.character$.subscribe((character) => {
                if (character) {
                    this.organizerCharacter = character;
                    character.setOrganizer();
                    this.players.push(this.organizerCharacter);
                    this.cdr.detectChanges();
                }
            });
        }
    }

    addVirtualPlayers(): void {
        if (this.playersCounter < VP_NUMBER) {
            this.players.push(this.gameService.generateVirtualCharacters()[this.playersCounter]);
            this.playersCounter += 1;
        } else if (this.playersCounter >= VP_NUMBER) {
            this.maxPlayerMessage = 'Le nombre maximum de joueurs est atteint !';
            this.isMaxPlayer = true;
        }
    }

    playerLeave(): void {
        this.gameService.clearLocalStorage();
        this.router.navigate(['/home']);
    }
}
