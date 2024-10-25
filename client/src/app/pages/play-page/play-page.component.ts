import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';

@Component({
    selector: 'app-play-page',
    standalone: true,
    imports: [MapComponent, RouterLink],
    templateUrl: './play-page.component.html',
    styleUrl: './play-page.component.scss',
})
export class PlayPageComponent {
    gameToPlay: GameShared = {
        name: '',
        description: '',
        size: MapSize.MEDIUM,
        mode: GameMode.Classique,
        imageUrl: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
        isVisible: false,
        tiles: [],
    };

    constructor(public gameMapDataManagerService: GameMapDataManagerService) {
        this.gameMapDataManagerService.init(this.gameToPlay);
    }
}
