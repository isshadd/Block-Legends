import { Component } from '@angular/core';
import { ArrowDownButtonComponent } from '@app/components/arrow-down-button/arrow-down-button.component';
import { ArrowUpButtonComponent } from '@app/components/arrow-up-button/arrow-up-button.component';
import { ClavardageComponent } from '@app/components/clavardage/clavardage.component';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { PlayGameBoardSocketService } from '@app/services/play-page-services/game-board/play-game-board-socket.service';
import { GameStatisticsService, SortAttribute, SortDirection } from '@app/services/play-page-services/game-statistics.service';

@Component({
    selector: 'app-statistics-page',
    standalone: true,
    imports: [ClavardageComponent, ArrowUpButtonComponent, ArrowDownButtonComponent],
    templateUrl: './statistics-page.component.html',
    styleUrl: './statistics-page.component.scss',
})
export class StatisticsPageComponent {
    sortAttribute = SortAttribute;
    sortDirection = SortDirection;
    constructor(
        public gameStatisticsService: GameStatisticsService,
        public gameMapDataManagerService: GameMapDataManagerService,
        public playGameBoardSocketService: PlayGameBoardSocketService,
    ) {}

    formatGameTime(totalGameTime: number): string {
        const hours = Math.floor(totalGameTime / 3600);
        const minutes = Math.floor((totalGameTime % 3600) / 60);
        const seconds = totalGameTime % 60;

        return `${this.padWithZero(hours)}:${this.padWithZero(minutes)}:${this.padWithZero(seconds)}`;
    }

    padWithZero(value: number): string {
        return value.toString().padStart(2, '0');
    }

    returnHome(): void {
        this.playGameBoardSocketService.leaveGame();
    }
}
