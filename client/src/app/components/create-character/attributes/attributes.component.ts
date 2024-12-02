import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlayerCharacter } from '@common/classes/Player/player-character';

export enum ButtonType {
    HEALTH = 'health',
    SPEED = 'speed',
    ATTACK = 'attack',
    DEFENSE = 'defense',
}
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
    buttonType = ButtonType;

    isBlinking: boolean = true;
    isHealthDisabled: boolean = true;
    isSpeedDisabled: boolean = true;
    isFirstClick: boolean = true;
    selectedAttackDice: string = 'dice6';
    selectedDefenseDice: string = 'dice4';

    get healthArray() {
        return new Array(this.character.attributes.life);
    }

    get speedArray() {
        return new Array(this.character.attributes.speed);
    }

    get attackArray() {
        return new Array(this.character.attributes.attack);
    }

    get defenseArray() {
        return new Array(this.character.attributes.defense);
    }
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

    buttonClicked(type: ButtonType): void {
        if (this.isFirstClick) {
            this.isBlinking = false;
        }
        switch (type) {
            case ButtonType.HEALTH:
                this.isHealthDisabled = !this.isHealthDisabled;
                this.isSpeedDisabled = true;
                break;
            case ButtonType.SPEED:
                this.isSpeedDisabled = !this.isSpeedDisabled;
                this.isHealthDisabled = true;
                break;
        }
    }
}
