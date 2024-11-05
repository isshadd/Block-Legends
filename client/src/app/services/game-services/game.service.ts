import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlayerCharacter } from 'src/app/classes/Characters/player-character';

export const VP_NUMBER = 5;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    accessCodeSubject = new BehaviorSubject<number | null>(null);
    characterSubject = new BehaviorSubject<PlayerCharacter>(new PlayerCharacter(''));

    accessCode$ = this.accessCodeSubject.asObservable();
    character$ = this.characterSubject.asObservable();

    setAccessCode(code: number) {
        this.accessCodeSubject.next(code);
    }

    setCharacter(character: PlayerCharacter) {
        this.characterSubject.next(character);
    }

    updatePlayerName(name: string) {
        const character = this.characterSubject.getValue();
        character.name = name;
        this.characterSubject.next(character);
    }

    generateVirtualCharacter(index: number): PlayerCharacter {
        return new PlayerCharacter('Joueur virtuel ' + (index + 1));
    }

    clearGame(): void {
        this.accessCodeSubject.next(null);
        this.characterSubject.next(new PlayerCharacter(''));
    }
}
