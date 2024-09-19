import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from 'src/app/classes/Games-create-game/game-interface';

@Component({
    selector: 'app-create-game',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './create-game.component.html',
    styleUrl: './create-game.component.scss',
})
export class CreateGameComponent {
    games: { name: string; size: number; mode: string; imgSrc: string; visible: boolean }[] = [
        {
            name: 'League Of Legends',
            size: 30,
            mode: 'Capture de drapeau',
            imgSrc: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
            visible: true,
        },
        {
            name: 'Minecraft',
            size: 38,
            mode: 'Combat classique',
            imgSrc: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
            visible: true,
        },
        {
            name: 'Penguin Diner',
            size: 25,
            mode: 'Combat classique',
            imgSrc: 'https://tcf.admeen.org/game/4500/4373/400x246/penguin-diner.jpg',
            visible: true,
        },
        {
            name: 'Super Mario',
            size: 36,
            mode: 'Capture de drapeau',
            imgSrc: 'https://image.uniqlo.com/UQ/ST3/eu/imagesother/2020/ut/gaming/pc-ut-hero-mario-35.jpg',
            visible: true,
        },
        {
            name: 'Call of Duty',
            size: 35,
            mode: 'Capture de drapeau',
            imgSrc: 'https://image.uniqlo.com/UQ/ST3/eu/imagesother/2020/ut/gaming/pc-ut-hero-mario-35.jpg',
            visible: false,
        },
    ];

    selectedGame: unknown;
    gameStatus: string | null;
    selectedMode: string | null = 'Combat classique';

    constructor(private router: Router) {}

    selectGame(game: Game /* A CHANGER UNE FOIS LE TYPE DE {game} DEFINI*/) {
        if (!game.visible) {
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
        return this.games.filter((game) => game.visible && game.mode === this.selectedMode);
    }
}
