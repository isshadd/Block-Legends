import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { RoomEvent } from '@common/interfaces/RoomEvent';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-event-journal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './event-journal.component.html',
    styleUrl: './event-journal.component.scss',
})
export class EventJournalComponent implements AfterViewChecked, OnInit, OnDestroy {
    @ViewChild('journalEvents') eventsContainer: ElementRef;

    events: { event: RoomEvent; associatedPlayers: PlayerCharacter[] }[] = this.journalService.roomEvents;
    filteredEvents: { event: RoomEvent; associatedPlayers: PlayerCharacter[] }[] = this.journalService.getFilteredEvents();
    shouldScroll: boolean = false;
    showMyEvents: boolean = false;

    private subscriptions: Subscription = new Subscription();

    constructor(
        private journalService: EventJournalService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.subscriptions.add(
            this.journalService.messageReceived$.subscribe(() => {
                this.shouldScroll = true;
                this.cdr.detectChanges();
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
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

    private scrollToBottom(): void {
        this.eventsContainer.nativeElement.scrollTop = this.eventsContainer.nativeElement.scrollHeight;
    }
}
