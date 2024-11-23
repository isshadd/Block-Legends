import { Component, Input } from '@angular/core';
import { InfosGameComponent } from '@app/components/infos-game/infos-game.component';
import { PlayersListComponent } from '@app/components/players-list/players-list.component';
import { SideViewPlayerInfoComponent } from '@app/components/side-view-player-info/side-view-player-info.component';
import { TabContainerComponent } from '@app/components/tab-container/tab-container.component';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { MapSize } from '@common/enums/map-size';

@Component({
    selector: 'app-play-game-side-view-bar',
    standalone: true,
    imports: [SideViewPlayerInfoComponent, InfosGameComponent, PlayersListComponent, TabContainerComponent],
    templateUrl: './play-game-side-view-bar.component.html',
    styleUrl: './play-game-side-view-bar.component.scss',
})
export class PlayGameSideViewBarComponent {
    @Input() playerCharacter: PlayerCharacter | null;
    @Input() gameSize: MapSize | undefined;
    @Input() players: PlayerCharacter[] = [];
    @Input() currentPlayerName: string;
}
