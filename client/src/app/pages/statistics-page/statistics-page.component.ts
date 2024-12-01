import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowDownButtonComponent } from '@app/components/arrow-down-button/arrow-down-button.component';
import { ArrowUpButtonComponent } from '@app/components/arrow-up-button/arrow-up-button.component';
import { ClavardageComponent } from '@app/components/clavardage/clavardage.component';
import { PlayerCharacter } from '@common/classes/Player/player-character';

export enum SortCharacters {
    Name = 'name',
    Fights = 'fights',
    FightWins = 'fightWins',
    FightLoses = 'fightLoses',
}
@Component({
    selector: 'app-statistics-page',
    standalone: true,
    imports: [ClavardageComponent, RouterLink, ArrowUpButtonComponent, ArrowDownButtonComponent],
    templateUrl: './statistics-page.component.html',
    styleUrl: './statistics-page.component.scss',
})
export class StatisticsPageComponent {
    @Input() isGameModeCTF: boolean;
    @Input() playersList: PlayerCharacter[] = [];
    sortCharacters = SortCharacters;

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
