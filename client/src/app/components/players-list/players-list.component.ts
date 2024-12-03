import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { ItemType } from '@common/enums/item-type';

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
        return player.socketId === this.playGameBoardManagerService.currentPlayerIdTurn;
    }

    hasFlag(player: PlayerCharacter): boolean {
        return player.inventory.some((item) => item.type === ItemType.Flag);
    }
}
