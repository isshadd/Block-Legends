import { Component, ViewChild, ElementRef, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-event-journal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './event-journal.component.html',
    styleUrl: './event-journal.component.scss',
})
export class EventJournalComponent implements AfterViewChecked, OnInit {
    @ViewChild('journalEvents') eventsContainer: ElementRef;

    events: { event: string; associatedPlayers: string[] }[] = this.journalService.roomEvents;
    filteredEvents: { event: string; associatedPlayers: string[] }[] = this.getFilteredEvents();
    shouldScroll: boolean = false;
    showMyEvents: boolean = false;

    constructor(
        private journalService: EventJournalService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.journalService.initialize();
        this.journalService.messageReceived$.subscribe(() => {
            this.shouldScroll = true;
            this.cdr.detectChanges();
        });
    }

    ngAfterViewChecked() {
        this.filteredEvents = this.getFilteredEvents();
        if (this.shouldScroll) {
            setTimeout(() => {
                this.scrollToBottom();
                this.shouldScroll = false;
            }, 1);
        }
    }

    getFilteredEvents(): { event: string; associatedPlayers: string[] }[] {
        return this.events.filter((event) => event.associatedPlayers.includes(this.journalService.playerName));
    }

    private scrollToBottom(): void {
        this.eventsContainer.nativeElement.scrollTop = this.eventsContainer.nativeElement.scrollHeight;
    }
}
