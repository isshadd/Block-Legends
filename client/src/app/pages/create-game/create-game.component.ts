import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GameListComponent } from '@app/components/create-game/game-list/game-list/game-list.component';
import { NavBarComponent } from '@app/components/create-game/nav-bar/nav-bar.component';
import { ModeService } from '@app/services/game-mode-services/gameMode.service';
import { GameMode } from '@common/enums/game-mode';

@Component({
    selector: 'app-create-game',
    standalone: true,
    imports: [CommonModule, NavBarComponent, GameListComponent],
    templateUrl: './create-game.component.html',
    styleUrl: './create-game.component.scss',
})
export class CreateGameComponent {
    constructor(public modeService: ModeService) {}

    selectMode(mode: GameMode): void {
        this.modeService.setSelectedMode(mode);
    }
}
