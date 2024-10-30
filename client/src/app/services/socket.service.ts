import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { ChatEvents } from '@common/enums/chat-events'; // Adjust the import path as needed

@Injectable({
  providedIn: 'root'
})
export class SocketManagerService {
  socket: Socket;

  constructor() {
    this.socket = io(environment.websocketUrl, {
      transports: ['websocket'],
      withCredentials: true,
    });
  }


  on<T>(event: string, action: (data: T) => void): void {
    this.socket.on(event, action);
  }

  send<T>(event: string, data?: T, callback?: Function): void {
    this.socket.emit(event, ...([data, callback].filter(x => x)));
  }

  // Method to validate a word
  validateWord(word: string) {
    this.socket.emit(ChatEvents.Validate, word);
  }

  // Method to validate a word with acknowledgment
  validateWordWithAck(word: string): Promise<{ isValid: boolean }> {
    return new Promise((resolve) => {
      this.socket.emit(ChatEvents.ValidateACK, word, (response: { isValid: boolean }) => {
        resolve(response);
      });
    });
  }
}