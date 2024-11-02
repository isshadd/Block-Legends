import { Component } from '@angular/core';

@Component({
    selector: 'app-players-list',
    standalone: true,
    imports: [],
    templateUrl: './players-list.component.html',
    styleUrl: './players-list.component.scss',
})
export class PlayersListComponent {
    players = [
        { name: 'Sam', health: 100, speed: 10, attack: 5, victories: 3, defeats: 1 },
        { name: 'Béatrice', health: 90, speed: 12, attack: 6, victories: 5, defeats: 2 },
        { name: 'Amine', health: 80, speed: 9, attack: 7, victories: 2, defeats: 4 },
    ];
}
