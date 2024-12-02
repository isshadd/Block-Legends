import { Component, ViewChild, ElementRef, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { RoomMessage } from '@common/interfaces/roomMessage';

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
    messages: RoomMessage[] = this.chatService.roomMessages;
    playerName: string = '';
    shouldScroll: boolean = false;
    playerColors: { [key: string]: string } = {}; // Store generated colors for players
    colors: string[] = ['#3a86ff', '#ff006e', '#8338ec', '#fb5607', '#ffbe0b', '#00b4d8']; // Predefined set of colors

    constructor(
        private chatService: ChatService,
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

    getPlayerClass(player: string): string {
        if (!this.playerColors[playerName]) {
            this.playerColors[playerName] = this.assignColor(playerName);
        }
        this.playerColors[playerName]

        return this.playerColors[playerName];
    }

    private assignColor(playerName: string): string {
        const index = Object.keys(this.playerColors).length % this.colors.length;
        this.colors.pop()
        return this.colors[index];
    }

    private scrollToBottom(): void {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
}