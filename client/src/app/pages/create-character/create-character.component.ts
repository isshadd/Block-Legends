import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-character',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './create-character.component.html',
    styleUrl: './create-character.component.scss',
})
export class CreateCharacterComponent {
    avatars = [];
    character = {
        name: '',
        avatar: '',
        life: 4,
        speed: 4,
        attack: 4,
        defense: 4,
    };

    bonusAttribute: string;
    characterStatus: string | null;

    isAttackDiceAssigned: boolean = false;
    isDefenseDiceAssigned: boolean = false;
    isLifeOrSpeedBonusAssigned: boolean = false;

    constructor(private router: Router) {}

    diceAttribution(attribute: string) {
        if (attribute === 'attack' && !this.isAttackDiceAssigned && !this.isAttackDiceAssigned) {
            this.character.attack += Math.floor(Math.random() * 6) + 1;
            this.character.defense += Math.floor(Math.random() * 4) + 1;
        } else if (attribute === 'defense' && !this.isDefenseDiceAssigned && !this.isAttackDiceAssigned) {
            this.character.defense += Math.floor(Math.random() * 6) + 1;
            this.character.attack += Math.floor(Math.random() * 4) + 1;
        }
        this.isAttackDiceAssigned = true;
        this.isDefenseDiceAssigned = true;
    }

    assignBonus() {
        if (this.bonusAttribute === 'life') {
            this.character.life = 6;
            this.character.speed = 4;
        } else if (this.bonusAttribute === 'speed') {
            this.character.speed = 6;
            this.character.life = 4;
        }
    }

    createCharacter() {
        if (
            !this.character.name ||
            !this.character.avatar ||
            !this.isAttackDiceAssigned ||
            !this.isAttackDiceAssigned ||
            !this.isLifeOrSpeedBonusAssigned
        ) {
            this.characterStatus = "Le formulaire de création de personnage n'est pas valide !";
        } else {
            this.router.navigate(['/waiting-view']);
        }
    }
}
