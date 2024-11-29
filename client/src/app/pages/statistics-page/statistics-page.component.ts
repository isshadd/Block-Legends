import { Component, Input } from '@angular/core';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { ClavardageComponent } from '../../components/clavardage/clavardage.component';
import { ArrowUpButtonComponent } from "../../components/arrow-up-button/arrow-up-button.component";
import { ArrowDownButtonComponent } from "../../components/arrow-down-button/arrow-down-button.component";

export enum SortCharacters {
    Name = 'name',
    Fights = 'fights',
    FightWins = 'fightWins',
    FightLoses = 'fightLoses',
}
@Component({
    selector: 'app-statistics-page',
    standalone: true,
    imports: [ClavardageComponent, ArrowUpButtonComponent, ArrowDownButtonComponent],
    templateUrl: './statistics-page.component.html',
    styleUrl: './statistics-page.component.scss',
})
export class StatisticsPageComponent {
    @Input() winner: PlayerCharacter;
    player1: PlayerCharacter;
    player2: PlayerCharacter;
    playersList: PlayerCharacter[] = [];
    sortCharacters = SortCharacters;

    constructor() {
        this.player1 = new PlayerCharacter('Player1');
        this.player1.avatar = AvatarEnum.Alex;
        this.playersList.push(this.player1);
        this.player1.fightWins = 2;
        this.player1.fightLoses = 1;

        this.player2 = new PlayerCharacter('Player2');
        this.player2.avatar = AvatarEnum.Arlina;
        this.playersList.push(this.player2);
        this.player2.fightWins = 1;
        this.player2.fightLoses = 3;
    }

    sortPlayersIncreasing(sort: SortCharacters) {
        switch (sort) {
            case SortCharacters.Fights:
                this.playersList.sort((a, b) => b.fightWins + b.fightLoses - (a.fightWins + a.fightLoses));
                break;
            case SortCharacters.Name:
                this.playersList.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case SortCharacters.FightWins:
                this.playersList.sort((a, b) => b.fightWins - a.fightWins);
                break;
            case SortCharacters.FightLoses:
                this.playersList.sort((a, b) => b.fightLoses - a.fightLoses);
                break;
            default:
                break;
        }
    }

    sortPlayersDecreasing(sort: SortCharacters) {
        switch (sort) {
            case SortCharacters.Fights:
                this.playersList.sort((a, b) => a.fightWins + a.fightLoses - (b.fightWins + b.fightLoses));
                break;
            case SortCharacters.Name:
                this.playersList.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case SortCharacters.FightWins:
                this.playersList.sort((a, b) => a.fightWins - b.fightWins);
                break;
            case SortCharacters.FightLoses:
                this.playersList.sort((a, b) => a.fightLoses - b.fightLoses);
                break;
            default:
                break;
        }
    }
}
