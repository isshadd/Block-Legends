import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';

@Component({
    selector: 'app-players-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './players-list.component.html',
    styleUrl: './players-list.component.scss',
})
export class PlayersListComponent {
    @Input() players: PlayerCharacter[] = [];
    constructor(private playGameBoardManagerService: PlayGameBoardManagerService) {}

    isTurn(player: PlayerCharacter): boolean {
        if (player.socketId === this.playGameBoardManagerService.currentPlayerIdTurn) {
            return true;
        }
        return false;
    }
}
