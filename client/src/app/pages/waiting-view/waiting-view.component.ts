import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService, VP_NUMBER } from '@app/services/game-services/game.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { Subject, takeUntil } from 'rxjs';
import { PlayerCharacter } from 'src/app/classes/Characters/player-character';
import { ClavardageComponent } from '@app/components/clavardage/clavardage.component';
import { SocketStateService } from '@app/services/SocketService/socket-state.service';
//import { ChangeDetectionStrategy } from '@angular/core';
@Component({
    selector: 'app-waiting-view',
    standalone: true,
    imports: [CommonModule, ClavardageComponent],
    templateUrl: './waiting-view.component.html',
    styleUrl: './waiting-view.component.scss',
    //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaitingViewComponent implements OnInit, OnDestroy {
    accessCode$ = this.gameService.accessCode$;
    accessCode: number | null;
    players$ = this.webSocketService.players$;
    isLocked$ = this.webSocketService.isLocked$;
    gameId: string | null;
    playersCounter = 0;
    isMaxPlayer = false;
    isOrganizer = false;

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
                this.webSocketService.createGame(this.gameId, character);
                this.accessCode$.subscribe((code) => {
                    this.accessCode = code;
                    this.changeRoomId(this.accessCode);
                });
            } else {
                this.accessCode$.subscribe((code) => {
                    this.accessCode = code;
                    this.changeRoomId(this.accessCode);
                });
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
        this.router.navigate(['/home']);
    }

    ngOnDestroy(): void {
        this.gameService.clearLocalStorage();
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
}
