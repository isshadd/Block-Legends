import { Component, ViewChild, ElementRef, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { RoomMessageReceived } from '@common/interfaces/roomMessage';
import { ColorService } from '@app/services/colors.service';

@Component({
    selector: 'app-clavardage',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './clavardage.component.html',
    styleUrls: ['./clavardage.component.scss'],
})
export class ClavardageComponent implements OnInit, AfterViewChecked {
    @ViewChild('chatMessages') messagesContainer: ElementRef;

    messageToSend: string = '';
    messages: RoomMessageReceived[] = this.chatService.roomMessages;

    playerName: string = '';
    shouldScroll: boolean = false;

    constructor(
        private chatService: ChatService,
        private colorService: ColorService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.playerName = this.chatService.player.name;
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

    getPlayerClass(playerId: string): string {
        return this.colorService.getColor(playerId); // Use ChatService to get the color based on player ID
    }

    private scrollToBottom(): void {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
}
