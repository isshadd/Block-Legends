import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

@Component({
    selector: 'app-side-view-player-info',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './side-view-player-info.component.html',
    styleUrl: './side-view-player-info.component.scss',
})
export class SideViewPlayerInfoComponent implements OnInit {
    @Input() playerCharacter: PlayerCharacter;
    @Input() actionPoints: number;
    @Input() totalLife: number;

    attackDice: string;
    defenseDice: string;

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

    ngOnInit(): void {
        if (this.playerCharacter.dice === 'attack') {
            this.attackDice = '(D6)';
            this.defenseDice = '(D4)';
        } else {
            this.attackDice = '(D6)';
            this.defenseDice = '(D6)';
        }
    }
}
