import { Component, EventEmitter, Output } from '@angular/core';
// This line is necessary for the PlayPageRightSideViewComponent to work and should not be refactored. We have to disable max-len
// eslint-disable-next-line max-len
import { ItemListContainerComponent } from '@app/components/play-page-components/item-list-container/item-list-container/item-list-container.component';
import { TimerComponent } from '@app/components/play-page-components/timer/timer.component';
import { TabContainerComponent } from '@app/components/tab-container/tab-container.component';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayGameBoardSocketService } from '@app/services/play-page-services/game-board/play-game-board-socket.service';
import { PlayPageMouseHandlerService } from '@app/services/play-page-services/play-page-mouse-handler.service';

@Component({
    selector: 'app-play-page-right-side-view',
    standalone: true,
    imports: [TimerComponent, TabContainerComponent, ItemListContainerComponent],
    templateUrl: './play-page-right-side-view.component.html',
    styleUrl: './play-page-right-side-view.component.scss',
})
export class PlayPageRightSideViewComponent {
    @Output() toggleActionClicked: EventEmitter<void> = new EventEmitter<void>();
    @Output() endTurnClicked: EventEmitter<void> = new EventEmitter<void>();
    @Output() leaveGameClicked: EventEmitter<void> = new EventEmitter<void>();
    constructor(
        public playGameBoardManagerService: PlayGameBoardManagerService,
        public playPageMouseHandlerService: PlayPageMouseHandlerService,
        public playGameBoardSocketService: PlayGameBoardSocketService,
    ) {}

    toggleAction(): void {
        this.toggleActionClicked.emit();
    }

    endTurn(): void {
        this.endTurnClicked.emit();
    }

    leaveGame(): void {
        this.leaveGameClicked.emit();
    }
}
