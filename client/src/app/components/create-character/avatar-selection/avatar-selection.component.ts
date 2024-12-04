import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CharacterFormComponent } from '@app/components/create-character/character-form/character-form.component';
import { GameService } from '@app/services/game-services/game.service';
import { WebSocketService } from '@app/services/socket-service/websocket-service/websocket.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Avatar, AvatarEnum } from '@common/enums/avatar-enum';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-avatar-selection',
    standalone: true,
    imports: [CommonModule, CharacterFormComponent],
    templateUrl: './avatar-selection.component.html',
    styleUrl: './avatar-selection.component.scss',
})
export class AvatarSelectionComponent implements OnInit {
    @Input() character: PlayerCharacter;
    avatarList: Avatar[] = [];
    takenAvatars: string[] = [];

    private subscriptions: Subscription = new Subscription();

    constructor(
        private webSocketService: WebSocketService,
        private gameService: GameService,
    ) {
        this.setAvatars();
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.webSocketService.takenAvatars$.subscribe((takenAvatars) => {
                this.takenAvatars = takenAvatars;
                this.filterAvatars();
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
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
        this.gameService.setSelectedAvatar(avatar);
    }
}
