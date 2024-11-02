import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

@Component({
    selector: 'app-player-map-entity-info-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './player-map-entity-info-view.component.html',
    styleUrl: './player-map-entity-info-view.component.scss',
})
export class PlayerMapEntityInfoViewComponent {
    @Input() playerCharacter: PlayerCharacter;
    @Output() close = new EventEmitter<void>();

    get healthArray() {
        return new Array(this.playerCharacter.attributes.life);
    }

    get defenseArray() {
        return new Array(this.playerCharacter.attributes.defense);
    }

    get speedArray() {
        return new Array(this.playerCharacter.attributes.speed);
    }

    get attackArray() {
        return new Array(this.playerCharacter.attributes.attack);
    }

    closePanel() {
        this.close.emit();
    }
}
