import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerAttributes } from '@app/classes/Characters/player-attributes';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

@Component({
    selector: 'app-create-character',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './create-character.component.html',
    styleUrl: './create-character.component.scss',
})
export class CreateCharacterComponent {
    avatars = [
        { name: "Kha'Zix", imgSrc1: 'assets/images/avatar/Khazix.webp', imgSrc2: 'assets/images/avatar/Khazix2.webp' },
        { name: 'Yasuo', imgSrc1: 'assets/images/avatar/Yasuo.webp', imgSrc2: 'assets/images/avatar/Yasuo2.webp' },
        { name: 'Tryndamere', imgSrc1: 'assets/images/avatar/Tryndamere.webp', imgSrc2: 'assets/images/avatar/Tryndamere2.webp' },
        { name: 'Jax', imgSrc1: 'assets/images/avatar/Jax.webp', imgSrc2: 'assets/images/avatar/Jax2.webp' },
        { name: 'Lillia', imgSrc1: 'assets/images/avatar/Lillia.webp', imgSrc2: 'assets/images/avatar/Lillia2.webp' },
        { name: 'Viego', imgSrc1: 'assets/images/avatar/Viego.webp', imgSrc2: 'assets/images/avatar/Viego2.webp' },
        { name: 'Master Yi', imgSrc1: 'assets/images/avatar/MasterYi.webp', imgSrc2: 'assets/images/avatar/MasterYi2.webp' },
        { name: 'Kindred', imgSrc1: 'assets/images/avatar/Kindred.webp', imgSrc2: 'assets/images/avatar/Kindred2.webp' },
        { name: 'Udyr', imgSrc1: 'assets/images/avatar/Udyr.webp', imgSrc2: 'assets/images/avatar/Udyr2.webp' },
        { name: 'Sylas', imgSrc1: 'assets/images/avatar/Sylas.webp', imgSrc2: 'assets/images/avatar/Sylas2.webp' },
        { name: 'Corki', imgSrc1: 'assets/images/avatar/Corki.webp', imgSrc2: 'assets/images/avatar/Corki2.webp' },
        { name: 'Azir', imgSrc1: 'assets/images/avatar/Azir.webp', imgSrc2: 'assets/images/avatar/Azir2.webp' },
    ];
    character = new PlayerCharacter('', '', new PlayerAttributes());

    isModalOpen = false;

    characterStatus: string | null;

    constructor(private router: Router) {}

    createCharacter() {
        if (
            !this.character.name ||
            !this.character.avatar ||
            !this.character.isAttackDiceAssigned ||
            !this.character.isAttackDiceAssigned ||
            !this.character.isLifeOrSpeedBonusAssigned
        ) {
            this.characterStatus = "Le formulaire de création de personnage n'est pas valide !";
        } else {
            this.character.setOrganizer();
            this.router.navigate(['/waiting-view']);
        }
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    confirmBack() {
        this.closeModal();
        this.router.navigate(['/create-game']);
    }

    selectAvatar(avatar: string) {
        this.character.avatar = avatar;
    }

    getSelectedAvatar() {
        return this.avatars.find((avatar) => avatar.imgSrc1 === this.character.avatar);
    }
}
