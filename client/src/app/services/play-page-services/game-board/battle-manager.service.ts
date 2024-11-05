import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BattleManagerService {
    readonly STARTING_EVADE_ATTEMPTS = 2;

    signalUserAttacked = new Subject<void>();
    signalUserAttacked$ = this.signalUserAttacked.asObservable();

    signalUserTriedEscape = new Subject<void>();
    signalUserTriedEscape$ = this.signalUserTriedEscape.asObservable();

    signalOpponentAttacked = new Subject<void>();
    signalOpponentAttacked$ = this.signalOpponentAttacked.asObservable();

    signalOpponentTriedEscape = new Subject<void>();
    signalOpponentTriedEscape$ = this.signalOpponentTriedEscape.asObservable();

    currentPlayer: PlayerCharacter | null = null;
    opponentPlayer: PlayerCharacter | null = null;
    currentPlayerIdTurn: string | null = null;
    isUserTurn = false;
    userEvasionAttempts = 0;
    opponentEvasionAttempts = 0;

    init(currentPlayer: PlayerCharacter, opponentPlayer: PlayerCharacter) {
        this.currentPlayer = currentPlayer;
        this.opponentPlayer = opponentPlayer;
        this.userEvasionAttempts = this.STARTING_EVADE_ATTEMPTS;
        this.opponentEvasionAttempts = this.STARTING_EVADE_ATTEMPTS;
    }

    isValidAction(): boolean {
        return !!this.currentPlayer && !!this.opponentPlayer && this.isUserTurn;
    }

    onUserAttack() {
        if (this.isValidAction()) {
            this.signalUserAttacked.next();
        }
    }

    onUserEscape() {
        if (this.isValidAction() && this.userEvasionAttempts > 0) {
            this.userEvasionAttempts--;
            this.signalUserTriedEscape.next();
        }
    }

    onOpponentAttack(playerIdTurn: string) {
        if (!this.currentPlayer || !this.opponentPlayer) {
            return;
        }

        if (!this.isUserTurn) {
            console.log('Opponent attacked');
            this.signalOpponentAttacked.next();
        }
    }

    onOpponentEscape(playerIdTurn: string) {
        if (!this.currentPlayer || !this.opponentPlayer) {
            return;
        }

        if (!this.isUserTurn) {
            console.log('Opponent escape');
            this.signalOpponentTriedEscape.next();
        }
    }

    endBattle() {
        this.clearBattle();
    }

    clearBattle() {
        this.currentPlayer = null;
        this.opponentPlayer = null;
        this.currentPlayerIdTurn = null;
        this.isUserTurn = false;
        this.userEvasionAttempts = 0;
        this.opponentEvasionAttempts = 0;
    }
}
