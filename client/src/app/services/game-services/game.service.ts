import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlayerAttributes } from 'src/app/classes/Characters/player-attributes';
import { PlayerCharacter } from 'src/app/classes/Characters/player-character';

const MATH_1000 = 1000;
const MATH_9000 = 9000;
export const VP_NUMBER = 5;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    characters: PlayerCharacter[] = [];
    private accessCode: number;
    private characterSubject = new BehaviorSubject<PlayerCharacter>(new PlayerCharacter('', '', new PlayerAttributes()));
    character$ = this.characterSubject.asObservable();

    generateAccessCode(): void {
        this.accessCode = Math.floor(MATH_1000 + Math.random() * MATH_9000);
    }

    getAccessCode(): number {
        return this.accessCode;
    }

    generateVirtualCharacters(): PlayerCharacter[] {
        for (let i = 0; i < VP_NUMBER; i++) {
            const character = new PlayerCharacter('Joueur virtuel ' + (i + 1), '', new PlayerAttributes());
            this.characters.push(character);
        }
        return this.characters;
    }

    setCharacter(character: PlayerCharacter) {
        this.characterSubject.next(character);
    }

    getCharacter(): PlayerCharacter {
        return this.characterSubject.getValue();
    }
}
