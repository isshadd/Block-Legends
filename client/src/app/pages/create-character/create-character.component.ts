import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export const BONUS_LIFE = 6;
export const BONUS_SPEED = 6;
export const DICE_6 = 6;
export const DICE_4 = 4;
export const BASE_STATS = 4;

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

    isModalOpen = false;

    bonusAttribute: string;
    characterStatus: string | null;

    isAttackDiceAssigned: boolean = false;
    isDefenseDiceAssigned: boolean = false;
    isLifeOrSpeedBonusAssigned: boolean = false;

    constructor(private router: Router) {}

    diceAttribution(attribute: string) {
        if (attribute === 'attack' && !this.isAttackDiceAssigned && !this.isAttackDiceAssigned) {
            this.character.attack += Math.floor(Math.random() * DICE_6) + 1;
            this.character.defense += Math.floor(Math.random() * DICE_4) + 1;
        } else if (attribute === 'defense' && !this.isDefenseDiceAssigned && !this.isAttackDiceAssigned) {
            this.character.defense += Math.floor(Math.random() * DICE_6) + 1;
            this.character.attack += Math.floor(Math.random() * DICE_4) + 1;
        }
        this.isAttackDiceAssigned = true;
        this.isDefenseDiceAssigned = true;
    }

    assignBonus() {
        if (this.bonusAttribute === 'life') {
            this.character.life = BONUS_LIFE;
            this.character.speed = BASE_STATS;
        } else if (this.bonusAttribute === 'speed') {
            this.character.speed = BONUS_SPEED;
            this.character.life = BASE_STATS;
        }
        this.isLifeOrSpeedBonusAssigned = true;
    }

    createCharacter() {
        if (
            !this.character.name ||
            !this.character.avatar || // A CHANGER PLUS TARD
            !this.isAttackDiceAssigned ||
            !this.isAttackDiceAssigned ||
            !this.isLifeOrSpeedBonusAssigned
        ) {
            this.characterStatus = "Le formulaire de création de personnage n'est pas valide !";
        } else {
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
