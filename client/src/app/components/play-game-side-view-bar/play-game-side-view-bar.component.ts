import { Component, Input } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { Tile } from '@app/classes/Tiles/tile';
import { InfosGameComponent } from '@app/components/infos-game/infos-game.component';
import { PlayersListComponent } from '@app/components/players-list/players-list.component';
import { SideViewPlayerInfoComponent } from '@app/components/side-view-player-info/side-view-player-info.component';
import { TabContainerComponent } from '@app/components/tab-container/tab-container.component';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';

@Component({
    selector: 'app-play-game-side-view-bar',
    standalone: true,
    imports: [SideViewPlayerInfoComponent, InfosGameComponent, PlayersListComponent, TabContainerComponent],
    templateUrl: './play-game-side-view-bar.component.html',
    styleUrl: './play-game-side-view-bar.component.scss',
})
export class PlayGameSideViewBarComponent {
    @Input() playerCharacter: PlayerCharacter;
    @Input() actionPoints: number;
    @Input() totalLife: number;
    @Input() game: Tile[][];
    @Input() players: PlayerCharacter[] = [];

    constructor(public playGameBoardManagerService: PlayGameBoardManagerService) {}
}
