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
    games: Game[] = [];
    
    ngOnInit(): void {
        
        this.updateGamesList();
    }

    deleteGame(game: Game): void {
        this.games = this.games.filter((elem) => elem.name !== game.name);
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


    toggleVisibility(game: Game): void {
        game.isVisible = !game.isVisible;
    }
    


}
