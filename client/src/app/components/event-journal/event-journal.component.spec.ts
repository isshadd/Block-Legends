/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventJournalComponent } from './event-journal.component';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { ElementRef, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';

describe('EventJournalComponent', () => {
    let component: EventJournalComponent;
    let fixture: ComponentFixture<EventJournalComponent>;
    let journalService: jasmine.SpyObj<EventJournalService>;
    let changeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
    let messageReceivedSubject: Subject<void>;

    beforeEach(async () => {
        messageReceivedSubject = new Subject<void>();

        // Create empty arrays for the service
        const emptyEvents: { event: string; associatedPlayers: string[] }[] = [];

        journalService = jasmine.createSpyObj('EventJournalService', ['getFilteredEvents'], {
            roomEvents: emptyEvents,
            messageReceived$: messageReceivedSubject.asObservable(),
        });
        journalService.getFilteredEvents.and.returnValue(emptyEvents);

        changeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

        await TestBed.configureTestingModule({
            imports: [EventJournalComponent],
            providers: [
                { provide: EventJournalService, useValue: journalService },
                { provide: ChangeDetectorRef, useValue: changeDetectorRef },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EventJournalComponent);
        component = fixture.componentInstance;

        // Mock the ElementRef for the events container
        component.eventsContainer = {
            nativeElement: {
                scrollTop: 0,
                scrollHeight: 100,
            },
        } as ElementRef;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with empty events from service', () => {
        expect(component.events).toEqual([]);
        expect(component.filteredEvents).toEqual([]);
    });

    describe('ngOnInit', () => {
        it('should subscribe to messageReceived$ and trigger scroll', () => {
            messageReceivedSubject.next();

            expect(component.shouldScroll).toBeTrue();
        });
    });

    describe('ngAfterViewChecked', () => {
        it('should update filtered events', () => {
            const newFilteredEvents = [{ event: 'newEvent', associatedPlayers: ['player3'] }];
            journalService.getFilteredEvents.and.returnValue(newFilteredEvents);

            component.ngAfterViewChecked();

            expect(component.filteredEvents).toEqual(newFilteredEvents);
        });

        it('should scroll to bottom when shouldScroll is true', fakeAsync(() => {
            component.shouldScroll = true;
            const scrollSpy = spyOn(component as any, 'scrollToBottom');

            component.ngAfterViewChecked();
            tick(1);

            expect(scrollSpy).toHaveBeenCalled();
            expect(component.shouldScroll).toBeFalse();
        }));

        it('should not scroll when shouldScroll is false', fakeAsync(() => {
            component.shouldScroll = false;
            const scrollSpy = spyOn<any>(component, 'scrollToBottom');

            component.ngAfterViewChecked();
            tick(1);

            expect(scrollSpy).not.toHaveBeenCalled();
        }));
    });

    describe('addEvent', () => {
        it('should add new event to events array', () => {
            expect(component.events.length).toBe(0); // Verify initial empty state

            const newEvent = 'newEvent';
            const associatedPlayers = ['player4'];

            component.addEvent(newEvent, associatedPlayers);

            expect(component.events.length).toBe(1);
            expect(component.events[0]).toEqual({
                event: newEvent,
                associatedPlayers,
            });
        });

        // it('should handle null associated players', () => {
        //     const newEvent = 'testEvent';
        //     const nullPlayers = null as unknown;

        //     component.addEvent(newEvent, nullPlayers);

        //     expect(component.events.length).toBe(1);
        //     expect(component.events[0]).toEqual({
        //         event: newEvent,
        //         associatedPlayers: nullPlayers,
        //     });
        // });
    });

    describe('filtered events update', () => {
        it('should update filtered events when service returns new events', () => {
            const newFilteredEvents = [{ event: 'event1', associatedPlayers: ['player1'] }];
            journalService.getFilteredEvents.and.returnValue(newFilteredEvents);

            component.ngAfterViewChecked();

            expect(component.filteredEvents).toEqual(newFilteredEvents);
        });
    });

    // Test memory management
    describe('component destruction', () => {
        it('should clean up subscriptions on destroy', fakeAsync(() => {
            const tempFixture = TestBed.createComponent(EventJournalComponent);
            const tempComponent = tempFixture.componentInstance;

            // Setup subscription
            tempComponent.ngOnInit();

            // Verify subscription works
            messageReceivedSubject.next();
            expect(tempComponent.shouldScroll).toBeTrue();

            // Destroy component
            tempFixture.destroy();
            tick();

            // Verify no errors on further emissions
            expect(() => messageReceivedSubject.next()).not.toThrow();
        }));
    });
});
