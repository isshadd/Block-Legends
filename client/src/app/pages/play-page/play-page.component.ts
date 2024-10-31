import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';

@Component({
    selector: 'app-play-page',
    standalone: true,
    imports: [MapComponent, RouterLink],
    templateUrl: './play-page.component.html',
    styleUrl: './play-page.component.scss',
})
export class PlayPageComponent {
    constructor(public playGameBoardManagerService: PlayGameBoardManagerService) {}
}
