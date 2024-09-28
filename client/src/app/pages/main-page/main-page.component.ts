import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { GameMode } from '@common/enums/game-mode';
import { ItemType } from '@common/enums/item-type';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';
import { Message } from '@common/message';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-main-page',
    standalone: true,
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
    imports: [RouterLink],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(
        private readonly communicationService: CommunicationService,
        public mapEditorManagerService: MapEditorManagerService,
    ) {}

    sendTimeToServer(): void {
        const newTimeMessage: Message = {
            title: 'Hello from the client',
            body: 'Time is : ' + new Date().toString(),
        };
        // Important de ne pas oublier "subscribe" ou l'appel ne sera jamais lancé puisque personne l'observe
        this.communicationService.basicPost(newTimeMessage).subscribe({
            next: (response) => {
                const responseString = `Le serveur a reçu la requête a retourné un code ${response.status} : ${response.statusText}`;
                this.message.next(responseString);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
    }

    getMessagesFromServer(): void {
        this.communicationService
            .basicGet()
            // Cette étape transforme l'objet Message en un seul string
            .pipe(
                map((message: Message) => {
                    return `${message.title} ${message.body}`;
                }),
            )
            .subscribe(this.message);
    }

    //**************Temp */
    mapEditorNewMap(): void {
        this.mapEditorManagerService.newGame(MapSize.SMALL, GameMode.CTF);
    }

    mapEditorLoadMap(): void {
        this.mapEditorManagerService.loadGame({
            name: 'Test load',
            description: 'Test description',
            size: MapSize.SMALL,
            mode: GameMode.CTF,
            imageUrl: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
            lastModificationDate: new Date(),
            isVisible: false,
            tiles: [
                [
                    {
                        type: TileType.Grass,
                        item: {
                            type: ItemType.Totem,
                        },
                    },
                    {
                        type: TileType.Grass,
                        item: null,
                    },
                ],
                [
                    {
                        type: TileType.Grass,
                        item: {
                            type: ItemType.Chestplate,
                        },
                    },
                    {
                        type: TileType.Water,
                        item: null,
                    },
                ],
            ],
        });
    }
    //**************Temp */
}
