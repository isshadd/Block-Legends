import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

@Component({
    selector: 'app-attributes',
    standalone: true,
    imports: [CommonModule, FormsModule, MatTooltipModule],
    templateUrl: './attributes.component.html',
    styleUrl: './attributes.component.scss',
})
export class AttributesComponent {
    @Input() character: PlayerCharacter;

    characterStatus: string | null;

    selectedAttackDice: string = 'dice6';
    selectedDefenseDice: string = 'dice4';

    assignAttackDice(event: Event): void {
        const target = event.target as HTMLSelectElement;
        const dice = target.value;
        this.selectedAttackDice = dice;
        this.character.assignAttackDice();
        if (dice === 'dice6') {
            this.selectedDefenseDice = 'dice4';
        } else {
            this.selectedDefenseDice = 'dice6';
        }
    }

    assignDefenseDice(event: Event): void {
        const target = event.target as HTMLSelectElement;
        const dice = target.value;
        this.selectedDefenseDice = dice;
        this.character.assignDefenseDice();
        if (dice === 'dice4') {
            this.selectedAttackDice = 'dice6';
        } else {
            this.selectedAttackDice = 'dice4';
        }
    }
}
