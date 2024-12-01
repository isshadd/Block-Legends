import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowDownButtonComponent } from '@app/components/arrow-down-button/arrow-down-button.component';
import { ArrowUpButtonComponent } from '@app/components/arrow-up-button/arrow-up-button.component';
import { ClavardageComponent } from '@app/components/clavardage/clavardage.component';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameStatisticsService, SortCharacters } from '@app/services/play-page-services/game-statistics.service';

@Component({
    selector: 'app-statistics-page',
    standalone: true,
    imports: [ClavardageComponent, RouterLink, ArrowUpButtonComponent, ArrowDownButtonComponent],
    templateUrl: './statistics-page.component.html',
    styleUrl: './statistics-page.component.scss',
})
export class StatisticsPageComponent {
    sortCharacters = SortCharacters;

    constructor(
        public gameStatisticsService: GameStatisticsService,
        public gameMapDataManagerService: GameMapDataManagerService,
    ) {}
}
