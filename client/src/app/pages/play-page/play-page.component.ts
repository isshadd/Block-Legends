import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { PlayersListComponent } from '@app/components/players-list/players-list.component';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';

@Component({
    selector: 'app-play-page',
    standalone: true,
    imports: [MapComponent, RouterLink, PlayerInfoComponent, PlayersListComponent],
    templateUrl: './play-page.component.html',
    styleUrl: './play-page.component.scss',
})
export class PlayPageComponent {
    constructor(public playGameBoardManagerService: PlayGameBoardManagerService) {}
}
