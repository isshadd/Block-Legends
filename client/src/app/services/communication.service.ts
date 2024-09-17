import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '@common/message';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    basicGet(): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}/example`).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    basicPost(message: Message): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/example/send`, message, { observe: 'response', responseType: 'text' });
    }
    dataPost(message: Message): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/example/populate`, message, { observe: 'response', responseType: 'text' });
    }
    dataDelete(): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/example/empty`, { observe: 'response', responseType: 'text' }).pipe(
            tap((response) => {
                if (response.status === 200) {
                    // Send a message to the server
                    this.basicPost({ title: 'Operation Successful', body: 'The database has been emptied successfully.' }).subscribe();
                }
            })
        );
    }
    
    deleteOneGame(gameName: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/example/deleteGame?name=${gameName}`, { observe: 'response', responseType: 'text' }).pipe(
            tap((response) => {
                if (response.status === 200) {
                    // Send a message to the server
                    this.basicPost({ title: 'Operation Successful', body: `The game ${gameName} has been deleted successfully.` }).subscribe();
                }
            })
        );
    }


    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
