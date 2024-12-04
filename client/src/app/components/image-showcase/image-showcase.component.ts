import { Component, OnDestroy } from '@angular/core';
import { GameService } from '@app/services/game-services/game.service';
import { Avatar } from '@common/enums/avatar-enum';
import { Subscription } from 'rxjs';
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
export class ImageShowcaseComponent implements OnDestroy {
    currentImage: string;
    private subscriptions: Subscription = new Subscription();

    constructor(public gameService: GameService) {
        this.subscriptions.add(
            this.gameService.signalAvatarSelected$.subscribe((avatar: Avatar) => {
                this.setupImage(avatar);
            }),
        );

        this.currentImage = 'assets/images/avatar/wallpaper.jpg';
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
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
                return avatar.dogPetting;
            case AvatarImages.Lost:
                return avatar.lost;
            case AvatarImages.Fight:
                return avatar.fight;
            default:
                return avatar.standing;
        }
    }
}
