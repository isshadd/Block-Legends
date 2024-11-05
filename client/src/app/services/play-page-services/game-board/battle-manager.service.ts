import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

@Injectable({
    providedIn: 'root',
})
export class BattleManagerService {
    currentPlayer: PlayerCharacter | null = null;
    opponentPlayer: PlayerCharacter | null = null;

    init(currentPlayer: PlayerCharacter, opponentPlayer: PlayerCharacter) {
        this.currentPlayer = currentPlayer;
        this.opponentPlayer = opponentPlayer;
    }

    startBattleTurn() {}
}
