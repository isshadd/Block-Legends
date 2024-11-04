import { Component, Input } from '@angular/core';
import { Tile } from '@app/classes/Tiles/tile';

@Component({
    selector: 'app-infos-game',
    standalone: true,
    imports: [],
    templateUrl: './infos-game.component.html',
    styleUrl: './infos-game.component.scss',
})
export class InfosGameComponent {
    @Input() game: Tile[][];
    @Input() nbrPlayers: number;
    @Input() currentPlayer: string;
}
