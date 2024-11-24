import { Component, Input } from '@angular/core';
import { MapSize } from '@common/enums/map-size';

@Component({
    selector: 'app-infos-game',
    standalone: true,
    imports: [],
    templateUrl: './infos-game.component.html',
    styleUrl: './infos-game.component.scss',
})
export class InfosGameComponent {
    @Input() gameSize: MapSize | undefined;
    @Input() nbrPlayers: number = 0;
    @Input() currentPlayer: string = '';
}
