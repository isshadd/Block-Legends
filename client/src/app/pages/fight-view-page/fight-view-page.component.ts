import { Component } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { PlayerMapEntity } from '@app/classes/Characters/player-map-entity';
import { DiamondSword } from '@app/classes/Items/diamond-sword';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { CharacterCreationComponent } from '@app/components/character-creation/character-creation.component';
import { CharacterNameSaverComponent } from '@app/components/character-name-saver/character-name-saver.component';
import { InfoPanelComponent } from '@app/components/info-panel/info-panel.component';
import { InfosGameComponent } from '@app/components/infos-game/infos-game.component';
import { ItemInfoComponent } from '@app/components/item-info/item-info.component';
import { MapTileInfoComponent } from '@app/components/map-tile-info/map-tile-info.component';
import { FightViewComponent } from '@app/components/play-area/fight-view/fight-view.component';
import { PlayGameSideViewBarComponent } from '@app/components/play-game-side-view-bar/play-game-side-view-bar.component';
import { PlayerMapEntityInfoViewComponent } from '@app/components/player-map-entity-info-view/player-map-entity-info-view.component';
import { PlayersListComponent } from '@app/components/players-list/players-list.component';
import { SideViewPlayerInfoComponent } from '@app/components/side-view-player-info/side-view-player-info.component';
import { TabContainerComponent } from '@app/components/tab-container/tab-container.component';
import { WinPanelComponent } from '@app/components/win-panel/win-panel.component';
import { BattleManagerService } from '@app/services/play-page-services/game-board/battle-manager.service';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { AvatarEnum } from '@common/enums/avatar-enum';
@Component({
    selector: 'app-fight-view-page',
    standalone: true,
    imports: [
        FightViewComponent,
        PlayerMapEntityInfoViewComponent,
        MapTileInfoComponent,
        ItemInfoComponent,
        InfoPanelComponent,
        WinPanelComponent,
        InfosGameComponent,
        TabContainerComponent,
        PlayersListComponent,
        SideViewPlayerInfoComponent,
        PlayGameSideViewBarComponent,
        CharacterNameSaverComponent,
        CharacterCreationComponent,
    ],
    templateUrl: './fight-view-page.component.html',
    styleUrl: './fight-view-page.component.scss',
})
export class FightViewPageComponent {
    playerCharacter = new PlayerCharacter('Player1');
    playerCharacter2 = new PlayerCharacter('Player2');
    playerMap = new PlayerMapEntity(AvatarEnum.Sirene.headImage);
    tile = new GrassTile();
    selectedTile: Tile | null = null;
    isBattlePhase: boolean = false;
    myPlayer: PlayerCharacter;
    currentPlayer: PlayerCharacter | null;
    players: PlayerCharacter[] = [this.playerCharacter, this.playerCharacter2, this.playerCharacter2, this.playerCharacter2];
    actualPlayers: PlayerCharacter[] = [];
    actionPoints: number;
    totalLifePoints: number;

    item = new DiamondSword();

    constructor(
        public battleManagerService: BattleManagerService,
        public playGameBoardManagerService: PlayGameBoardManagerService,
    ) {
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
