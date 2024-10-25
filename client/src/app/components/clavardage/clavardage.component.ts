import { Component} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SocketManagerService } from '@app/services/socket.service';
//import { ChatEvents } from '@common/enums/chat-events';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-clavardage',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './clavardage.component.html',
  styleUrl: './clavardage.component.scss'
})
export class ClavardageComponent {
  serverMessage: string = '';
  serverClock: Date;
  message: string = '';
  messages: string[] = [];
  roomMessages: string[] = [];
  broadcastMessage: string = '';

  constructor(private socketManagerService: SocketManagerService) {
  }

  get socketId() {
    return this.socketManagerService.socket.id ? this.socketManagerService.socket.id : "";
  }

  ngOnInit() {
    this.configureBaseSocketFeatures();
  }
  
  configureBaseSocketFeatures() {
    this.socketManagerService.on("connect", () => {
      console.log(`Connexion par WebSocket sur le socket ${this.socketId}`);
    });
    // Afficher le message envoyé lors de la connexion avec le serveur
    this.socketManagerService.on("hello", (message: string) => {
      this.serverMessage = message;
    });
    // Afficher le message envoyé à chaque émission de l'événement "clock" du serveur
    this.socketManagerService.on("clock", (time: Date) => {
      this.serverClock = time;
    });

    // Gérer l'événement envoyé par le serveur : afficher le message envoyé par un client connecté
    this.socketManagerService.on('massMessage', (broadcastMessage: string) => {
      this.messages.push(broadcastMessage);
    });

    // Gérer l'événement envoyé par le serveur : afficher le message envoyé par un membre de la salle
    this.socketManagerService.on('roomMessage', (roomMessage: string) => {
      this.roomMessages.push(roomMessage);
    });
  }

 
  broadcastMessageToAll() {
    this.socketManagerService.send('broadcastAll', this.broadcastMessage);
    this.broadcastMessage = "";
  }

  validateWord() {
    this.socketManagerService.validateWord(this.message);
  }

  async validateWordWithAck() {
    const response = await this.socketManagerService.validateWordWithAck(this.message);
    console.log('Word is valid:', response.isValid);
  }

}
