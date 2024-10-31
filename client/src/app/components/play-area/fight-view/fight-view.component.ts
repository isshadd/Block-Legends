import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

@Component({
    selector: 'app-fight-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './fight-view.component.html',
    styleUrls: ['./fight-view.component.scss'],
})
export class FightViewComponent {
    @Input() playerCharacter: PlayerCharacter;
    @Input() opponentCharacter: PlayerCharacter;

    @Output() attack = new EventEmitter<void>();
    @Output() escape = new EventEmitter<void>();

    onAttack() {
        this.attack.emit();

        const playerImage = document.getElementById('player');
        const opponentImage = document.getElementById('opponent');

        playerImage?.classList.add('attack-player');
        opponentImage?.classList.add('attack-opponent');

        setTimeout(() => {
            playerImage?.classList.remove('attack-player');
            opponentImage?.classList.remove('attack-opponent');
        }, 300);
    }

    onEscape() {
        this.escape.emit();
    }

    get healthArray(): any[] {
        return new Array(this.opponentCharacter.attributes.life);
    }

    get defenseArray(): any[] {
        return new Array(this.opponentCharacter.attributes.defense);
    }
}
