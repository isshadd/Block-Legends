import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@common/classes/player-character';
import { Avatar, AvatarEnum } from '@common/enums/avatar-enum';
import { VIRTUAL_PLAYER_NAMES } from '@common/enums/virtual-player-names';
import { BehaviorSubject, Subject } from 'rxjs';

export const VP_NUMBER = 5;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    accessCodeSubject = new BehaviorSubject<number | null>(null);
    characterSubject = new BehaviorSubject<PlayerCharacter | null>(new PlayerCharacter(''));

    accessCode$ = this.accessCodeSubject.asObservable();
    character$ = this.characterSubject.asObservable();

    currentPlayerSubject = new BehaviorSubject<PlayerCharacter>(new PlayerCharacter(''));
    currentPlayer$ = this.currentPlayerSubject.asObservable();

    signalAvatarSelected = new Subject<Avatar>();
    signalAvatarSelected$ = this.signalAvatarSelected.asObservable();

    private usedNames: Set<string> = new Set();

    setAccessCode(code: number) {
        this.accessCodeSubject.next(code);
    }

    setCharacter(character: PlayerCharacter) {
        this.characterSubject.next(character);
    }

    updatePlayerName(name: string) {
        const character = this.characterSubject.getValue() as PlayerCharacter;
        character.name = name;
        this.characterSubject.next(character);
    }

    setCurrentPlayer(player: PlayerCharacter) {
        this.currentPlayerSubject.next(player);
    }

    generateVirtualCharacter(index: number, profile: 'aggressive' | 'defensive'): PlayerCharacter {
        const virtualPlayer = new PlayerCharacter('');
        virtualPlayer.isVirtual = true;
        virtualPlayer.profile = profile;

        const avatars = Object.values(AvatarEnum);
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        virtualPlayer.avatar = randomAvatar;

        const availableNames = VIRTUAL_PLAYER_NAMES.filter((name) => !this.usedNames.has(name));
        // if (availableNames.length === 0) {
        //     throw new Error('No more unique names available for virtual players');
        // }
        const selectedName = availableNames[Math.floor(Math.random() * availableNames.length)];
        virtualPlayer.name = selectedName;
        this.usedNames.add(selectedName);

        const bonusOptions = ['attack', 'defense', 'life', 'speed'];
        const bonusAttribute = bonusOptions[Math.floor(Math.random() * bonusOptions.length)];
        switch (bonusAttribute) {
            case 'attack':
                virtualPlayer.assignAttackDice();
                break;
            case 'defense':
                virtualPlayer.assignDefenseDice();
                break;
            case 'life':
                virtualPlayer.assignLifeBonus();
                break;
            case 'speed':
                virtualPlayer.assignSpeedBonus();
                break;
        }

        return virtualPlayer;
    }

    releaseVirtualPlayerName(name: string): void {
        if (this.usedNames.has(name)) {
            this.usedNames.delete(name);
        }
    }

    clearGame(): void {
        this.accessCodeSubject.next(null);
        this.characterSubject.next(null);
        this.usedNames.clear();
    }

    setSelectedAvatar(avatar: Avatar) {
        this.signalAvatarSelected.next(avatar);
    }
}
