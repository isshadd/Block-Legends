import { Component } from '@angular/core';
import { PlayerCharacter } from '@common/classes/Player/player-character';

@Component({
    selector: 'app-player-info',
    standalone: true,
    imports: [],
    templateUrl: './player-info.component.html',
    styleUrl: './player-info.component.scss',
})
export class PlayerInfoComponent {
    mainPlayer: PlayerCharacter = new PlayerCharacter('sam');
}
