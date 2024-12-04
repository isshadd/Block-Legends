import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { BattleManagerService } from '@app/services/play-page-services/game-board/battle-manager-service/battle-manager.service';
import { MOUVEMENT_DELAY } from '@common/constants/game_constants';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-fight-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './fight-view.component.html',
    styleUrls: ['./fight-view.component.scss'],
})
export class FightViewComponent implements OnDestroy {
    playerDiceResult = 0;
    private subscriptions: Subscription = new Subscription();
    constructor(public battleManagerService: BattleManagerService) {
        this.subscriptions.add(
            this.battleManagerService.signalUserAttacked$.subscribe((data) => {
                if (this.battleManagerService.isUserTurn) {
                    this.attackAnimation(data.attackResult);
                }
            }),
        );
        this.subscriptions.add(
            this.battleManagerService.signalUserTriedEscape$.subscribe(() => {
                if (battleManagerService.isUserTurn) {
                    this.escapeAnimation();
                }
            }),
        );
        this.subscriptions.add(
            this.battleManagerService.signalOpponentAttacked$.subscribe((attackResult: number) => {
                this.opponentAttackAnimation(attackResult);
            }),
        );
        this.subscriptions.add(
            this.battleManagerService.signalOpponentTriedEscape$.subscribe(() => {
                this.onOpponentEscape();
            }),
        );
    }
    
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    get opponentPlayerHealthArray(): unknown[] {
        return this.battleManagerService.opponentPlayer ? new Array(this.battleManagerService.opponentRemainingHealth) : [];
    }

    get opponentPlayerDefenseArray(): unknown[] {
        return this.battleManagerService.opponentPlayer ? new Array(this.battleManagerService.opponentDefence) : [];
    }

    get playerHealthArray(): unknown[] {
        return this.battleManagerService.currentPlayer ? new Array(this.battleManagerService.userRemainingHealth) : [];
    }

    get playerDefenseArray(): unknown[] {
        return this.battleManagerService.currentPlayer ? new Array(this.battleManagerService.userDefence) : [];
    }

    onAttack() {
        this.battleManagerService.onUserAttack();
    }

    attackAnimation(playerDiceResult: number): void {
        this.onPlayerRollDice(playerDiceResult);
        this.onPlayerAttack();
    }

    onPlayerAttack() {
        const playerImage = document.getElementById('player');
        const opponentImage = document.getElementById('opponent');

        playerImage?.classList.add('attack-player');
        setTimeout(() => {
            playerImage?.classList.remove('attack-player');
        }, MOUVEMENT_DELAY);

        opponentImage?.classList.add('hit');
        setTimeout(() => {
            opponentImage?.classList.remove('hit');
        }, MOUVEMENT_DELAY);
    }

    opponentAttackAnimation(playerDiceResult: number): void {
        this.onPlayerRollDice(playerDiceResult);
        this.onOpponentAttack();
    }

    onOpponentAttack() {
        const opponentImage = document.getElementById('opponent');
        const playerImage = document.getElementById('player');
        opponentImage?.classList.add('attack-opponent');
        setTimeout(() => {
            opponentImage?.classList.remove('attack-opponent');
        }, MOUVEMENT_DELAY);

        playerImage?.classList.add('hit');
        setTimeout(() => {
            playerImage?.classList.remove('hit');
        }, MOUVEMENT_DELAY);
    }

    onEscape(): void {
        this.battleManagerService.onUserEscape();
    }

    escapeAnimation(): void {
        this.onPlayerEscape();
    }

    onPlayerEscape(): void {
        const playerImage = document.getElementById('player');
        playerImage?.classList.add('escape-player');
        setTimeout(() => {
            playerImage?.classList.remove('escape-player');
        }, MOUVEMENT_DELAY);
    }

    onOpponentEscape(): void {
        const opponentImage = document.getElementById('opponent');
        opponentImage?.classList.add('escape-opponent');
        setTimeout(() => {
            opponentImage?.classList.remove('escape-opponent');
        }, MOUVEMENT_DELAY);
    }

    onPlayerRollDice(playerDiceResult: number): void {
        const diceResult = document.getElementById('dice-result');
        this.playerDiceResult = playerDiceResult;
        diceResult?.classList.add('dice-roll');
        setTimeout(() => {
            diceResult?.classList.remove('dice-roll');
        }, MOUVEMENT_DELAY);
    }

    isEscapeDisabled(): boolean {
        return !this.battleManagerService.isUserTurn || this.battleManagerService.userEvasionAttempts <= 0;
    }

    isAttackDisabled(): boolean {
        return !this.battleManagerService.isUserTurn;
    }
}
