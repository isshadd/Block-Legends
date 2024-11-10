import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClavardageComponent } from '@app/components/clavardage/clavardage.component';
import { GameService, VP_NUMBER } from '@app/services/game-services/game.service';
import { SocketStateService } from '@app/services/SocketService/socket-state.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { Subject, takeUntil } from 'rxjs';
import { PlayerCharacter } from 'src/app/classes/Characters/player-character';
// import { ChangeDetectionStrategy } from '@angular/core';
@Component({
    selector: 'app-waiting-view',
    standalone: true,
    imports: [CommonModule, ClavardageComponent],
    templateUrl: './waiting-view.component.html',
    styleUrl: './waiting-view.component.scss',
    // changeDetection: ChangeDetectionStrategy.OnPush,
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

    private destroy$ = new Subject<void>();

    constructor(
        public gameService: GameService,
        private router: Router,
        private webSocketService: WebSocketService,
        private route: ActivatedRoute,
        private socketStateService: SocketStateService,
    ) {}

    ngOnInit(): void {
        this.socketStateService.setActiveSocket(this.webSocketService);

        this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            this.gameId = params.roomId;
        });

        this.gameService.character$.pipe(takeUntil(this.destroy$)).subscribe((character) => {
            if (!this.gameId) return;

            this.isOrganizer = character.isOrganizer;

            if (character.isOrganizer) {
                this.playersCounter++;
                this.webSocketService.init();
                this.webSocketService.createGame(this.gameId, character);
                this.accessCode$.subscribe((code) => {
                    this.accessCode = code;
                    this.changeRoomId(this.accessCode);
                });
            } else {
                this.playersCounter++;
                this.accessCode$.subscribe((code) => {
                    this.accessCode = code;
                    this.changeRoomId(this.accessCode);
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

        this.webSocketService.socket.on('organizerLeft', () => {
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
}
