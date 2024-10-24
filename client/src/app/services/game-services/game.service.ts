import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlayerAttributes } from 'src/app/classes/Characters/player-attributes';
import { PlayerCharacter } from 'src/app/classes/Characters/player-character';

export const VP_NUMBER = 5;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private accessCodeSubject = new BehaviorSubject<number | null>(null);
    private characterSubject = new BehaviorSubject<PlayerCharacter>(new PlayerCharacter('', '', new PlayerAttributes()));

    accessCode$ = this.accessCodeSubject.asObservable();
    character$ = this.characterSubject.asObservable();

    setAccessCode(code: number) {
        this.accessCodeSubject.next(code);
    }

    setCharacter(character: PlayerCharacter) {
        this.characterSubject.next(character);
    }

    generateVirtualCharacter(index: number): PlayerCharacter {
        return new PlayerCharacter('Joueur virtuel ' + (index + 1), '', new PlayerAttributes());
    }

    clearGame(): void {
        this.accessCodeSubject.next(null);
        this.characterSubject.next(new PlayerCharacter('', '', new PlayerAttributes()));
    }
}
