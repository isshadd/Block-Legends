import { Injectable } from '@angular/core';
import { BASE_STATS, DICE_4, DICE_6 } from '@app/pages/create-character/create-character.component';

const MATH_1000 = 1000;
const MATH_9000 = 9000;
const VP_NUMBER = 100;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private accessCode: string = '';

    generateAccessCode(): void {
        this.accessCode = Math.floor(MATH_1000 + Math.random() * MATH_9000).toString();
    }

    getAccessCode(): string {
        return this.accessCode;
    }

    generateVirtualCharacters(): {
        name: string;
        avatar: string;
        life: number;
        speed: number;
        attack: number;
        defense: number;
    }[] {
        const characters = [];
        for (let i = 0; i < VP_NUMBER; i++) {
            const character = {
                name: 'Virtual_Player ' + (i + 1),
                avatar: '',
                life: BASE_STATS, // LES 4 LIGNES SUIVANTES DEVRONT ETRE MODIFIEES PLUS TARD
                speed: BASE_STATS,
                attack: BASE_STATS + Math.floor(Math.random() * DICE_6) + 1,
                defense: BASE_STATS + Math.floor(Math.random() * DICE_4) + 1,
            };
            characters.push(character);
        }
        return characters;
    }
}
