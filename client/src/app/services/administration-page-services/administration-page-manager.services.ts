import { Injectable } from '@angular/core';
import { Game } from '@common/game.interface';

@Injectable({
    providedIn: 'root',
})
export class AdministrationPageManagerService {
    games: Game[] = [
        {
            id: 0,
            name: 'League Of Legends',
            size: 30,
            mode: 'CTF',
            imageUrl: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
            lastModificationDate: new Date('2024-10-23'),
            isVisible: true,
        },
        {
            id: 1,
            name: 'Minecraft',
            size: 38,
            mode: 'Normal',
            imageUrl: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
            lastModificationDate: new Date('2020-01-03'),
            isVisible: true,
        },
        {
            id: 2,
            name: 'Penguin Diner',
            size: 25,
            mode: 'Normal',
            imageUrl: 'https://tcf.admeen.org/game/4500/4373/400x246/penguin-diner.jpg',
            lastModificationDate: new Date('2005-12-12'),
            isVisible: true,
        },
        {
            id: 3,
            name: 'Super Mario',
            size: 36,
            mode: 'CTF',
            imageUrl: 'https://image.uniqlo.com/UQ/ST3/eu/imagesother/2020/ut/gaming/pc-ut-hero-mario-35.jpg',
            lastModificationDate: new Date('2010-06-01'),
            isVisible: true,
        },
    ];

    constructor() {}

    getGames(): Game[] {
        return this.games;
    }

    deleteGame(game: Game): void {
        this.games = this.games.filter((elem) => elem.id !== game.id);
    }

    toggleVisibility(game: Game): void {
        game.isVisible = !game.isVisible;
    }
}
