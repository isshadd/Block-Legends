import { Component } from '@angular/core';
import { GameService } from '@app/services/game-services/game.service';
import { Avatar } from '@common/enums/avatar-enum';
enum AvatarImages {
    MineshaftImage,
    Standing,
    DogPetting,
    Lost,
    Fight,
}
@Component({
    selector: 'app-image-showcase',
    standalone: true,
    imports: [],
    templateUrl: './image-showcase.component.html',
    styleUrl: './image-showcase.component.scss',
})
export class ImageShowcaseComponent {
    currentImage: string;
    constructor(public gameService: GameService) {
        this.gameService.signalAvatarSelected$.subscribe((avatar) => {
            this.setupImage(avatar);
        });

        this.currentImage = 'assets/images/avatar/wallpaper.jpg';
    }

    setupImage(avatar: Avatar) {
        this.currentImage = this.getRandomisedImage(avatar);
    }

    getRandomisedImage(avatar: Avatar) {
        const random = Math.floor(Math.random() * (Object.keys(AvatarImages).length / 2));

        switch (random) {
            case AvatarImages.MineshaftImage:
                return avatar.mineshaftImage;
            case AvatarImages.Standing:
                return avatar.standing;
            case AvatarImages.DogPetting:
                return avatar.dog_petting;
            case AvatarImages.Lost:
                return avatar.lost;
            case AvatarImages.Fight:
                return avatar.fight;
            default:
                return avatar.standing;
        }
    }
}
