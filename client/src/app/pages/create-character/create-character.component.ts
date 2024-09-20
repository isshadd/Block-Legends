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

@Component({
    selector: 'app-create-character',
    standalone: true,
    imports: [FormsModule, CommonModule, AttributesComponent, AvatarSelectionComponent, CharacterFormComponent, ModalComponent],
    templateUrl: './create-character.component.html',
    styleUrl: './create-character.component.scss',
})
export class CreateCharacterComponent {
    character = new PlayerCharacter('', '', new PlayerAttributes());

    isModalOpen = false;

    characterStatus: string | null;

    constructor(private router: Router) {}

    createCharacter() {
        if (
            !this.character.name ||
            !this.character.avatar ||
            !this.character.isAttackBonusAssigned ||
            !this.character.isDefenseBonusAssigned ||
            !this.character.isLifeBonusAssigned ||
            !this.character.isSpeedBonusAssigned
        ) {
            this.characterStatus = "Le formulaire de création de personnage n'est pas valide !";
            console.log(this.character);
        } else {
            this.character.setOrganizer();
            this.router.navigate(['/waiting-view']);
        }
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    confirmBack() {
        this.closeModal();
        this.router.navigate(['/create-game']);
    }
}
