import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GameListComponent } from '@app/components/create-game/game-list/game-list/game-list.component';
import { NavBarComponent } from '@app/components/create-game/nav-bar/nav-bar.component';

@Component({
    selector: 'app-create-game',
    standalone: true,
    imports: [CommonModule, NavBarComponent, GameListComponent],
    templateUrl: './create-game.component.html',
    styleUrl: './create-game.component.scss',
})
export class CreateGameComponent {}
