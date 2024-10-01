import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

export const NAME_MAX_LENGTH = 15;

@Component({
    selector: 'app-character-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './character-form.component.html',
    styleUrl: './character-form.component.scss',
})
export class CharacterFormComponent {
    @Input() character: PlayerCharacter;

    characterStatus: string | null;

    isModalOpen = false;

    maxNameLength: number = NAME_MAX_LENGTH;

    savedName: string | null = null;

    saveName() {
        this.savedName = this.character.name;
        if (this.savedName !== null && this.savedName.trim().length > 0) {
            this.character.isNameValid = true;
        } else {
            this.character.isNameValid = false;
        }
    }
}
