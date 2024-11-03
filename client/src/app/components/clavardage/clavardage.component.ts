// clavardage.component.ts
import { Component, ViewChild, ElementRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OnInit, AfterViewChecked } from '@angular/core';
import { ChatService } from '@app/services/chat-service.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-clavardage',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './clavardage.component.html',
  styleUrl: './clavardage.component.scss'
})
export class ClavardageComponent implements OnInit, AfterViewChecked {
  serverClock: Date;
  messageToSend: string = '';
  messages = this.chatService.roomMessages;
  playerName: string;

  @ViewChild('chatMessages') messagesContainer: ElementRef;

  constructor(
    private chatService: ChatService,
    public cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chatService.initialize();
  }


  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  

  trackByIndex(index: number): number {
    return index;
  }

  sendMessage() {
    this.chatService.broadcastMessageToAll(this.messageToSend);
    this.messageToSend = '';
  }
 

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}