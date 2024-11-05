import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BattleManagerService } from '@app/services/play-page-services/game-board/battle-manager.service';

const DELAY = 500;

@Component({
    selector: 'app-fight-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './fight-view.component.html',
    styleUrls: ['./fight-view.component.scss'],
})
export class FightViewComponent {
    playerDiceResult = 6;
    constructor(public battleManagerService: BattleManagerService) {
        this.battleManagerService.signalUserAttacked$.subscribe(() => {
            this.attackAnimation();
        });
        this.battleManagerService.signalUserTriedEscape$.subscribe(() => {
            this.escapeAnimation();
        });
        this.battleManagerService.signalOpponentAttacked$.subscribe(() => {
            this.onOpponentAttack();
        });
        this.battleManagerService.signalOpponentTriedEscape$.subscribe(() => {
            this.onOpponentEscape();
        });
    }

    get healthArray(): unknown[] {
        return this.battleManagerService.opponentPlayer ? new Array(this.battleManagerService.opponentPlayer.attributes.life) : [];
    }

    get defenseArray(): unknown[] {
        return this.battleManagerService.opponentPlayer ? new Array(this.battleManagerService.opponentPlayer.attributes.defense) : [];
    }

    onAttack() {
        this.battleManagerService.onUserAttack();
    }

    attackAnimation() {
        this.onPlayerRollDice();
        this.onPlayerAttack();
    }

    onPlayerAttack() {
        const playerImage = document.getElementById('player');
        const opponentImage = document.getElementById('opponent');

        playerImage?.classList.add('attack-player');
        setTimeout(() => {
            playerImage?.classList.remove('attack-player');
        }, DELAY);

        opponentImage?.classList.add('hit');
        setTimeout(() => {
            opponentImage?.classList.remove('hit');
        }, DELAY);
    }

    onOpponentAttack() {
        const opponentImage = document.getElementById('opponent');
        const playerImage = document.getElementById('player');

        opponentImage?.classList.add('attack-opponent');
        setTimeout(() => {
            opponentImage?.classList.remove('attack-opponent');
        }, DELAY);

        playerImage?.classList.add('hit');
        setTimeout(() => {
            playerImage?.classList.remove('hit');
        }, DELAY);
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
        }, DELAY);
    }

    onOpponentEscape(): void {
        const opponentImage = document.getElementById('opponent');
        opponentImage?.classList.add('escape-opponent');
        setTimeout(() => {
            opponentImage?.classList.remove('escape-opponent');
        }, DELAY);
    }

    onPlayerRollDice(): void {
        const diceResult = document.getElementById('dice-result');
        this.playerDiceResult = Math.floor(Math.random() * 6) + 1;
        diceResult?.classList.add('dice-roll');
        setTimeout(() => {
            diceResult?.classList.remove('dice-roll');
        }, DELAY);
    }

    getDiceResult(): number {
        //TODO TEMP
        return this.playerDiceResult;
    }

    isEscapeDisabled(): boolean {
        return !this.battleManagerService.isUserTurn || this.battleManagerService.userEvasionAttempts <= 0;
    }

    isAttackDisabled(): boolean {
        return !this.battleManagerService.isUserTurn;
    }
}
