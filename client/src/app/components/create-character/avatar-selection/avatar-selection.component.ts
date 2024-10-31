import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { Avatar, AvatarEnum } from '@common/enums/avatar-enum';

@Component({
    selector: 'app-avatar-selection',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './avatar-selection.component.html',
    styleUrl: './avatar-selection.component.scss',
})
export class AvatarSelectionComponent {
    @Input() character: PlayerCharacter;
    avatarList: Avatar[] = [];

    constructor() {
        this.setAvatars();
    }

    setAvatars() {
        for (const key of Object.keys(AvatarEnum)) {
            const avatar = AvatarEnum[key as keyof typeof AvatarEnum];
            this.avatarList.push(avatar);
        }
    }

    selectAvatar(avatar: Avatar) {
        this.character.avatar = avatar;
    }
}
