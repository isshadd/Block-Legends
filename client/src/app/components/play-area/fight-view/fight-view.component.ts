import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

const DELAY = 500;

@Component({
    selector: 'app-fight-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './fight-view.component.html',
    styleUrls: ['./fight-view.component.scss'],
})
export class FightViewComponent {
    @Input() playerCharacter: PlayerCharacter | null;
    @Input() opponentCharacter: PlayerCharacter | null;
    @Input() isPlayerTurn: boolean;
    @Input() userEvasionAttempts: number;

    @Output() attack = new EventEmitter<void>();
    @Output() escape = new EventEmitter<void>();

    private playerDiceResult: number = 0;

    get healthArray(): unknown[] {
        return this.opponentCharacter ? new Array(this.opponentCharacter.attributes.life) : [];
    }

    get defenseArray(): unknown[] {
        return this.opponentCharacter ? new Array(this.opponentCharacter.attributes.defense) : [];
    }

    onAttack() {
        this.attack.emit();
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
        this.escape.emit();
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
        return !this.isPlayerTurn || this.userEvasionAttempts <= 0;
    }

    isAttackDisabled(): boolean {
        return !this.isPlayerTurn;
    }
}
