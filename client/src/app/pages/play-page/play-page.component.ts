import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { Tile } from '@app/classes/Tiles/tile';
import { ClavardageComponent } from '@app/components/clavardage/clavardage.component';
import { ContainerComponent } from '@app/components/container/container.component';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { InfosGameComponent } from '@app/components/infos-game/infos-game.component';
import { PlaceableEntityContainerComponent } from '@app/components/map-editor-components/placeable-entity-container/placeable-entity-container.component';
import { MapTileInfoComponent } from '@app/components/map-tile-info/map-tile-info.component';
import { TimerComponent } from '@app/components/play-page-components/timer/timer.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { PlayersListComponent } from '@app/components/players-list/players-list.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { GameService } from '@app/services/game-services/game.service';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayGameBoardSocketService } from '@app/services/play-page-services/game-board/play-game-board-socket.service';
import { PlayPageMouseHandlerService } from '@app/services/play-page-services/play-page-mouse-handler.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { Subject, takeUntil } from 'rxjs';
import { PlayerMapEntityInfoViewComponent } from '../../components/player-map-entity-info-view/player-map-entity-info-view.component';
@Component({
    selector: 'app-play-page',
    standalone: true,
    imports: [
        MapComponent,
        RouterModule,
        ClavardageComponent,
        InfosGameComponent,
        PlayerMapEntityInfoViewComponent,
        PlayerInfoComponent,
        PlayersListComponent,
        MapTileInfoComponent,
        PlaceableEntityContainerComponent,
        TimerComponent,
        ContainerComponent,
    ],
    templateUrl: './play-page.component.html',
    styleUrl: './play-page.component.scss',
})
export class PlayPageComponent implements OnInit, OnDestroy {
    selectedPlayerCharacter: PlayerCharacter | null = null;
    selectedTile: Tile | null = null;
    mainPlayer: PlayerCharacter = new PlayerCharacter('sam');
    isBattlePhase: boolean = false;
    currentPlayer: PlayerCharacter;
    players: PlayerCharacter[];

    private destroy$ = new Subject<void>();
    constructor(
        public playGameBoardManagerService: PlayGameBoardManagerService,
        public playPageMouseHandlerService: PlayPageMouseHandlerService,
        public playGameBoardSocketService: PlayGameBoardSocketService,
        public router: Router,
        private webSocketService: WebSocketService,
        private gameService: GameService,
    ) {
        //this.players = [new PlayerCharacter('sam'), new PlayerCharacter('bob'), new PlayerCharacter('joe')];
        this.playGameBoardSocketService.init();
        this.mainPlayer.avatar = AvatarEnum.Alex;
    }

    ngOnInit(): void {
        this.players = this.webSocketService.getTotalPlayers();
        this.gameService.currentPlayer$.pipe(takeUntil(this.destroy$)).subscribe((player) => {
            this.currentPlayer = player;
            if (this.currentPlayer) {
                console.log('Joueur actuel:', this.currentPlayer);
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onMapTileMouseDown(event: MouseEvent, tile: Tile) {
        this.playPageMouseHandlerService.onMapTileMouseDown(event, tile);
    }

    closePlayerInfoPanel(): void {
        this.playPageMouseHandlerService.discardRightClickSelecterPlayer();
    }

    closeTileInfoPanel(): void {
        this.playPageMouseHandlerService.discardRightSelectedTile();
    }

    endTurn(): void {
        this.router.navigate(['/administration-game']);
        return;
    }
}
