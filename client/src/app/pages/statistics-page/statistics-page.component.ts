import { Component, Input } from '@angular/core';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { ClavardageComponent } from '../../components/clavardage/clavardage.component';

@Component({
    selector: 'app-statistics-page',
    standalone: true,
    imports: [ClavardageComponent],
    templateUrl: './statistics-page.component.html',
    styleUrl: './statistics-page.component.scss',
})
export class StatisticsPageComponent {
    @Input() winner: PlayerCharacter;
    player1: PlayerCharacter;
    player2: PlayerCharacter;
    playersList: PlayerCharacter[] = [];

    constructor() {
        this.player1 = new PlayerCharacter('Player1');
        this.player1.avatar = AvatarEnum.Alex;
        this.playersList.push(this.player1);

        this.player2 = new PlayerCharacter('Player2');
        this.player2.avatar = AvatarEnum.Arlina;
        this.playersList.push(this.player2);
    }
}
