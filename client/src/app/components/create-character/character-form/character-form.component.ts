import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { AttributesComponent } from '@app/components/create-character/attributes/attributes.component';
import { AvatarSelectionComponent } from '@app/components/create-character/avatar-selection/avatar-selection.component';

export const NAME_MAX_LENGTH = 15;

@Component({
    selector: 'app-character-form',
    standalone: true,
    imports: [CommonModule, FormsModule, AttributesComponent, AvatarSelectionComponent],
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
    }
}
