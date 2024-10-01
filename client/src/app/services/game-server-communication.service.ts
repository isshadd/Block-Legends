import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateGameSharedDto } from '@common/interfaces/dto/game/create-game-shared.dto';
import { UpdateGameSharedDto } from '@common/interfaces/dto/game/update-game-shared.dto';
import { GameShared } from '@common/interfaces/game-shared';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameServerCommunicationService {
    private readonly baseUrl: string = `${environment.serverUrl}/game`;

    constructor(private readonly http: HttpClient) {}

    getGames(): Observable<GameShared[]> {
        return this.http.get<GameShared[]>(`${this.baseUrl}/`).pipe(catchError(this.handleError<GameShared[]>('getAllGames', [])));
    }

    getGame(id: string): Observable<GameShared> {
        return this.http.get<GameShared>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError<GameShared>(`getGame id=${id}`)));
    }

    addGame(game: CreateGameSharedDto): Observable<GameShared> {
        return this.http.post<GameShared>(`${this.baseUrl}/`, game).pipe(catchError(this.handleError<GameShared>('addGame')));
    }

    updateGame(id: string, game: UpdateGameSharedDto): Observable<void> {
        return this.http.patch<void>(`${this.baseUrl}/${id}`, game).pipe(catchError(this.handleError<void>('updateGame')));
    }

    deleteGame(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError<void>('deleteGame')));
    }

    emptyDatabase(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/`).pipe(catchError(this.handleError<void>('emptyDatabase')));
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            const errorMsg = error.message || 'Une erreur est survenue'; // Extract error messages from the server response
            return throwError(() => new Error(errorMsg)); // Pass the error messages
        };
    }
}
