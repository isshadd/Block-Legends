import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { ColorService } from '@app/services/colors-service/colors.service';
import { RoomMessageReceived } from '@common/interfaces/roomMessage';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
    @ViewChild('chatMessages') messagesContainer: ElementRef;

    messageToSend: string = '';
    messages: RoomMessageReceived[] = this.chatService.roomMessages;

    playerName: string = '';
    shouldScroll: boolean = false;
    private subscriptions: Subscription = new Subscription();

    constructor(
        private chatService: ChatService,
        private colorService: ColorService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.playerName = this.chatService.player.name;
        this.subscriptions.add(
            this.chatService.messageReceived$.subscribe(() => {
                this.shouldScroll = true;
                this.cdr.detectChanges();
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
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
