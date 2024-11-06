import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OnInit, AfterViewChecked } from '@angular/core';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-clavardage',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './clavardage.component.html',
  styleUrl: './clavardage.component.scss'
})
export class ClavardageComponent implements OnInit, AfterViewChecked {
  messageToSend: string = '';
  messages = this.chatService.roomMessages;
  playerName : string = '';
  shouldScroll: boolean = false;
  @ViewChild('chatMessages') messagesContainer: ElementRef;

  constructor(
    private chatService: ChatService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chatService.initialize();
    this.playerName = this.chatService.playerName;
    this.chatService.messageReceived$.subscribe(() => {
      this.shouldScroll = true;
      this.cdr.detectChanges();
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      setTimeout(() => {
        this.scrollToBottom();
        this.shouldScroll = false;
      }, 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  sendMessage() {
    this.chatService.broadcastMessageToAll(this.messageToSend);
    this.messageToSend = '';
    this.shouldScroll = true;
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
