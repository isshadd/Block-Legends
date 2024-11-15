import { Component } from '@angular/core';
import { GameService } from '@app/services/game-services/game.service';
import { Avatar } from '@common/enums/avatar-enum';

@Component({
    selector: 'app-image-showcase',
    standalone: true,
    imports: [],
    templateUrl: './image-showcase.component.html',
    styleUrl: './image-showcase.component.scss',
})
export class ImageShowcaseComponent {
    constructor(public gameService: GameService) {
        this.gameService.signalAvatarSelected$.subscribe((avatar) => {
            this.setupImage(avatar);
        });

        this.currentImage = 'assets/images/avatar/wallpaper.jpg';
    }

    currentImage: string;

    setupImage(avatar: Avatar) {
        this.currentImage = this.getRandomisedImage(avatar);
    }

    getRandomisedImage(avatar: Avatar) {
        const random = Math.floor(Math.random() * 2) + 1;
        switch (random) {
            case 1:
                return avatar.mineshaftImage;
            case 2:
                return avatar.standing;
            default:
                return avatar.standing;
        }
    }
}
