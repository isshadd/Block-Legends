import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModeService } from '@app/services/game-mode-services/gameMode.service';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent {
    selectedMode: string | null = 'Combat classique';

    constructor(private modeService: ModeService) {}

    selectMode(mode: string): void {
        this.selectedMode = mode;
        this.modeService.setSelectedMode(mode);
    }
}
