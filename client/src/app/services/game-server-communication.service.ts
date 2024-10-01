import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateGameSharedDto } from '@common/interfaces/dto/game/create-game-shared.dto';
import { UpdateGameSharedDto } from '@common/interfaces/dto/game/update-game-shared.dto';
import { GameShared } from '@common/interfaces/game-shared';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameServerCommunicationService {
    private readonly baseUrl: string = `${environment.serverUrl}/game`;

    constructor(private readonly http: HttpClient) {}

    getGames(): Observable<GameShared[]> {
        return this.http.get<GameShared[]>(`${this.baseUrl}/`).pipe(catchError(this.handleError<GameShared[]>()));
    }

    getGame(id: string | undefined): Observable<GameShared> {
        return this.http.get<GameShared>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError<GameShared>()));
    }

    addGame(game: CreateGameSharedDto): Observable<GameShared> {
        return this.http.post<GameShared>(`${this.baseUrl}/`, game).pipe(catchError(this.handleError<GameShared>()));
    }

    updateGame(id: string, game: UpdateGameSharedDto): Observable<void> {
        return this.http.patch<void>(`${this.baseUrl}/${id}`, game).pipe(catchError(this.handleError<void>()));
    }

    deleteGame(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError<void>()));
    }

    emptyDatabase(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/`).pipe(catchError(this.handleError<void>()));
    }

    private handleError<T>(result?: T) {
        return (): Observable<T> => {
            return of(result as T);
        };
    }
}
