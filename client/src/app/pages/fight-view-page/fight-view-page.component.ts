import { Component } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { FightViewComponent } from '../../components/play-area/fight-view/fight-view.component';

@Component({
    selector: 'app-fight-view-page',
    standalone: true,
    imports: [FightViewComponent],
    templateUrl: './fight-view-page.component.html',
    styleUrl: './fight-view-page.component.scss',
})
export class FightViewPageComponent {
    playerCharacter = new PlayerCharacter('Player1');
    playerCharacter2 = new PlayerCharacter('Player2');

    constructor() {
        this.playerCharacter.avatar = AvatarEnum.Sirene;
        this.playerCharacter.assignAttackDice();
        this.playerCharacter.isLifeBonusAssigned = true;

        this.playerCharacter2.avatar = AvatarEnum.Steve;
        this.playerCharacter2.assignAttackDice();
        this.playerCharacter2.isLifeBonusAssigned = true;
    }
}
