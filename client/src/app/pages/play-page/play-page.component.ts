/* eslint-disable no-restricted-imports */
/* eslint-disable max-params */
/* eslint-disable max-len */
/* eslint-disable  @typescript-eslint/prefer-for-of */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { Tile } from '@app/classes/Tiles/tile';
import { ClavardageComponent } from '@app/components/clavardage/clavardage.component';
import { ContainerComponent } from '@app/components/container/container.component';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { InfoPanelComponent } from '@app/components/info-panel/info-panel.component';
import { InfosGameComponent } from '@app/components/infos-game/infos-game.component';
// eslint-disable-next-line
import { PlaceableEntityContainerComponent } from '@app/components/map-editor-components/placeable-entity-container/placeable-entity-container.component';
import { MapTileInfoComponent } from '@app/components/map-tile-info/map-tile-info.component';
import { FightViewComponent } from '@app/components/play-area/fight-view/fight-view.component';
import { TimerComponent } from '@app/components/play-page-components/timer/timer.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { PlayerMapEntityInfoViewComponent } from '@app/components/player-map-entity-info-view/player-map-entity-info-view.component';
import { PlayersListComponent } from '@app/components/players-list/players-list.component';
import { TabContainerComponent } from '@app/components/tab-container/tab-container.component';
import { WinPanelComponent } from '@app/components/win-panel/win-panel.component';
import { GameService } from '@app/services/game-services/game.service';
import { BattleManagerService } from '@app/services/play-page-services/game-board/battle-manager.service';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayGameBoardSocketService } from '@app/services/play-page-services/game-board/play-game-board-socket.service';
import { PlayPageMouseHandlerService } from '@app/services/play-page-services/play-page-mouse-handler.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { Subject, takeUntil } from 'rxjs';
import { SocketStateService } from '@app/services/SocketService/socket-state.service';

@Component({
    selector: 'app-play-page',
    standalone: true,
    imports: [
        MapComponent,
        TabContainerComponent,
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
        InfoPanelComponent,
        FightViewComponent,
        WinPanelComponent,
    ],
    templateUrl: './play-page.component.html',
    styleUrl: './play-page.component.scss',
})
export class PlayPageComponent implements OnInit, OnDestroy {
    selectedTile: Tile | null = null;
    isBattlePhase: boolean = false;
    myPlayer: PlayerCharacter;
    currentPlayer: PlayerCharacter | null;
    players: PlayerCharacter[] = [];
    actualPlayers: PlayerCharacter[] = [];
    actionPoints: number;
    totalLifePoints: number;

    private destroy$ = new Subject<void>();
    // eslint-disable-next-line
    constructor(
        public playGameBoardManagerService: PlayGameBoardManagerService,
        public playPageMouseHandlerService: PlayPageMouseHandlerService,
        public playGameBoardSocketService: PlayGameBoardSocketService,
        public battleManagerService: BattleManagerService,
        public router: Router,
        private webSocketService: WebSocketService,
        private gameService: GameService,
        private socketStateService: SocketStateService,
    ) {
        this.playGameBoardManagerService.signalManagerFinishedInit$.subscribe(() => {
            this.onPlayGameBoardManagerInit();
        });

        this.playGameBoardSocketService.init();
    }

    onPlayGameBoardManagerInit() {
        this.actionPoints = this.playGameBoardManagerService.userCurrentActionPoints;
        this.isBattlePhase = this.playGameBoardManagerService.areOtherPlayersInBattle;
        this.currentPlayer = this.playGameBoardManagerService.findPlayerFromSocketId(this.playGameBoardManagerService.currentPlayerIdTurn);
        this.getPlayersTurn();
    }

    getPlayersTurn(): void {
        let playerName: string;
        let player: PlayerCharacter | null;
        // eslint-disable-next-line
        for (let i = 0; i < this.playGameBoardManagerService.turnOrder.length; i++) {
            playerName = this.playGameBoardManagerService.turnOrder[i];
            player = this.playGameBoardManagerService.findPlayerFromSocketId(playerName);
            if (playerName && player) {
                this.players.push(player);
            }
        }
    }
    ngOnInit(): void {
        this.socketStateService.setActiveSocket(this.webSocketService);
        this.webSocketService.players$.pipe(takeUntil(this.destroy$)).subscribe((updatedPlayers) => {
            this.actualPlayers = updatedPlayers;
            this.updatePlayersList();
        });

        this.gameService.currentPlayer$.pipe(takeUntil(this.destroy$)).subscribe((player) => {
            this.myPlayer = player;
        });

        this.totalLifePoints = this.myPlayer.attributes.life;
    }

    updatePlayersList(): void {
        const allPlayers = this.webSocketService.getTotalPlayers();

        this.players = this.playGameBoardManagerService.turnOrder.map((playerName) => {
            const player = allPlayers.find((p) => p.name === playerName);
            if (player) {
                player.isAbsent = false; // Joueur présent
                return player;
            } else {
                // Crée une instance temporaire de PlayerCharacter pour les joueurs absents
                const absentPlayer = new PlayerCharacter(playerName);
                absentPlayer.isAbsent = true;
                return absentPlayer;
            }
        });

        // Trie les joueurs pour que les absents soient en bas
        this.players.sort((a, b) => Number(a.isAbsent) - Number(b.isAbsent));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    onMapTileMouseDown(event: MouseEvent, tile: Tile) {
        this.playPageMouseHandlerService.onMapTileMouseDown(event, tile);
    }

    onMapTileMouseEnter(tile: Tile) {
        this.playPageMouseHandlerService.onMapTileMouseEnter(tile);
    }

    onMapTileMouseLeave(tile: Tile) {
        this.playPageMouseHandlerService.onMapTileMouseLeave(tile);
    }

    closePlayerInfoPanel(): void {
        this.playPageMouseHandlerService.discardRightClickSelectedPlayer();
    }

    closeTileInfoPanel(): void {
        this.playPageMouseHandlerService.discardRightSelectedTile();
    }

    toggleAction(): void {
        this.playPageMouseHandlerService.toggleAction();
    }

    endTurn(): void {
        this.playGameBoardSocketService.endTurn();
    }

    leaveGame(): void {
        this.playGameBoardSocketService.leaveGame();
    }
}
