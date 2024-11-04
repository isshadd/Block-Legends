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
        this.onPlayerAttack();
    }

    onPlayerAttack() {
        const playerImage = document.getElementById('player');
        const opponentImage = document.getElementById('opponent');

        playerImage?.classList.add('attack-player');
        setTimeout(() => {
            playerImage?.classList.remove('attack-player');
        }, DELAY);

        opponentImage?.classList.add('hit');
        setTimeout(() => {
            opponentImage?.classList.remove('hit');
        }, DELAY);
    }

    onOpponentAttack() {
        const opponentImage = document.getElementById('opponent');
        const playerImage = document.getElementById('player');

        opponentImage?.classList.add('attack-opponent');
        setTimeout(() => {
            opponentImage?.classList.remove('attack-opponent');
        }, DELAY);

        playerImage?.classList.add('hit');
        setTimeout(() => {
            playerImage?.classList.remove('hit');
        }, DELAY);
    }

    onEscape() {
        this.escape.emit();
    }
}
