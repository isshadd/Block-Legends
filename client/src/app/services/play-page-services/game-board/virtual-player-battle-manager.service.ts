import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { ItemType } from '@common/enums/item-type';
import { ProfileEnum } from '@common/enums/profile';
import { BattleManagerService } from './battle-manager.service';
import { PlayGameBoardManagerService } from './play-game-board-manager.service';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerBattleManagerService {
    constructor(
        public playGameBoardManagerService: PlayGameBoardManagerService,
        public battleManagerService: BattleManagerService,
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
            this.handleAgressiveComportment(player, enemyPlayer, enemyRemainingHealth);
        } else if (player.comportement === ProfileEnum.Defensive) {
            this.handleDefensiveComportment(player, enemyPlayer, virtualPlayerRemainingHealth, enemyRemainingHealth, virtualPlayerRemainingEvasions);
        }
    }

    private handleAgressiveComportment(virtualPlayer: PlayerCharacter, enemyPlayer: PlayerCharacter, enemyRemainingHealth: number) {
        this.attack(virtualPlayer, enemyPlayer, enemyRemainingHealth);
    }

    private handleDefensiveComportment(
        virtualPlayer: PlayerCharacter,
        enemyPlayer: PlayerCharacter,
        virtualPlayerRemainingHealth: number,
        enemyRemainingHealth: number,
        virtualPlayerRemainingEvasions: number,
    ) {
        if (virtualPlayerRemainingEvasions > 0 && virtualPlayerRemainingHealth < virtualPlayer.attributes.life) {
            this.escape(virtualPlayer);
        } else {
            this.attack(virtualPlayer, enemyPlayer, enemyRemainingHealth);
        }
    }

    attack(virtualPlayer: PlayerCharacter, enemyPlayer: PlayerCharacter, enemyRemainingHealth: number) {
        const attackResult = this.attackDiceResult(virtualPlayer) - this.defenseDiceResult(enemyPlayer, enemyRemainingHealth);
        const playerHasTotem = this.battleManagerService.doesPlayerHaveItem(virtualPlayer, ItemType.Totem);

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
        return currentPlayerAttack + Math.floor(Math.random() * virtualPlayer.attackDice) + 1;
    }

    defenseDiceResult(enemyPlayer: PlayerCharacter, enemyRemainingHealth: number): number {
        if (this.battleManagerService.doesPlayerHaveItem(enemyPlayer, ItemType.MagicShield) && enemyRemainingHealth === 1) {
            const potionDefenseBoost = 100;
            if (Math.random() < 0.5) {
                return potionDefenseBoost;
            }
        }
        let enemyPlayerDefence: number = enemyPlayer.attributes.defense;
        if (this.battleManagerService.hasIcePenalty(enemyPlayer)) {
            enemyPlayerDefence -= this.battleManagerService.icePenalty;
        }
        return enemyPlayerDefence + Math.floor(Math.random() * enemyPlayer.defenseDice) + 1;
    }
}
