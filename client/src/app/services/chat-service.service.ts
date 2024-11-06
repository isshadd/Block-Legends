import { Injectable } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { SocketStateService } from './SocketService/socket-state.service';
import { WebSocketService } from './SocketService/websocket.service';
// import { ChangeDetectorRef } from '@angular/core';
// import { ClavardageComponent } from '@app/components/clavardage/clavardage.component';
@Injectable({
    providedIn: 'root',
})
export class ChatService {
    // private chatComponent: ClavardageComponent;
    socket: WebSocketService | null = null;
    serverClock: Date;
    roomMessage: string = '';
    roomMessages: string[] = [];
    playerName: string;
    constructor(private socketStateService: SocketStateService) {}

    initialize() {
        this.socket = this.socketStateService.getActiveSocket();

        this.socketStateService.hasActiveSocket$.subscribe((hasSocket) => {
            if (hasSocket) {
                this.socket = this.socketStateService.getActiveSocket();
            } else {
                this.socket = null;
            }
        });
        this.socket?.players$.subscribe((players: PlayerCharacter[]) => {
            if (players.length > 0) {
                this.playerName = players[0].name; // Assuming you want the name of the first player
            }
        });
    }

    // setClavardageComponent(component: ClavardageComponent) {
    //   this.chatComponent = component;
    // }

    broadcastMessageToAll(roomMessage: string): void {
        const result = 200;
        if (roomMessage.length > result) {
            alert('Message cannot exceed 200 characters.');
            return;
        }
        if (this.socket && roomMessage.trim()) {
            const message = { time: this.serverClock, sender: this.playerName, content: roomMessage };
            this.socket.send('broadcastAll', message);
            // this.chatComponent.cdr.detectChanges();
        }
    }
}
