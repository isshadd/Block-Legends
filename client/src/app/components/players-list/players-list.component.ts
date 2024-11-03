import { Component, Input } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

@Component({
    selector: 'app-players-list',
    standalone: true,
    imports: [],
    templateUrl: './players-list.component.html',
    styleUrl: './players-list.component.scss',
})
export class PlayersListComponent {
    @Input() players: PlayerCharacter[] = [];
}
