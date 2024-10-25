import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

@Component({
    selector: 'app-avatar-selection',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './avatar-selection.component.html',
    styleUrl: './avatar-selection.component.scss',
})
export class AvatarSelectionComponent {
    @Input() character: PlayerCharacter;

    avatars = [
        { name: 'Steve', imgSrc1: 'assets/images/avatar/Steve_head.png', imgSrc2: 'assets/images/avatar/Steve.png' },
        { name: 'Arlina', imgSrc1: 'assets/images/avatar/GirlSkin1_head.png', imgSrc2: 'assets/images/avatar/GirlSkin1.png' },
        { name: 'Alex', imgSrc1: 'assets/images/avatar/Alex_head.png', imgSrc2: 'assets/images/avatar/Alex.png' },
        { name: 'King', imgSrc1: 'assets/images/avatar/King_head.png', imgSrc2: 'assets/images/avatar/King.png' },
        { name: 'Cosmic', imgSrc1: 'assets/images/avatar/Cosmic._head.png', imgSrc2: 'assets/images/avatar/Cosmic.png' },
        { name: 'Sirene', imgSrc1: 'assets/images/avatar/Sirene_head.png', imgSrc2: 'assets/images/avatar/Sirene.png' },
        { name: 'Zombie', imgSrc1: 'assets/images/avatar/zombie_head.png', imgSrc2: 'assets/images/avatar/zombie.png' },
        { name: 'Muffin', imgSrc1: 'assets/images/avatar/Muffin_head.png', imgSrc2: 'assets/images/avatar/Muffin.png' },
        { name: 'Piglin', imgSrc1: 'assets/images/avatar/Piglin_head.png', imgSrc2: 'assets/images/avatar/Piglin.png' },
        { name: 'Strawberry', imgSrc1: 'assets/images/avatar/StrawberryShortcake_head.png', imgSrc2: 'assets/images/avatar/StrawberryShortcake.png' },
        { name: 'Knight', imgSrc1: 'assets/images/avatar/Knight_head.png', imgSrc2: 'assets/images/avatar/Knight.png' },
        { name: 'Finn', imgSrc1: 'assets/images/avatar/finn_head.png', imgSrc2: 'assets/images/avatar/finn.png' },
    ];

    selectAvatar(avatar: string) {
        this.character.avatar = avatar;
    }

    getSelectedAvatar() {
        return this.avatars.find((avatar) => avatar.imgSrc1 === this.character.avatar);
    }
}
