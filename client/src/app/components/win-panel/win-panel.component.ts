import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

@Component({
    selector: 'app-win-panel',
    standalone: true,
    imports: [],
    templateUrl: './win-panel.component.html',
    styleUrl: './win-panel.component.scss',
})
export class WinPanelComponent {
    @Input() winner: PlayerCharacter;
    @Output() close = new EventEmitter<void>();

    closeWinPanel() {
        this.close.emit();
    }
}
