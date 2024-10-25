import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService, VP_NUMBER } from '@app/services/game-services/game.service';
import { PlayerCharacter } from 'src/app/classes/Characters/player-character';
import { ClavardageComponent } from '@app/components/clavardage/clavardage.component';

@Component({
    selector: 'app-waiting-view',
    standalone: true,
    imports: [CommonModule, ClavardageComponent],
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
    storedCode = this.gameService.getAccessCodeFromStorage();

    constructor(
        @Inject(GameService) private gameService: GameService,
        private router: Router,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        if (!this.storedCode) {
            this.gameService.generateAccessCode();
            this.accessCode = this.gameService.getAccessCode();
            this.gameService.storeCode();
        } else {
            this.accessCode = this.storedCode;
        }
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
