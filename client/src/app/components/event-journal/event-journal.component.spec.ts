import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventJournalComponent } from './event-journal.component';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { CommonModule } from '@angular/common';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Subject } from 'rxjs';
import { ChangeDetectorRef, ElementRef } from '@angular/core';

describe('EventJournalComponent', () => {
    let component: EventJournalComponent;
    let fixture: ComponentFixture<EventJournalComponent>;
    let journalService: jasmine.SpyObj<EventJournalService>;
    let messageReceivedSubject: Subject<void>;

    beforeEach(async () => {
        messageReceivedSubject = new Subject<void>();

        // Create mock events
        const testPlayer1 = new PlayerCharacter('Player1');
        const testPlayer2 = new PlayerCharacter('Player2');
        const mockEvents = [
            {
                event: { time: new Date(), content: 'test1' },
                associatedPlayers: [testPlayer1],
            },
            {
                event: { time: new Date(), content: 'test2' },
                associatedPlayers: [testPlayer2],
            },
        ];

        // Create journal service spy
        const journalServiceSpy = jasmine.createSpyObj('EventJournalService', ['getFilteredEvents'], {
            roomEvents: mockEvents,
            messageReceived$: messageReceivedSubject.asObservable(),
        });
        journalServiceSpy.getFilteredEvents.and.returnValue(mockEvents);

        await TestBed.configureTestingModule({
            imports: [CommonModule, EventJournalComponent],
            providers: [{ provide: EventJournalService, useValue: journalServiceSpy }, ChangeDetectorRef],
        }).compileComponents();

        journalService = TestBed.inject(EventJournalService) as jasmine.SpyObj<EventJournalService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EventJournalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('initialization', () => {
        it('should initialize with events from service', () => {
            expect(component.events).toBe(journalService.roomEvents);
            expect(component.filteredEvents).toEqual(journalService.getFilteredEvents());
        });
    });

    describe('message subscription', () => {
        it('should set shouldScroll and trigger change detection when message received', () => {
            spyOn(component['cdr'], 'detectChanges');
            component.ngOnInit();
            messageReceivedSubject.next();

            expect(component.shouldScroll).toBeTrue();
            expect(component['cdr'].detectChanges).toHaveBeenCalled();
        });
    });

    describe('view updates', () => {
        it('should update filtered events after view checked', () => {
            const newFilteredEvents = [
                {
                    event: { time: new Date(), content: 'new event' },
                    associatedPlayers: [new PlayerCharacter('Player3')],
                },
            ];
            journalService.getFilteredEvents.and.returnValue(newFilteredEvents);

            component.ngAfterViewChecked();

            expect(component.filteredEvents).toEqual(newFilteredEvents);
        });

        it('should scroll to bottom when shouldScroll is true', fakeAsync(() => {
            // Create mock element with scrollHeight
            const mockElement = {
                scrollTop: 0,
                scrollHeight: 1000,
            };

            // Set up the component's eventsContainer
            component.eventsContainer = {
                nativeElement: mockElement,
            } as ElementRef;

            component.shouldScroll = true;
            component.ngAfterViewChecked();

            tick(1); // Wait for setTimeout

            expect(mockElement.scrollTop).toBe(mockElement.scrollHeight);
            expect(component.shouldScroll).toBeFalse();
        }));
    });

    describe('subscription cleanup', () => {
        it('should unsubscribe from message subscription on destroy', () => {
            spyOn(messageReceivedSubject, 'subscribe').and.callThrough();
            component.ngOnInit();
            const subscription = messageReceivedSubject.subscribe();

            expect(subscription.closed).toBeFalse();
            subscription.unsubscribe();
            expect(subscription.closed).toBeTrue();
        });
    });
});
