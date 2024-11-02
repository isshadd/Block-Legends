import { Component } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { MapTileInfoComponent } from '@app/components/map-tile-info/map-tile-info.component';
import { FightViewComponent } from '@app/components/play-area/fight-view/fight-view.component';
import { PlayerMapEntityInfoViewComponent } from '@app/components/player-map-entity-info-view/player-map-entity-info-view.component';
import { AvatarEnum } from '@common/enums/avatar-enum';
@Component({
    selector: 'app-fight-view-page',
    standalone: true,
    imports: [FightViewComponent, PlayerMapEntityInfoViewComponent, MapTileInfoComponent],
    templateUrl: './fight-view-page.component.html',
    styleUrl: './fight-view-page.component.scss',
})
export class FightViewPageComponent {
    playerCharacter = new PlayerCharacter('Player1');
    playerCharacter2 = new PlayerCharacter('Player2');
    tile = new GrassTile();

    constructor() {
        this.playerCharacter.avatar = AvatarEnum.Sirene;
        this.playerCharacter.assignAttackDice();
        this.playerCharacter.isLifeBonusAssigned = true;

        this.playerCharacter2.avatar = AvatarEnum.Steve;
        this.playerCharacter2.assignAttackDice();
        this.playerCharacter2.isLifeBonusAssigned = true;
    }
}
