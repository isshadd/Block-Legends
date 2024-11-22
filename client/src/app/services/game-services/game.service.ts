/* eslint-disable @typescript-eslint/member-ordering*/

import { Injectable } from '@angular/core';
import { AvatarService } from '@app/services/avatar.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Avatar, AvatarEnum } from '@common/enums/avatar-enum';
import { Profile } from '@common/enums/profile';
import { BehaviorSubject, Subject } from 'rxjs';

export const VP_NUMBER = 5;
const NINE = 9;
// const TWO = 2;
const THIRTY_SIX = 36;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    constructor(private avatarService: AvatarService) {}

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

    generateVirtualCharacter(index: number, profile: Profile): PlayerCharacter {
        let takenAvatars: string[] = [];

        this.avatarService.takenAvatars$.pipe().subscribe((avatarst) => {
            takenAvatars = avatarst;
        });

        const avatars = Object.values(AvatarEnum);
        const availableAvatars = avatars.filter((avatar) => !takenAvatars.includes(avatar.name));

        const randomAvatar = availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
        const virtualPlayer = new PlayerCharacter('');
        virtualPlayer.isVirtual = true;
        virtualPlayer.profile = profile;
        virtualPlayer.avatar = randomAvatar;
        virtualPlayer.name = randomAvatar.name;

        // Générer un socketId unique pour le joueur virtuel
        virtualPlayer.socketId = `${Math.random().toString(THIRTY_SIX).substr(1, NINE)}_${Math.random().toString(THIRTY_SIX).substr(2, NINE)}`;

        // Assigner un bonus aléatoire
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
