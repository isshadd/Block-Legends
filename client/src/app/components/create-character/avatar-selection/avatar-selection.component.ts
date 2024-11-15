import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { PlayerCharacter } from '@common/classes/player-character';
import { Avatar, AvatarEnum } from '@common/enums/avatar-enum';

@Component({
    selector: 'app-avatar-selection',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './avatar-selection.component.html',
    styleUrl: './avatar-selection.component.scss',
})
export class AvatarSelectionComponent implements OnInit {
    @Input() character: PlayerCharacter;
    avatarList: Avatar[] = [];
    takenAvatars: string[] = [];

    constructor(private webSocketService: WebSocketService) {
        this.setAvatars();
    }

    ngOnInit(): void {
        this.webSocketService.takenAvatars$.subscribe((takenAvatars) => {
            this.takenAvatars = takenAvatars;
            this.filterAvatars();
        });
    }

    setAvatars() {
        for (const key of Object.keys(AvatarEnum)) {
            const avatar = AvatarEnum[key as keyof typeof AvatarEnum];
            this.avatarList.push(avatar);
        }
    }

    filterAvatars() {
        if (!this.takenAvatars) return;
        this.avatarList = this.avatarList.filter((avatar) => !this.takenAvatars.includes(avatar.name));
    }

    selectAvatar(avatar: Avatar) {
        this.character.avatar = avatar;
    }
}
