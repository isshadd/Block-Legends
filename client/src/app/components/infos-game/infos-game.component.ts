import { Component, Input } from '@angular/core';
import { Tile } from '@common/classes/Tiles/tile';

@Component({
    selector: 'app-infos-game',
    standalone: true,
    imports: [],
    templateUrl: './infos-game.component.html',
    styleUrl: './infos-game.component.scss',
})
export class InfosGameComponent {
    @Input() game: Tile[][] = [];
    @Input() nbrPlayers: number = 0;
    @Input() currentPlayer: string = '';
}
