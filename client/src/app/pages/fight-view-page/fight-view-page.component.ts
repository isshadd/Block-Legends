import { Component } from '@angular/core';
import { PlayerMapEntity } from '@app/classes/Characters/player-map-entity';
import { DiamondSword } from '@app/classes/Items/diamond-sword';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { InfoPanelComponent } from '@app/components/info-panel/info-panel.component';
import { ItemInfoComponent } from '@app/components/item-info/item-info.component';
import { MapTileInfoComponent } from '@app/components/map-tile-info/map-tile-info.component';
import { FightViewComponent } from '@app/components/play-area/fight-view/fight-view.component';
import { PlayerMapEntityInfoViewComponent } from '@app/components/player-map-entity-info-view/player-map-entity-info-view.component';
import { WinPanelComponent } from '@app/components/win-panel/win-panel.component';
import { BattleManagerService } from '@app/services/play-page-services/game-board/battle-manager.service';
import { PlayerCharacter } from '@common/classes/player-character';
import { AvatarEnum } from '@common/enums/avatar-enum';
@Component({
    selector: 'app-fight-view-page',
    standalone: true,
    imports: [FightViewComponent, PlayerMapEntityInfoViewComponent, MapTileInfoComponent, ItemInfoComponent, InfoPanelComponent, WinPanelComponent],
    templateUrl: './fight-view-page.component.html',
    styleUrl: './fight-view-page.component.scss',
})
export class FightViewPageComponent {
    playerCharacter = new PlayerCharacter('Player1');
    playerCharacter2 = new PlayerCharacter('Player2');
    playerMap = new PlayerMapEntity(AvatarEnum.Sirene.headImage);
    tile = new GrassTile();

    item = new DiamondSword();

    constructor(public battleManagerService: BattleManagerService) {
        this.playerCharacter.avatar = AvatarEnum.Sirene;
        this.playerCharacter.assignAttackDice();
        this.playerCharacter.isLifeBonusAssigned = true;

        this.playerCharacter2.avatar = AvatarEnum.Steve;
        this.playerCharacter2.assignAttackDice();
        this.playerCharacter2.isLifeBonusAssigned = true;

        this.tile.item = this.item;

        this.battleManagerService.isUserTurn = true;
        this.battleManagerService.userEvasionAttempts = 0;
    }
}
