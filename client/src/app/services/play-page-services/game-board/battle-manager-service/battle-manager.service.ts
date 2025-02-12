import { Injectable } from '@angular/core';
import { DebugService } from '@app/services/debug-service/debug.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { POTION_DEFENSE_BONUS } from '@common/constants/game_constants';
import { ItemType } from '@common/enums/item-type';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BattleManagerService {
    readonly startingEvadeAttempts = 2;
    readonly icePenalty = 2;

    signalUserAttacked = new Subject<{ playerTurnId: string; attackResult: number; playerHasTotem: boolean }>();
    signalUserAttacked$ = this.signalUserAttacked.asObservable();

    signalUserTriedEscape = new Subject<string>();
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

    constructor(private debugService: DebugService) {}
    init(currentPlayer: PlayerCharacter, opponentPlayer: PlayerCharacter) {
        this.currentPlayer = currentPlayer;
        this.opponentPlayer = opponentPlayer;
        this.userEvasionAttempts = this.startingEvadeAttempts;
        this.opponentEvasionAttempts = this.startingEvadeAttempts;
        this.userRemainingHealth = currentPlayer.attributes.life;
        this.opponentRemainingHealth = opponentPlayer.attributes.life;
        this.isBattleOn = true;

        this.userDefence = currentPlayer.attributes.defense;
        if (this.hasIcePenalty(currentPlayer)) {
            this.userDefence -= this.icePenalty;
        }

        this.opponentDefence = opponentPlayer.attributes.defense;
        if (this.hasIcePenalty(opponentPlayer)) {
            this.opponentDefence -= this.icePenalty;
        }
    }

    isValidAction(): boolean {
        return !!this.currentPlayer && !!this.opponentPlayer && this.isUserTurn;
    }

    onUserAttack() {
        if (this.isValidAction() && this.currentPlayer?.socketId) {
            const attackResult = this.attackDiceResult() - this.defenseDiceResult();
            const playerHasTotem =
                this.currentPlayer &&
                this.doesPlayerHaveItem(this.currentPlayer, ItemType.Totem) &&
                !this.isPlayerHealthMax(this.currentPlayer, this.userRemainingHealth);

            this.signalUserAttacked.next({ playerTurnId: this.currentPlayer.socketId, attackResult, playerHasTotem });
        }
    }

    onUserEscape() {
        if (this.isValidAction() && this.userEvasionAttempts > 0) {
            this.userEvasionAttempts--;
            if (this.currentPlayer) {
                this.signalUserTriedEscape.next(this.currentPlayer.socketId);
            }
        }
    }

    onOpponentAttack(attackResult: number) {
        if (!this.currentPlayer || !this.opponentPlayer) return;

        if (!this.isUserTurn) {
            if (attackResult > 0 && this.opponentPlayer) {
                if (
                    this.doesPlayerHaveItem(this.opponentPlayer, ItemType.Totem) &&
                    !this.isPlayerHealthMax(this.opponentPlayer, this.opponentRemainingHealth)
                ) {
                    this.opponentRemainingHealth++;
                }
                this.userRemainingHealth--;
            }
            this.signalOpponentAttacked.next(attackResult);
        }
    }

    onOpponentEscape() {
        if (this.currentPlayer && this.opponentPlayer && !this.isUserTurn) {
            this.opponentEvasionAttempts--;
            this.signalOpponentTriedEscape.next();
        }
    }

    attackDiceResult(): number {
        if (this.currentPlayer) {
            let currentPlayerAttack: number = this.currentPlayer.attributes.attack;
            currentPlayerAttack -= this.hasIcePenalty(this.currentPlayer) ? this.icePenalty : 0;
            if (this.debugService.isDebugMode) {
                return currentPlayerAttack + this.currentPlayer.attackDice;
            }
            return currentPlayerAttack + Math.floor(Math.random() * this.currentPlayer.attackDice) + 1;
        }
        return 0;
    }

    defenseDiceResult(): number {
        if (this.opponentPlayer) {
            if (this.doesPlayerHaveItem(this.opponentPlayer, ItemType.MagicShield) && this.opponentRemainingHealth === 1) {
                if (Math.random() < 0.5) {
                    return POTION_DEFENSE_BONUS;
                }
            }
            if (this.debugService.isDebugMode) {
                return this.opponentDefence + 1;
            }
            return this.opponentDefence + Math.floor(Math.random() * this.opponentPlayer.defenseDice) + 1;
        }
        return 0;
    }

    onSuccessfulAttack() {
        if (!this.isValidAction()) {
            return;
        }

        if (
            this.currentPlayer &&
            this.doesPlayerHaveItem(this.currentPlayer, ItemType.Totem) &&
            !this.isPlayerHealthMax(this.currentPlayer, this.userRemainingHealth)
        ) {
            this.userRemainingHealth++;
        }

        this.opponentRemainingHealth--;
    }

    endBattle() {
        this.isBattleOn = false;
        setTimeout(() => {
            this.clearBattle();
        }, 1000);
    }

    isPlayerHealthMax(player: PlayerCharacter, currentHealth: number): boolean {
        return currentHealth === player.attributes.life;
    }

    doesPlayerHaveItem(player: PlayerCharacter, itemType: ItemType): boolean {
        return player.inventory.some((item) => item.type === itemType);
    }

    hasIcePenalty(player: PlayerCharacter): boolean {
        return player.mapEntity.isPlayerOnIce && !this.doesPlayerHaveItem(player, ItemType.Elytra);
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
