import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { DiceType } from '@common/enums/dice-type';

@Component({
    selector: 'app-side-view-player-info',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './side-view-player-info.component.html',
    styleUrl: './side-view-player-info.component.scss',
})
export class SideViewPlayerInfoComponent implements OnInit {
    @Input() playerCharacter: PlayerCharacter;

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
        if (this.playerCharacter.dice === DiceType.Attack) {
            this.attackDice = 'D6';
            this.defenseDice = 'D4';
        } else {
            this.attackDice = 'D4';
            this.defenseDice = 'D6';
        }
    }
}
