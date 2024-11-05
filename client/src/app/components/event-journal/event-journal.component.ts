import { Component, ViewChild, ElementRef } from '@angular/core';
import { OnInit, AfterViewChecked } from '@angular/core';
import { EventJournalService } from '@app/services/event-journal.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-event-journal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-journal.component.html',
  styleUrl: './event-journal.component.scss'
})
export class EventJournalComponent implements AfterViewChecked, OnInit {
  events = this.journalService.roomEvents;
  players = this.journalService.players;
  shouldScroll: boolean = false; 
  @ViewChild('journalEvents') eventsContainer: ElementRef;

  constructor(
    private journalService: EventJournalService, 
  ) {}

  ngOnInit() {
    this.journalService.initialize();
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      setTimeout(() => {
        this.scrollToBottom();
        this.shouldScroll = false;
      }, 1);
    }
  }

  // trackByIndex(index: number): number {
  //   return index;
  // }

  private scrollToBottom(): void {
    try {
      this.eventsContainer.nativeElement.scrollTop = 
        this.eventsContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
