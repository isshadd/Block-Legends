import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerAttributes } from '@app/classes/Characters/player-attributes';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { AttributesComponent } from '@app/components/create-character/attributes/attributes.component';
import { AvatarSelectionComponent } from '@app/components/create-character/avatar-selection/avatar-selection.component';
import { CharacterFormComponent } from '@app/components/create-character/character-form/character-form.component';
import { ModalComponent } from '@app/components/modal/modal.component';
import { GameService } from '@app/services/game-services/game.service';
import { CreateCharacterComponent } from '../create-character/create-character.component';

@Component({
    selector: 'app-player-create-character',
    standalone: true,
    imports: [FormsModule, CommonModule, AttributesComponent, AvatarSelectionComponent, CharacterFormComponent, ModalComponent],
    templateUrl: './player-create-character.component.html',
    styleUrl: './player-create-character.component.scss',
})
export class PlayerCreateCharacterComponent {
    character = new PlayerCharacter('', '', new PlayerAttributes());

    isModalOpen = false;

    characterStatus: string | null;

    constructor(
        private router: Router,
        private gameService: GameService,
        public createCharacter: CreateCharacterComponent,
    ) {}

    createPlayerCharacter() {
        const missingFields: string[] = [];
        const fieldsToCheck = [
            { field: this.character.name, label: 'Nom' },
            { field: this.character.avatar, label: 'Avatar' },
            { field: this.character.isAttackBonusAssigned, label: "Bonus d'attaque" },
            { field: this.character.isDefenseBonusAssigned, label: 'Bonus de défense' },
            { field: this.character.isLifeBonusAssigned, label: 'Bonus de vie' },
            { field: this.character.isSpeedBonusAssigned, label: 'Bonus de vitesse' },
        ];

        fieldsToCheck.forEach((item) => {
            switch (item.field) {
                case '':
                case false:
                    missingFields.push(item.label);
                    break;
                default:
                    break;
            }
        });
        if (missingFields.length > 0) {
            this.characterStatus = `Le formulaire de création de personnage n'est pas valide ! Manquants: ${missingFields.join(', ')}.`;
        } else if (!this.character.isNameValid) {
            this.characterStatus = 'Le nom du personnage est invalide !';
        } else {
            this.gameService.setCharacter(this.character);
            this.router.navigate(['/waiting-view']);
        }
    }
}
