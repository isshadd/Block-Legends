import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { GameMode } from '@common/enums/game-mode';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent {
    @Output() select = new EventEmitter<GameMode>();

    GameMode = GameMode;

    selectedMode: GameMode = GameMode.Classique;

    selectMode(mode: GameMode): void {
        this.selectedMode = mode;
        this.select.emit(this.selectedMode);
    }
}
