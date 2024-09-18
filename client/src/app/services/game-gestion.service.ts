import { Injectable } from '@angular/core';
import { CommunicationService } from './communication.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Message } from '@common/message';

@Injectable({
  providedIn: 'root'
})
export class GameGestionService {
  constructor(private communicationService: CommunicationService) {}

  sendDatatoDB(): void {
    const newMessage: Message = {
      title: 'The DB has been populated',
      body: 'Success !',
    };

    this.communicationService.dataPost(newMessage).subscribe({
      next: (response: any) => {
        console.log('Database populated successfully:', response);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error populating database:', err);
      },
    });
  }
}
