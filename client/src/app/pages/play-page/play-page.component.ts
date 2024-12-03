/* eslint-disable no-restricted-imports */
// Disabling restricted imports is necessary for the import of PlayPage
/* eslint-disable max-params */
/* eslint-disable max-len */
// This file is necessary for the PlayPageComponent to work and should not be refactored. We have to disable max-len
/* eslint-disable  @typescript-eslint/prefer-for-of */
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { InfoPanelComponent } from '@app/components/info-panel/info-panel.component';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Tile } from '@common/classes/Tiles/tile';
// this line is necessary for the import of PlayPage
// eslint-disable-next-line

import { ItemChooseComponent } from '@app/components/item-choose/item-choose.component';
import { PlayGameSideViewBarComponent } from '@app/components/play-game-side-view-bar/play-game-side-view-bar.component';
import { FightViewComponent } from '@app/components/play-page-components/fight-view/fight-view.component';
import { ItemListContainerComponent } from '@app/components/play-page-components/item-list-container/item-list-container/item-list-container.component';
import { TimerComponent } from '@app/components/play-page-components/timer/timer.component';
import { WinPanelComponent } from '@app/components/win-panel/win-panel.component';
import { DebugService } from '@app/services/debug.service';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameService } from '@app/services/game-services/game.service';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { BattleManagerService } from '@app/services/play-page-services/game-board/battle-manager.service';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayGameBoardSocketService } from '@app/services/play-page-services/game-board/play-game-board-socket.service';
import { PlayPageMouseHandlerService } from '@app/services/play-page-services/play-page-mouse-handler.service';
import { SocketStateService } from '@app/services/SocketService/socket-state.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { Item } from '@common/classes/Items/item';
import { Subject, takeUntil } from 'rxjs';
import { PlayPageRightSideViewComponent } from '../../components/play-page-right-side-view/play-page-right-side-view.component';
import { TabContainerComponent } from '../../components/tab-container/tab-container.component';

const TIMEOUT_DURATION = 500;

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
        ItemChooseComponent,
        TabContainerComponent,
        PlayPageRightSideViewComponent,
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
        public gameMapDataManagerService: GameMapDataManagerService,
        public battleManagerService: BattleManagerService,
        public router: Router,
        public debugService: DebugService,
        private webSocketService: WebSocketService,
        private gameService: GameService,
        private socketStateService: SocketStateService,
        private eventJournalService: EventJournalService,
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

    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'd' || event.key === 'D') {
            this.toggleDebugMode();
        }
        if (event.key === 't') {
            if (this.playGameBoardManagerService.getCurrentPlayerCharacter())
                this.eventJournalService.broadcastEvent(`${this.playGameBoardManagerService.getCurrentPlayerCharacter()?.socketId}`, []);
        }
    }

    onPlayGameBoardManagerInit() {
        this.getPlayersTurn();
    }

    getPlayersTurn(): void {
        let playerName: string;
        let player: PlayerCharacter | null;
        // this line is necessary for the code to work and cannot be refactored
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
        });

        this.gameService.character$.pipe(takeUntil(this.destroy$)).subscribe((character) => {
            if (!character) return;
            this.myPlayer = character;
            if (this.myPlayer.isOrganizer) {
                this.totalLifePoints = this.myPlayer.attributes.life;
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
        const socketId = this.playGameBoardManagerService.getCurrentPlayerCharacter()?.socketId;
        if (socketId) {
            this.playGameBoardSocketService.endTurn(socketId);
        }
    }

    leaveGame(): void {
        this.turnOffDebugMode();
        setTimeout(() => {
            this.myPlayer.isAbsent = true;
            this.handlePlayerAbandon();
            this.playGameBoardSocketService.leaveGame();
        }, TIMEOUT_DURATION);
    }

    handlePlayerAbandon(): void {
        this.players = [...this.players.filter((player) => player !== this.myPlayer), this.myPlayer];
    }

    itemThrow(item: Item): void {
        this.playGameBoardManagerService.userThrewItem(item);
    }

    toggleDebugMode(): void {
        if (this.myPlayer.isOrganizer) {
            if (this.debugService.isDebugMode) this.eventJournalService.broadcastEvent('Mode débogage désactivé', []);
            else {
                this.eventJournalService.broadcastEvent('Mode débogage activé', []);
            }
            this.webSocketService.debugMode();
        }
    }

    turnOffDebugMode(): void {
        if (this.myPlayer.isOrganizer) {
            this.eventJournalService.broadcastEvent("Mode débogage désactivé (Abandon de l'organisateur)", []);
            this.webSocketService.debugModeOff();
        }
    }
}
