import { Injectable } from '@angular/core';
import { DebugService } from '@app/services/debug-service/debug.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { POTION_DEFENSE_BONUS } from '@common/constants/game_constants';
import { ItemType } from '@common/enums/item-type';
import { ProfileEnum } from '@common/enums/profile';
import { BattleManagerService } from '../game-board/battle-manager-service/battle-manager.service';
import { PlayGameBoardManagerService } from '../game-board/play-game-board-manager/play-game-board-manager.service';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerBattleManagerService {
    constructor(
        public playGameBoardManagerService: PlayGameBoardManagerService,
        public battleManagerService: BattleManagerService,
        private debugService: DebugService,
    ) {}

    startTurn(
        playerId: string,
        enemyId: string,
        virtualPlayerRemainingHealth: number,
        enemyRemainingHealth: number,
        virtualPlayerRemainingEvasions: number,
    ) {
        const virtualPlayer = this.playGameBoardManagerService.findPlayerFromSocketId(playerId);
        const enemyPlayer = this.playGameBoardManagerService.findPlayerFromSocketId(enemyId);
        if (virtualPlayer && enemyPlayer) {
            this.handleVirtualPlayerTurn(
                virtualPlayer,
                enemyPlayer,
                virtualPlayerRemainingHealth,
                enemyRemainingHealth,
                virtualPlayerRemainingEvasions,
            );
        }
    }

    handleVirtualPlayerTurn(
        player: PlayerCharacter,
        enemyPlayer: PlayerCharacter,
        virtualPlayerRemainingHealth: number,
        enemyRemainingHealth: number,
        virtualPlayerRemainingEvasions: number,
    ) {
        if (!player.isVirtual) return;

        if (player.comportement === ProfileEnum.Agressive) {
            this.handleAgressiveComportment(player, enemyPlayer, virtualPlayerRemainingHealth, enemyRemainingHealth);
        } else if (player.comportement === ProfileEnum.Defensive) {
            this.handleDefensiveComportment(player, enemyPlayer, virtualPlayerRemainingHealth, enemyRemainingHealth, virtualPlayerRemainingEvasions);
        }
    }

    handleAgressiveComportment(
        virtualPlayer: PlayerCharacter,
        enemyPlayer: PlayerCharacter,
        virtualPlayerRemainingHealth: number,
        enemyRemainingHealth: number,
    ) {
        this.attack(virtualPlayer, enemyPlayer, virtualPlayerRemainingHealth, enemyRemainingHealth);
    }

    handleDefensiveComportment(
        virtualPlayer: PlayerCharacter,
        enemyPlayer: PlayerCharacter,
        virtualPlayerRemainingHealth: number,
        enemyRemainingHealth: number,
        virtualPlayerRemainingEvasions: number,
    ) {
        if (virtualPlayerRemainingEvasions > 0 && virtualPlayerRemainingHealth < virtualPlayer.attributes.life) {
            this.escape(virtualPlayer);
        } else {
            this.attack(virtualPlayer, enemyPlayer, virtualPlayerRemainingHealth, enemyRemainingHealth);
        }
    }

    attack(virtualPlayer: PlayerCharacter, enemyPlayer: PlayerCharacter, virtualPlayerRemainingHealth: number, enemyRemainingHealth: number) {
        const attackResult = this.attackDiceResult(virtualPlayer) - this.defenseDiceResult(enemyPlayer, enemyRemainingHealth);
        const playerHasTotem =
            this.battleManagerService.doesPlayerHaveItem(virtualPlayer, ItemType.Totem) &&
            !this.battleManagerService.isPlayerHealthMax(virtualPlayer, virtualPlayerRemainingHealth);

        if (virtualPlayer?.socketId) {
            this.battleManagerService.signalUserAttacked.next({ playerTurnId: virtualPlayer?.socketId, attackResult, playerHasTotem });
        }
    }

    escape(virtualPlayer: PlayerCharacter) {
        this.battleManagerService.signalUserTriedEscape.next(virtualPlayer?.socketId);
    }

    attackDiceResult(virtualPlayer: PlayerCharacter): number {
        let currentPlayerAttack: number = virtualPlayer.attributes.attack;
        if (this.battleManagerService.hasIcePenalty(virtualPlayer)) {
            currentPlayerAttack -= this.battleManagerService.icePenalty;
        }
        if (this.debugService.isDebugMode) {
            return currentPlayerAttack + virtualPlayer.attackDice;
        }
        return currentPlayerAttack + Math.floor(Math.random() * virtualPlayer.attackDice) + 1;
    }

    defenseDiceResult(enemyPlayer: PlayerCharacter, enemyRemainingHealth: number): number {
        if (this.battleManagerService.doesPlayerHaveItem(enemyPlayer, ItemType.MagicShield) && enemyRemainingHealth === 1) {
            if (Math.random() < 0.5) {
                return POTION_DEFENSE_BONUS;
            }
        }
        let enemyPlayerDefence: number = enemyPlayer.attributes.defense;
        if (this.battleManagerService.hasIcePenalty(enemyPlayer)) {
            enemyPlayerDefence -= this.battleManagerService.icePenalty;
        }
        if (this.debugService.isDebugMode) {
            return enemyPlayerDefence + 1;
        }
        return enemyPlayerDefence + Math.floor(Math.random() * enemyPlayer.defenseDice) + 1;
    }
}
