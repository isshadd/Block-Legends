import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateMapSharedDto } from '@common/interfaces/dto/map-shared.dto';
import { MapShared } from '@common/interfaces/map-shared';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class MapServerCommunicationService {
    private readonly baseUrl: string = `${environment.serverUrl}/map`;

    constructor(private readonly http: HttpClient) {}

    getAllMaps(): Observable<MapShared[]> {
        return this.http.get<MapShared[]>(`${this.baseUrl}/`).pipe(catchError(this.handleError<MapShared[]>('getAllMaps', [])));
    }

    getMap(id: string): Observable<MapShared> {
        return this.http.get<MapShared>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError<MapShared>(`getMap id=${id}`)));
    }

    createMap(createMapDto: CreateMapSharedDto): Observable<MapShared> {
        return this.http.post<MapShared>(`${this.baseUrl}/`, createMapDto).pipe(catchError(this.handleError<MapShared>('createMap')));
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(`${operation} failed: ${error.message}`);
            return of(result as T);
        };
    }
}
