import { Injectable } from '@angular/core';
import { Game } from '@common/game.interface';
import { CommunicationService } from '@app/services/communication.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class GameServerCommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(
        private communicationService: CommunicationService,
        private readonly http: HttpClient,
    ) {}

    dataDelete(): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/game-admin/`, { observe: 'response', responseType: 'text' }).pipe(
            tap((response) => {
                if (response.status === HttpStatusCode.Ok) {
                    // Send a message to the server
                    this.communicationService
                        .basicPost({ title: 'Operation Successful', body: 'The database has been emptied successfully.' })
                        .subscribe();
                }
            }),
        );
    }

    deleteOneGame(gameName: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/game-admin/${gameName}`, { observe: 'response', responseType: 'text' }).pipe(
            tap((response) => {
                if (response.status === HttpStatusCode.Ok) {
                    // Send a message to the server
                    this.communicationService
                        .basicPost({ title: 'Operation Successful', body: `The game ${gameName} has been deleted successfully.` })
                        .subscribe();
                }
            }),
        );
    }

    getGames(): Observable<Game[]> {
        return this.http.get<Game[]>(`${this.baseUrl}/game-admin/`).pipe(catchError(this.communicationService.handleError<Game[]>('getGames', [])));
    }
}
