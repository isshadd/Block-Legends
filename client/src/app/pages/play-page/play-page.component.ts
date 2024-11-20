/* eslint-disable no-restricted-imports */
/* eslint-disable max-params */
/* eslint-disable max-len */
/* eslint-disable  @typescript-eslint/prefer-for-of */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { InfoPanelComponent } from '@app/components/info-panel/info-panel.component';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Tile } from '@common/classes/Tiles/tile';
// eslint-disable-next-line
import { FightViewComponent } from '@app/components/play-page-components/fight-view/fight-view.component';
import { ItemListContainerComponent } from '@app/components/play-page-components/item-list-container/item-list-container/item-list-container.component';
import { TimerComponent } from '@app/components/play-page-components/timer/timer.component';
import { WinPanelComponent } from '@app/components/win-panel/win-panel.component';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { GameService } from '@app/services/game-services/game.service';
import { BattleManagerService } from '@app/services/play-page-services/game-board/battle-manager.service';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayGameBoardSocketService } from '@app/services/play-page-services/game-board/play-game-board-socket.service';
import { PlayPageMouseHandlerService } from '@app/services/play-page-services/play-page-mouse-handler.service';
import { SocketStateService } from '@app/services/SocketService/socket-state.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { Subject, takeUntil } from 'rxjs';
import { PlayGameSideViewBarComponent } from '../../components/play-game-side-view-bar/play-game-side-view-bar.component';

@Component({
    selector: 'app-play-page',
    standalone: true,
    imports: [
        MapComponent,
        RouterModule,
        TimerComponent,
        InfoPanelComponent,
        FightViewComponent,
        WinPanelComponent,
        PlayGameSideViewBarComponent,
        ItemListContainerComponent,
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
        private chatService: ChatService,
    ) {
        this.playGameBoardManagerService.signalManagerFinishedInit$.subscribe(() => {
            this.onPlayGameBoardManagerInit();
        });

        this.playGameBoardSocketService.init();
        this.playGameBoardSocketService.signalPlayerLeft$.subscribe((socketId: string) => {
            const abandonPlayer = this.players.find((p) => p.socketId === socketId);
            if (!abandonPlayer) throw new Error('Player not found');
            abandonPlayer.isAbsent = true;
            this.players = [
                ...this.players.filter((player) => player !== abandonPlayer), // Exclude the player who clicked "Abandon"
                abandonPlayer,
            ];
        });
    }

    onPlayGameBoardManagerInit() {
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
            // this.updatePlayersList();
        });

        this.gameService.character$.pipe(takeUntil(this.destroy$)).subscribe((character) => {
            if (!character) return;
            this.myPlayer = character;
            this.totalLifePoints = this.myPlayer.attributes.life;
        });
    }

    // updatePlayersList(): void {
    //     const allPlayers = this.webSocketService.getTotalPlayers();

    //     this.players = this.playGameBoardManagerService.turnOrder.map((playerName) => {
    //         const player = allPlayers.find((p) => p.name === playerName);
    //         if (player) {
    //             return player;
    //         } else {
    //             const absentPlayer = new PlayerCharacter(playerName);
    //             absentPlayer.isAbsent = true;
    //             return absentPlayer;
    //         }
    //     });

    //     this.players.sort((a, b) => Number(a.isAbsent) - Number(b.isAbsent));
    // }

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
        this.myPlayer.isAbsent = true;
        this.chatService.clearMessages();
        this.handlePlayerAbandon();
        this.playGameBoardSocketService.leaveGame();
    }

    handlePlayerAbandon(): void {
        // Mettez à jour la liste des joueurs pour mettre le joueur absent en bas
        this.players = [
            ...this.players.filter((player) => player !== this.myPlayer), // Exclude the player who clicked "Abandon"
            this.myPlayer,
        ]; // Ajouter le joueur absent en bas
    }
}
