import { Component, ViewChild, ElementRef, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { RoomMessage } from '@common/interfaces/roomMessage';
import { ColorService } from '@app/services/colors.service'; // Import ColorService
import { PlayerCharacter } from '@common/classes/Player/player-character';


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
    player: PlayerCharacter = this.chatService.player;
    playerID: string;
    shouldScroll: boolean = false;

    constructor(
        private chatService: ChatService,
        private colorService: ColorService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
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

    getPlayerClass(socketId: string): string {
        return this.colorService.getColor(socketId); // Use ColorService to get the color based on socket ID
    }

    private scrollToBottom(): void {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
}