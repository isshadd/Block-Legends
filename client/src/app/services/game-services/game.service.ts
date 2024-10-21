import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlayerAttributes } from 'src/app/classes/Characters/player-attributes';
import { PlayerCharacter } from 'src/app/classes/Characters/player-character';

const MATH_1000 = 1000;
const MATH_9000 = 9000;
export const VP_NUMBER = 5;
const STORAGE_KEY_CHAR = 'currentCharacter';
const STRORAGE_KEY_CODE = 'accessCode';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    characters: PlayerCharacter[] = [];
    character$: Observable<PlayerCharacter>;
    private characterSubject = new BehaviorSubject<PlayerCharacter>(new PlayerCharacter('', '', new PlayerAttributes()));

    constructor() {
        this.character$ = this.characterSubject.asObservable();
    }

    storeCode(code: number): void {
        localStorage.setItem(STRORAGE_KEY_CODE, JSON.stringify(code));
    }

    getAccessCode(): number {
        const storedCode = localStorage.getItem(STRORAGE_KEY_CODE);
        if (storedCode) {
            return JSON.parse(storedCode) as number;
        } else {
            return Math.floor(MATH_1000 + Math.random() * MATH_9000);
        }
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
        localStorage.setItem(STORAGE_KEY_CHAR, JSON.stringify(character));
    }

    getCharacter(): PlayerCharacter {
        return this.characterSubject.getValue();
    }

    getStoredCharacter(): PlayerCharacter | null {
        const storedData = localStorage.getItem(STORAGE_KEY_CHAR);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            return new PlayerCharacter(
                parsedData.name,
                parsedData.avatar,
                new PlayerAttributes(
                    parsedData.attributes.attack,
                    parsedData.attributes.defense,
                    parsedData.attributes.speed,
                    parsedData.attributes.life,
                ),
            );
        }
        return null;
    }

    clearLocalStorage(): void {
        localStorage.removeItem(STORAGE_KEY_CHAR);
        localStorage.removeItem(STRORAGE_KEY_CODE);
        this.characterSubject.next(new PlayerCharacter('', '', new PlayerAttributes()));
    }
}
