/* eslint-disable max-params */ // The `max-params` rule is disabled because the `onMapTileMouseDown` function requires many parameters
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { EventJournalComponent } from '@app/components/event-journal/event-journal.component';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { GameService } from '@app/services/game-services/game.service';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager/play-game-board-manager.service';
import { SocketStateService } from '@app/services/socket-service/socket-state-service/socket-state.service';
import { WebSocketService } from '@app/services/socket-service/websocket-service/websocket.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { MAX_VP_PLAYER_NUMBER } from '@common/constants/game_constants';
import { SocketEvents } from '@common/enums/gateway-events/socket-events';
import { ProfileEnum } from '@common/enums/profile';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
    selector: 'app-waiting-view',
    standalone: true,
    imports: [CommonModule, ChatComponent, EventJournalComponent],
    templateUrl: './waiting-view.component.html',
    styleUrl: './waiting-view.component.scss',
})
export class WaitingViewComponent implements OnInit, OnDestroy {
    accessCode$ = this.gameService.accessCode$;
    accessCode: number | null;
    players$ = this.webSocketService.players$;
    isLocked$ = this.webSocketService.isLocked$;
    maxPlayers$ = this.webSocketService.maxPlayers$;
    gameId: string | null;
    size: number;
    playersCounter = 1;
    isMaxPlayer = false;
    isOrganizer = false;
    maxPlayers: number = 0;
    showClavardage = true;
    profileAggressive = ProfileEnum.Agressive;
    profileDefensive = ProfileEnum.Defensive;
    lastVirtualPlayerProfile: ProfileEnum | null = null;
    maxVirtualPlayerRetries = MAX_VP_PLAYER_NUMBER;
    lastVirtualPlayerSocketId: string | null = null;
    virtualPlayerRetryCount = 0;
    errorMessage: string | null = null;
    private subscriptions: Subscription = new Subscription();

    private destroy$ = new Subject<void>();

    constructor(
        public gameService: GameService,
        private router: Router,
        private webSocketService: WebSocketService,
        private route: ActivatedRoute,
        private socketStateService: SocketStateService,
        private chatService: ChatService,
        private eventJournalService: EventJournalService,
        private playGameBoardManagerService: PlayGameBoardManagerService,
    ) {}

    ngOnInit(): void {
        this.socketStateService.setActiveSocket(this.webSocketService);

        this.subscriptions.add(
            this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
                this.gameId = params.roomId;
            }),
        );
        this.subscriptions.add(
            this.gameService.character$.pipe(takeUntil(this.destroy$)).subscribe((character) => {
                if (!character) return;
                this.isOrganizer = character.isOrganizer;
                this.chatService.setCharacter(character);
                this.eventJournalService.setCharacter(character);
                if (!this.gameId) return;
                if (character.isOrganizer) {
                    this.playersCounter++;
                    this.webSocketService.init();
                    this.webSocketService.createGame(this.gameId, character);
                    this.accessCode$.pipe(takeUntil(this.destroy$)).subscribe((code) => {
                        this.accessCode = code;
                        this.changeRoomId(this.accessCode);
                    });
                } else {
                    this.playersCounter++;
                    this.chatService.setCharacter(character);
                    this.eventJournalService.setCharacter(character);
                    this.accessCode$.pipe(takeUntil(this.destroy$)).subscribe((code) => {
                        this.accessCode = code;
                        this.changeRoomId(this.accessCode);
                    });
                }
                if (!character.isVirtual) {
                    this.eventJournalService.broadcastEvent(`Le joueur ${character.name} a rejoint la partie.`, []);
                }
            }),
        );

        this.subscriptions.add(
            this.maxPlayers$.pipe(takeUntil(this.destroy$)).subscribe((max) => {
                this.maxPlayers = max;
            }),
        );

        this.webSocketService.socket.on(SocketEvents.ORGANIZER_LEFT, () => {
            if (!this.isOrganizer && !this.playGameBoardManagerService.winnerPlayer) {
                this.playerLeave();
            }
        });

        this.subscriptions.add(
            this.webSocketService.avatarTakenError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
                if (this.lastVirtualPlayerProfile && this.virtualPlayerRetryCount < this.maxVirtualPlayerRetries) {
                    this.virtualPlayerRetryCount++;
                    this.addVirtualPlayer(this.lastVirtualPlayerProfile);
                } else {
                    this.lastVirtualPlayerProfile = null;
                    this.virtualPlayerRetryCount = 0;
                }
            }),
        );

        this.webSocketService.socket.on(SocketEvents.ROOM_LOCKED, (response: { message: string }) => {
            if (this.isOrganizer) {
                this.eventJournalService.broadcastEvent(response.message, []);
            }
        });

        this.webSocketService.socket.on(SocketEvents.ROOM_UNLOCKED, (response: { message: string }) => {
            this.eventJournalService.broadcastEvent(response.message, []);
        });

        this.subscriptions.add(
            this.players$.pipe(takeUntil(this.destroy$)).subscribe((players) => {
                this.playersCounter = players.length;
                if (this.lastVirtualPlayerProfile) {
                    const virtualPlayer = players.find((p) => p.socketId === this.lastVirtualPlayerSocketId);
                    if (virtualPlayer) {
                        this.lastVirtualPlayerProfile = null;
                        this.virtualPlayerRetryCount = 0;
                    }
                }
            }),
        );
    }

    addVirtualPlayer(profile: ProfileEnum): void {
        if (this.playersCounter <= this.maxPlayers) {
            this.isMaxPlayer = true;
            return;
        } else {
            this.isMaxPlayer = false;
        }
        const virtualPlayer = this.gameService.generateVirtualCharacter(this.playersCounter, profile);
        this.webSocketService.addPlayerToRoom(this.accessCode as number, virtualPlayer);
        this.playersCounter++;
        this.eventJournalService.broadcastEvent(`Joueur virtuel ${virtualPlayer.name} ajouté`, []);
    }

    playerLeave(): void {
        this.webSocketService.leaveGame();
        this.router.navigate(['/home']).then(() => {
            alert('Le créateur a quitté la partie');
        });
    }

    playerNonOrgLeave(): void {
        this.webSocketService.leaveGame();
        this.eventJournalService.broadcastEvent('Un joueur a quitté la partie !', []);
        this.router.navigate(['/home']).then(() => {
            alert('Vous avez quitté la partie');
        });
    }

    ngOnDestroy(): void {
        this.socketStateService.clearSocket();
        this.destroy$.next();
        this.destroy$.complete();
        this.subscriptions.unsubscribe();
    }

    lockRoom(): void {
        this.webSocketService.lockRoom();
    }

    unlockRoom(): void {
        this.webSocketService.unlockRoom();
    }

    kickPlayer(player: PlayerCharacter): void {
        if (this.isOrganizer) {
            this.webSocketService.kickPlayer(player);
            this.eventJournalService.broadcastEvent(`Joueur ${player.name} a été expulsé`, []);
        }
    }

    playGame(): void {
        this.webSocketService.startGame();
    }

    changeRoomId(newRoomId: number | null): void {
        if (newRoomId !== null) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { roomId: newRoomId },
                queryParamsHandling: 'merge',
                replaceUrl: true,
            });
        }
    }
    toggleView(): void {
        this.showClavardage = !this.showClavardage;
    }
}
