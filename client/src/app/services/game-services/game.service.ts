/* eslint-disable @typescript-eslint/member-ordering*/ // Disabling member ordering is necessary for the `accessCodeSubject` and `characterSubject` to be declared before being used

import { Injectable, OnDestroy } from '@angular/core';
import { AvatarService } from '@app/services/avatar-service/avatar.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { RANDOM_NUMBER, RANDOM_SOCKET_NUMBER } from '@common/constants/game_constants';
import { Avatar, AvatarEnum } from '@common/enums/avatar-enum';
import { DiceType } from '@common/enums/dice-type';
import { ProfileEnum } from '@common/enums/profile';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameService implements OnDestroy {
    constructor(private avatarService: AvatarService) {}

    accessCodeSubject = new BehaviorSubject<number | null>(null);
    characterSubject = new BehaviorSubject<PlayerCharacter | null>(new PlayerCharacter(''));

    accessCode$ = this.accessCodeSubject.asObservable();
    character$ = this.characterSubject.asObservable();

    currentPlayerSubject = new BehaviorSubject<PlayerCharacter>(new PlayerCharacter(''));
    currentPlayer$ = this.currentPlayerSubject.asObservable();

    signalAvatarSelected = new Subject<Avatar>();
    signalAvatarSelected$ = this.signalAvatarSelected.asObservable();

    usedNames: Set<string> = new Set();

    private subscriptions: Subscription = new Subscription();

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

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

    generateVirtualCharacter(index: number, comportement: ProfileEnum): PlayerCharacter {
        let takenAvatars: string[] = [];

        this.subscriptions.add(
            this.avatarService.takenAvatars$.pipe().subscribe((avatarst) => {
                takenAvatars = avatarst;
            }),
        );

        const avatars = Object.values(AvatarEnum);
        const availableAvatars = avatars.filter((avatar) => !takenAvatars.includes(avatar.name));

        const randomAvatar = availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
        const virtualPlayer = new PlayerCharacter('');
        virtualPlayer.isVirtual = true;
        virtualPlayer.comportement = comportement;
        virtualPlayer.avatar = {
            ...randomAvatar,
            dogPetting: randomAvatar.dogPetting,
        };
        virtualPlayer.name = randomAvatar.name;

        virtualPlayer.socketId = `${Math.random().toString(RANDOM_SOCKET_NUMBER).substr(1, RANDOM_NUMBER)}_${Math.random()
            .toString(RANDOM_SOCKET_NUMBER)
            .substr(2, RANDOM_NUMBER)}`;

        const bonusDice = Math.random() > 0.5 ? DiceType.Attack : DiceType.Defense;
        switch (bonusDice) {
            case DiceType.Attack:
                virtualPlayer.assignAttackDice();
                break;
            case DiceType.Defense:
                virtualPlayer.assignDefenseDice();
                break;
        }

        const attributesOption = ['life', 'speed'];
        const bonusAttributes = attributesOption[Math.floor(Math.random() * attributesOption.length)];
        switch (bonusAttributes) {
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
