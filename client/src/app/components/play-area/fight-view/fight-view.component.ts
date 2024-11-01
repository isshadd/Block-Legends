import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

const DELAY = 300;

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

    get healthArray(): unknown[] {
        return new Array(this.opponentCharacter.attributes.life);
    }

    get defenseArray(): unknown[] {
        return new Array(this.opponentCharacter.attributes.defense);
    }

    onAttack() {
        this.attack.emit();

        const playerImage = document.getElementById('player');
        const opponentImage = document.getElementById('opponent');

        playerImage?.classList.add('attack-player');
        opponentImage?.classList.add('attack-opponent');

        setTimeout(() => {
            playerImage?.classList.remove('attack-player');
            opponentImage?.classList.remove('attack-opponent');
        }, DELAY);
    }

    onEscape() {
        this.escape.emit();
    }
}
