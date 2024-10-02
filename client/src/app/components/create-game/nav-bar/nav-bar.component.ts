import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameMode } from '@common/enums/game-mode';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent {
    @Input() selectedMode: GameMode = GameMode.Classique;
    @Output() selection = new EventEmitter<GameMode>();

    gameMode = GameMode;

    selectMode(mode: GameMode): void {
        this.selectedMode = mode;
        this.selection.emit(this.selectedMode);
    }
}
