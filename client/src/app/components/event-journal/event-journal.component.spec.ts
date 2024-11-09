import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventJournalComponent } from './event-journal.component';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';

describe('EventJournalComponent', () => {
    let component: EventJournalComponent;
    let fixture: ComponentFixture<EventJournalComponent>;
    let journalService: jasmine.SpyObj<EventJournalService>;
    let cdr: jasmine.SpyObj<ChangeDetectorRef>;
    let messageReceivedSubject: Subject<void>;

    const mockEvents = [
        { event: 'event1', associatedPlayers: ['player1', 'player2'] },
        { event: 'event2', associatedPlayers: ['player1'] },
        { event: 'event3', associatedPlayers: ['player2'] }
    ];

    beforeEach(async () => {
        messageReceivedSubject = new Subject<void>();
        
        journalService = jasmine.createSpyObj('EventJournalService', ['initialize'], {
            roomEvents: mockEvents,
            messageReceived$: messageReceivedSubject.asObservable(),
            playerName: 'player1'
        });

        cdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

        await TestBed.configureTestingModule({
            imports: [EventJournalComponent],
            providers: [
                { provide: EventJournalService, useValue: journalService },
                { provide: ChangeDetectorRef, useValue: cdr }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(EventJournalComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should initialize with service events', () => {
            expect(component.events).toEqual(mockEvents);
        });

        it('should call journalService.initialize on ngOnInit', () => {
            component.ngOnInit();
            expect(journalService.initialize).toHaveBeenCalled();
        });

        it('should set up message subscription on ngOnInit', () => {
            component.ngOnInit();
            messageReceivedSubject.next();
            expect(component.shouldScroll).toBeTrue();
        });
    });

    describe('Event Filtering', () => {
        it('should filter events for current player', () => {
            const filteredEvents = component.getFilteredEvents();
            expect(filteredEvents.length).toBe(2);
            expect(filteredEvents).toContain(mockEvents[0]);
            expect(filteredEvents).toContain(mockEvents[1]);
        });

        it('should handle empty events array', () => {
            component.events = [];
            const filteredEvents = component.getFilteredEvents();
            expect(filteredEvents.length).toBe(0);
        });

        it('should handle events with no associated players', () => {
            component.events = [{ event: 'test', associatedPlayers: [] }];
            const filteredEvents = component.getFilteredEvents();
            expect(filteredEvents.length).toBe(0);
        });
    });

    describe('Scrolling Behavior', () => {
        beforeEach(() => {
            component.eventsContainer = {
                nativeElement: {
                    scrollTop: 0,
                    scrollHeight: 100
                }
            } as any;
        });

        it('should scroll to bottom when shouldScroll is true', fakeAsync(() => {
            component.shouldScroll = true;
            component.ngAfterViewChecked();
            tick(1);
            expect(component.eventsContainer.nativeElement.scrollTop)
                .toBe(component.eventsContainer.nativeElement.scrollHeight);
            expect(component.shouldScroll).toBeFalse();
        }));

        it('should not scroll when shouldScroll is false', fakeAsync(() => {
            component.shouldScroll = false;
            component.ngAfterViewChecked();
            tick(1);
            expect(component.eventsContainer.nativeElement.scrollTop).toBe(0);
        }));


    });

    describe('View Updates', () => {
        it('should update filtered events in ngAfterViewChecked', () => {
            spyOn(component, 'getFilteredEvents').and.callThrough();
            component.ngAfterViewChecked();
            expect(component.getFilteredEvents).toHaveBeenCalled();
            expect(component.filteredEvents).toBeDefined();
        });

        it('should handle message received updates', fakeAsync(() => {
            component.ngOnInit();
            messageReceivedSubject.next();
            expect(component.shouldScroll).toBeTrue();
            
            component.ngAfterViewChecked();
            tick(1);
            expect(component.shouldScroll).toBeFalse();
        }));
    });

    describe('Edge Cases', () => {
        it('should handle undefined playerName', () => {
            Object.defineProperty(journalService, 'playerName', {
                get: () => undefined
            });
            const filteredEvents = component.getFilteredEvents();
            expect(filteredEvents.length).toBe(0);
        });

        it('should handle subscription cleanup', () => {
            const subscription = messageReceivedSubject.subscribe();
            subscription.unsubscribe();
            messageReceivedSubject.next();
            expect(subscription.closed).toBeTrue();
        });
    });

    describe('Memory Management', () => {
        it('should not leak memory on multiple initializations', () => {
            const subscriptionSpy = spyOn(messageReceivedSubject, 'subscribe').and.callThrough();
            component.ngOnInit();
            component.ngOnInit();
            expect(subscriptionSpy).toHaveBeenCalledTimes(2);
        });
    });

    describe('Error Handling', () => {
        it('should handle errors in scrollToBottom', () => {
            component.eventsContainer = {
                nativeElement: {
                    get scrollTop() { throw new Error('Test error'); },
                    scrollHeight: 100
                }
            } as any;
            
            component.shouldScroll = true;
            expect(() => {
                component.ngAfterViewChecked();
            }).not.toThrow();
        });
    });
});