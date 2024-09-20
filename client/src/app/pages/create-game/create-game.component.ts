import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '/Users/issamhaddadi/Desktop/Projet 2/LOG2990-104/common/game.interface';

@Component({
    selector: 'app-create-game',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './create-game.component.html',
    styleUrl: './create-game.component.scss',
})
export class CreateGameComponent {
    games: Game[] = [
        {
            id: 0,
            name: 'League Of Legends',
            size: 30,
            mode: 'Capture de drapeau',
            imageUrl: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
            lastModificationDate: new Date('2024-10-23'),
            isVisible: true,
        },
        {
            id: 1,
            name: 'Minecraft',
            size: 38,
            mode: 'Combat classique',
            imageUrl: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
            lastModificationDate: new Date('2020-01-03'),
            isVisible: true,
        },
        {
            id: 2,
            name: 'Penguin Diner',
            size: 25,
            mode: 'Combat classique',
            imageUrl: 'https://tcf.admeen.org/game/4500/4373/400x246/penguin-diner.jpg',
            lastModificationDate: new Date('2005-12-12'),
            isVisible: true,
        },
        {
            id: 3,
            name: 'Super Mario',
            size: 36,
            mode: 'Capture de drapeau',
            imageUrl: 'https://image.uniqlo.com/UQ/ST3/eu/imagesother/2020/ut/gaming/pc-ut-hero-mario-35.jpg',
            lastModificationDate: new Date('2010-06-01'),
            isVisible: true,
        },
    ];

    selectedGame: unknown;
    gameStatus: string | null;
    selectedMode: string | null = 'Combat classique';

    constructor(private router: Router) {}

    selectGame(game: Game) {
        if (!game.isVisible) {
            this.gameStatus = `Le jeu choisi ${game.name} n'est plus visible ou supprimé`;
            this.selectedGame = null;
        } else {
            this.selectedGame = game;
            this.gameStatus = null;
            this.router.navigate(['/create-character']);
        }
    }

    homeButton() {
        this.router.navigate(['/home']);
    }

    selectMode(mode: string): void {
        this.selectedMode = mode;
    }

    getFilteredGames() {
        if (!this.selectedMode) {
            return this.games;
        }
        return this.games.filter((game) => game.isVisible && game.mode === this.selectedMode);
    }
}
