/* eslint-disable max-params */
/* eslint-disable no-restricted-imports */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClavardageComponent } from '@app/components/clavardage/clavardage.component';
import { EventJournalComponent } from '@app/components/event-journal/event-journal.component';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { GameService, VP_NUMBER } from '@app/services/game-services/game.service';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { SocketStateService } from '@app/services/SocketService/socket-state.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { PlayerCharacter } from '@common/classes/player-character';
import { SocketEvents } from '@common/enums/gateway-events/socket-events';
import { Subject, takeUntil } from 'rxjs';
@Component({
    selector: 'app-waiting-view',
    standalone: true,
    imports: [CommonModule, ClavardageComponent, EventJournalComponent],
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

    private destroy$ = new Subject<void>();

    constructor(
        public gameService: GameService,
        private router: Router,
        private webSocketService: WebSocketService,
        private route: ActivatedRoute,
        private socketStateService: SocketStateService,
        private chatService: ChatService,
        private eventJournalService: EventJournalService,
    ) {}

    ngOnInit(): void {
        this.socketStateService.setActiveSocket(this.webSocketService);

        this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            this.gameId = params.roomId;
        });

        this.gameService.character$.pipe(takeUntil(this.destroy$)).subscribe((character) => {
            this.isOrganizer = character.isOrganizer;
            this.chatService.setCharacter(character);
            this.eventJournalService.setCharacter(character);

            if (character.isOrganizer) {
                if (!this.gameId) return;

                this.playersCounter++;
                this.webSocketService.init();
                this.webSocketService.createGame(this.gameId, character);
                this.accessCode$.subscribe((code) => {
                    this.accessCode = code;
                    this.changeRoomId(this.accessCode);
                    if (this.accessCode !== null) {
                        this.chatService.setAccessCode(this.accessCode); // Ensure accessCode is not null
                        this.eventJournalService.setAccessCode(this.accessCode);
                    }
                });
            } else {
                this.playersCounter++;
                this.accessCode$.subscribe((code) => {
                    this.accessCode = code;
                    this.changeRoomId(this.accessCode);
                    if (this.accessCode !== null) {
                        this.chatService.setAccessCode(this.accessCode); // Ensure accessCode is not null
                        this.eventJournalService.setAccessCode(this.accessCode);
                    }
                });
            }
        });

        this.players$.pipe(takeUntil(this.destroy$)).subscribe((players) => {
            players.forEach(() => {
                this.playersCounter++;
            });
        });

        this.maxPlayers$.pipe(takeUntil(this.destroy$)).subscribe((max) => {
            this.maxPlayers = max;
        });

        this.webSocketService.socket.on(SocketEvents.ORGANIZER_LEFT, () => {
            if (!this.isOrganizer) {
                this.playerLeave();
            }
        });
    }

    addVirtualPlayers(): void {
        if (this.playersCounter >= VP_NUMBER) {
            this.isMaxPlayer = true;
            return;
        }

        const virtualPlayer = this.gameService.generateVirtualCharacter(this.playersCounter);
        this.webSocketService.addPlayerToRoom(this.accessCode as number, virtualPlayer);
        this.playersCounter++;
    }

    playerLeave(): void {
        this.webSocketService.leaveGame();
        this.router.navigate(['/home']).then(() => {
            alert('Le créateur a quitté la partie');
        });
    }

    playerNonOrgLeave(): void {
        this.webSocketService.leaveGame();
        this.router.navigate(['/home']).then(() => {
            alert('Vous avez quitté la partie');
        });
    }

    ngOnDestroy(): void {
        this.socketStateService.clearSocket();
        this.destroy$.next();
        this.destroy$.complete();
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
        this.eventJournalService.broadcastEvent('clicked Journal', [`${this.eventJournalService.playerName}`]);
    }
}
