import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-administration-game',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './administration-game.component.html',
    styleUrl: './administration-game.component.scss',
})
export class AdministrationGameComponent {
    games: { name: string; size: number; mode: string; imgSrc: string; lastModif: Date; isVisible: boolean }[] = [
        {
            name: 'League Of Legends',
            size: 30,
            mode: 'CTF',
            imgSrc: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
            lastModif: new Date('2024-10-23'),
            isVisible: true,
        },
        {
            name: 'Minecraft',
            size: 38,
            mode: 'Normal',
            imgSrc: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
            lastModif: new Date('2020-01-03'),
            isVisible: true,
        },
        {
            name: 'Penguin Diner',
            size: 25,
            mode: 'Normal',
            imgSrc: 'https://tcf.admeen.org/game/4500/4373/400x246/penguin-diner.jpg',
            lastModif: new Date('2005-12-12'),
            isVisible: true,
        },
        {
            name: 'Super Mario',
            size: 36,
            mode: 'CTF',
            imgSrc: 'https://image.uniqlo.com/UQ/ST3/eu/imagesother/2020/ut/gaming/pc-ut-hero-mario-35.jpg',
            lastModif: new Date('2010-06-01'),
            isVisible: true,
        },
    ];
    onMouseOver(game: any): void {
        // pour le moment, le type de game est any
        game.isHovered = true;
    }
    onMouseOut(game: any): void {
        game.isHovered = false;
    }
    getImageStyles(game: any): any {
        return {
            transform: game.isHovered ? 'scale(1.4)' : 'scale(1)',
            opacity: game.isVisible ? '1' : '0.5',
            transition: 'transform 0.3s ease, opacity 0.3s ease',
        };
    }

    deleteGame(game: any) {
        this.games = this.games.filter((elem) => elem != game);
    }

    exportGame(game: any) {}

    toggleVisibility(game: any): void {
        game.isVisible = !game.isVisible;
    }
    getGameStyle(game: any): any {
        return {
            color: game.isVisible ? 'black' : 'gray',
            opacity: game.isVisible ? '1' : '0.5',
        };
    }
}
