import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@common/classes/player-character';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BattleManagerService {
    readonly startingEvadeAttempts = 2;
    readonly icePenalty = 2;

    signalUserAttacked = new Subject<number>();
    signalUserAttacked$ = this.signalUserAttacked.asObservable();

    signalUserTriedEscape = new Subject<void>();
    signalUserTriedEscape$ = this.signalUserTriedEscape.asObservable();

    signalOpponentAttacked = new Subject<number>();
    signalOpponentAttacked$ = this.signalOpponentAttacked.asObservable();

    signalOpponentTriedEscape = new Subject<void>();
    signalOpponentTriedEscape$ = this.signalOpponentTriedEscape.asObservable();

    isBattleOn = false;
    currentPlayer: PlayerCharacter | null = null;
    opponentPlayer: PlayerCharacter | null = null;
    currentPlayerIdTurn: string | null = null;
    isUserTurn = false;
    userEvasionAttempts = 0;
    opponentEvasionAttempts = 0;
    userRemainingHealth = 0;
    opponentRemainingHealth = 0;
    userDefence = 0;
    opponentDefence = 0;

    init(currentPlayer: PlayerCharacter, opponentPlayer: PlayerCharacter) {
        this.currentPlayer = currentPlayer;
        this.opponentPlayer = opponentPlayer;
        this.userEvasionAttempts = this.startingEvadeAttempts;
        this.opponentEvasionAttempts = this.startingEvadeAttempts;
        this.userRemainingHealth = currentPlayer.attributes.life;
        this.opponentRemainingHealth = opponentPlayer.attributes.life;
        this.isBattleOn = true;

        this.userDefence = currentPlayer.attributes.defense;
        if (currentPlayer.mapEntity.isPlayerOnIce) {
            this.userDefence -= this.icePenalty;
        }

        this.opponentDefence = opponentPlayer.attributes.defense;
        if (opponentPlayer.mapEntity.isPlayerOnIce) {
            this.opponentDefence -= this.icePenalty;
        }
    }

    isValidAction(): boolean {
        return !!this.currentPlayer && !!this.opponentPlayer && this.isUserTurn;
    }

    onUserAttack() {
        if (this.isValidAction()) {
            const attackResult = this.attackDiceResult() - this.defenseDiceResult();
            this.signalUserAttacked.next(attackResult);
        }
    }

    onUserEscape() {
        if (this.isValidAction() && this.userEvasionAttempts > 0) {
            this.userEvasionAttempts--;
            this.signalUserTriedEscape.next();
        }
    }

    onOpponentAttack(attackResult: number) {
        if (!this.currentPlayer || !this.opponentPlayer) {
            return;
        }

        if (!this.isUserTurn) {
            if (attackResult > 0) {
                this.userRemainingHealth--;
            }
            this.signalOpponentAttacked.next(attackResult);
        }
    }

    onOpponentEscape() {
        if (!this.currentPlayer || !this.opponentPlayer) {
            return;
        }

        if (!this.isUserTurn) {
            this.opponentEvasionAttempts--;
            this.signalOpponentTriedEscape.next();
        }
    }

    attackDiceResult(): number {
        if (this.currentPlayer) {
            let currentPlayerAttack: number = this.currentPlayer.attributes.attack;
            if (this.currentPlayer.mapEntity.isPlayerOnIce) {
                currentPlayerAttack -= this.icePenalty;
            }
            return currentPlayerAttack + Math.floor(Math.random() * this.currentPlayer.attackDice) + 1;
        }
        return 0;
    }

    defenseDiceResult(): number {
        if (this.opponentPlayer) {
            return this.opponentDefence + Math.floor(Math.random() * this.opponentPlayer.defenseDice) + 1;
        }
        return 0;
    }

    onSuccessfulAttack() {
        if (!this.isValidAction()) {
            return;
        }

        this.opponentRemainingHealth--;
    }

    endBattle() {
        this.isBattleOn = false;
        setTimeout(() => {
            this.clearBattle();
        }, 1000);
    }

    clearBattle() {
        this.currentPlayer = null;
        this.opponentPlayer = null;
        this.currentPlayerIdTurn = null;
        this.isUserTurn = false;
        this.userEvasionAttempts = 0;
        this.opponentEvasionAttempts = 0;
        this.userRemainingHealth = 0;
        this.opponentRemainingHealth = 0;
        this.userDefence = 0;
        this.opponentDefence = 0;
        this.isBattleOn = false;
    }
}
