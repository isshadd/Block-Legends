import { Component } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

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
