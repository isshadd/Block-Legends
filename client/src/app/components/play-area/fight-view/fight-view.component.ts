import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

@Component({
    selector: 'app-fight-view',
    standalone: true,
    imports: [],
    templateUrl: './fight-view.component.html',
    styleUrl: './fight-view.component.scss',
})
export class FightViewComponent {
    @Input() playerCharacter: PlayerCharacter;
    @Input() opponentCharacter: PlayerCharacter;

    @Output() attack = new EventEmitter<void>();
    @Output() escape = new EventEmitter<void>();

    onAttack() {
        this.attack.emit();
    }

    onEscape() {
        this.escape.emit();
    }
}
