import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Game } from '@common/game.interface';
import { CommunicationService } from '@app/services/communication.service';
import { Message } from '@common/message';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-administration-game',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './administration-game.component.html',
    styleUrl: './administration-game.component.scss',
})
export class AdministrationGameComponent {
    constructor(private readonly communicationService: CommunicationService) {}
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
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
    
    ngOnInit(): void {
        this.updateGamesList();
    }

    deleteGame(game: Game): void {
        this.games = this.games.filter((elem) => elem.id !== game.id);
    }

    emptyDB(): void {
        this.communicationService.dataDelete().subscribe({
            next: (response: any) => {
                const responseString = `Le serveur a reçu la requête et a retourné un code ${response.status} : ${response.statusText}`;
                this.message.next(responseString);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
    }
    sendDatatoDB(): void {

        const newMessage: Message = {
            title: 'The DB has been populated',
            body: 'Success !',
        };

        this.communicationService.dataPost(newMessage).subscribe({
            next: (response) => {
                const responseString = `Le serveur a reçu la requête et a retourné un code ${response.status} : ${response.statusText}`;
                this.message.next(responseString);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
    }

    deleteUniqueGame(game:Game): void {
        this.deleteGame(game);
        this.communicationService.deleteOneGame(game.name).subscribe({
            next: (response) => {
                const responseString = `Le serveur a reçu la requête et a retourné un code ${response.status} : ${response.statusText}`;
                this.message.next(responseString);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
    }
    updateGamesList(): void {
        this.communicationService.getGames().subscribe({
            next: (response: any) => {
                this.games = response.map((game: Game) => ({
                    name: game.name,
                    size: game.size,
                    mode: game.mode,
                    imageUrl: game.imageUrl,
                    lastModificationDate: new Date(game.lastModificationDate),
                    isVisible: game.isVisible,
                }));
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
    }




    onMouseOver(game: Game): void {
        // pour le moment, le type de game est any
        game.isHovered = true;
    }

    toggleVisibility(game: Game): void {
        game.isVisible = !game.isVisible;
    }
    onMouseOut(game: Game): void {
        game.isHovered = false;
    }

    getImageStyles(game: Game): any {
        return {
            transform: game.isHovered ? 'scale(1.4)' : 'scale(1)',
            opacity: game.isVisible ? '1' : '0.5',
            transition: 'transform 0.3s ease, opacity 0.3s ease',
        };
    }


}
