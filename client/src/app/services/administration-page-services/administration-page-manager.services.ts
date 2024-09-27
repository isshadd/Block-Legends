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
            description: `League of Legends is a team-based strategy game where two teams of five powerful champions face off to destroy the other’s
            base. Choose from over 140 champions to make epic plays, secure kills, and take down towers as you battle your way to victory.`,
        },
        {
            id: 1,
            name: 'Minecraft',
            size: 38,
            mode: 'classique',
            imageUrl: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
            lastModificationDate: new Date('2020-01-03'),
            isVisible: true,
            description: `Minecraft is a game about placing blocks and going on adventures. Explore randomly generated worlds and build amazing things
            from the simplest of homes to the grandest of castles.`,
        },
        {
            id: 2,
            name: 'Penguin Diner',
            size: 25,
            mode: 'classique',
            imageUrl: 'https://tcf.admeen.org/game/4500/4373/400x246/penguin-diner.jpg',
            lastModificationDate: new Date('2005-12-12'),
            isVisible: true,
            description: `Penny the Penguin returns to Antarctica to serve up a feast! After a very successful stint in the Arctic,
                 Penny decides to open up her own diner on home territory.`,
        },
        {
            id: 3,
            name: 'Super Mario',
            size: 36,
            mode: 'CTF',
            imageUrl: 'https://image.uniqlo.com/UQ/ST3/eu/imagesother/2020/ut/gaming/pc-ut-hero-mario-35.jpg',
            lastModificationDate: new Date('2010-06-01'),
            isVisible: true,
            description: `Super Mario is a platform game series created by Nintendo, featuring their mascot, Mario. Alternatively 
                called the Super Mario Bros. series or simply the Mario series, it is the central series of the greater Mario franchise`,
        },
    ];

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
