import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Tile } from '@app/classes/Tiles/tile';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Map {
    _id?: string;
    name: string;
    description: string;
    size: number;
    tiles: Tile[][];
}

export interface CreateMapDto {
    name: string;
    description: string;
    size: number;
    tiles: Tile[][];
}

@Injectable({
    providedIn: 'root',
})
export class MapServerCommunicationService {
    private readonly baseUrl: string = `${environment.serverUrl}/map`;

    constructor(private readonly http: HttpClient) {}

    getAllMaps(): Observable<Map[]> {
        return this.http.get<Map[]>(`${this.baseUrl}/`).pipe(catchError(this.handleError<Map[]>('getAllMaps', [])));
    }

    getMap(id: string): Observable<Map> {
        return this.http.get<Map>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError<Map>(`getMap id=${id}`)));
    }

    createMap(createMapDto: CreateMapDto): Observable<Map> {
        return this.http.post<Map>(`${this.baseUrl}/`, createMapDto).pipe(catchError(this.handleError<Map>('createMap')));
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(`${operation} failed: ${error.message}`);
            return of(result as T);
        };
    }
}
