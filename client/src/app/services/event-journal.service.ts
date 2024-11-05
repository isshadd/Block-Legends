import { Injectable } from '@angular/core';
import { SocketStateService } from './SocketService/socket-state.service';
import { WebSocketService } from './SocketService/websocket.service';
import { Subject } from 'rxjs'; 
//import { RoomMessage } from '@common/interfaces/roomMessage';
//import { ChangeDetectorRef } from '@angular/core';
//import { ClavardageComponent } from '@app/components/clavardage/clavardage.component';
@Injectable({
  providedIn: 'root'
})
export class EventJournalService {
  socket: WebSocketService | null = null;
  serverClock: Date;
  roomEvents: string[] = [];
  playersInvolved : string[][] = [];
  players: string[] = ['JOSH', 'JAMES', 'JENNY', 'JESSICA'];
  public messageReceivedSubject = new Subject<void>();
  messageReceived$ = this.messageReceivedSubject.asObservable();

  constructor(private socketStateService: SocketStateService
  ) {}


  initialize() {
    this.socket = this.socketStateService.getActiveSocket();

    this.socketStateService.hasActiveSocket$.subscribe(hasSocket => {
        if (hasSocket) {
            this.socket = this.socketStateService.getActiveSocket();
        } else {
            this.socket = null;
        }
    });

  }

  broadcastEvent(event: string): void {
    if (this.socket && event.trim()) {
      this.socket.sendEventToRoom(this.serverClock, event, this.players);
    }
  }

  addEvent(sentEvent: string, associatedPlayers: string[]): void {
    this.roomEvents.push(sentEvent);
    this.playersInvolved.push(associatedPlayers); // Add to array of arrays
  }
}

