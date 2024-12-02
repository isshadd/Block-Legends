import { Component, ViewChild, ElementRef, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { CommonModule } from '@angular/common';
import { RoomEvent } from '@common/interfaces/RoomEvent';
import { PlayerCharacter } from '@common/classes/Player/player-character';
//import { ColorService } from '@app/services/colors.service';
@Component({
    selector: 'app-event-journal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './event-journal.component.html',
    styleUrl: './event-journal.component.scss',
})
export class EventJournalComponent implements AfterViewChecked, OnInit {
    @ViewChild('journalEvents') eventsContainer: ElementRef;

    events: { event: RoomEvent; associatedPlayers: PlayerCharacter[] }[] = this.journalService.roomEvents;
    filteredEvents: { event: RoomEvent; associatedPlayers: PlayerCharacter[] }[] = this.journalService.getFilteredEvents();
    shouldScroll: boolean = false;
    showMyEvents: boolean = false;

    constructor(
        private journalService: EventJournalService,
       // private colorService: ColorService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.journalService.messageReceived$.subscribe(() => {
            this.shouldScroll = true;
            this.cdr.detectChanges();
        });
    }

    ngAfterViewChecked() {
        this.filteredEvents = this.journalService.getFilteredEvents();
        if (this.shouldScroll) {
            setTimeout(() => {
                this.scrollToBottom();
                this.shouldScroll = false;
            }, 1);
        }
    }

    // getPlayerClass(socketId: string): string {
    //     return this.colorService.colors[this.colorService.colorIndex]; // Use ColorService to get the color based on socket ID
    // }

    private scrollToBottom(): void {
        this.eventsContainer.nativeElement.scrollTop = this.eventsContainer.nativeElement.scrollHeight;
    }
}
