import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-game',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './create-game.component.html',
    styleUrl: './create-game.component.scss',
})
export class CreateGameComponent {
    games: { name: string; size: number; mode: string; imgSrc: string; lastModif: Date; visible: boolean }[] = [
        {
            name: 'League Of Legends',
            size: 30,
            mode: 'Capture de drapeau',
            imgSrc: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
            lastModif: new Date('2024-10-23'),
            visible: true,
        },
        {
            name: 'Minecraft',
            size: 38,
            mode: 'Combat classique',
            imgSrc: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
            lastModif: new Date('2020-01-03'),
            visible: true,
        },
        {
            name: 'Penguin Diner',
            size: 25,
            mode: 'Combat classique',
            imgSrc: 'https://tcf.admeen.org/game/4500/4373/400x246/penguin-diner.jpg',
            lastModif: new Date('2005-12-12'),
            visible: true,
        },
        {
            name: 'Super Mario',
            size: 36,
            mode: 'Capture de drapeau',
            imgSrc: 'https://image.uniqlo.com/UQ/ST3/eu/imagesother/2020/ut/gaming/pc-ut-hero-mario-35.jpg',
            lastModif: new Date('2010-06-01'),
            visible: true,
        },
        {
            name: 'Call of Duty',
            size: 35,
            mode: 'Capture de drapeau',
            imgSrc: 'https://image.uniqlo.com/UQ/ST3/eu/imagesother/2020/ut/gaming/pc-ut-hero-mario-35.jpg',
            lastModif: new Date('2010-06-01'),
            visible: false,
        },
    ];

    selectedGame: unknown;
    gameStatus: string | null;
    selectedMode: string | null = 'Combat classique';

    constructor(private router: Router) {}

    selectGame(game: any /* A CHANGER UNE FOIS LE TYPE DE {game} DEFINI*/) {
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
}
