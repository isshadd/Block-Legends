import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventJournalComponent } from './event-journal.component';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';

describe('EventJournalComponent', () => {
    let component: EventJournalComponent;
    let fixture: ComponentFixture<EventJournalComponent>;
    let journalService: jasmine.SpyObj<EventJournalService>;
    let changeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
    let messageReceived$: Subject<void>;

    const mockEvents = [
        { 
            event: 'Event 1', 
            associatedPlayers: ['player1', 'player2'] 
        },
        { 
            event: 'Event 2', 
            associatedPlayers: ['player2', 'player3'] 
        }
    ];

    beforeEach(async () => {
        messageReceived$ = new Subject<void>();
        
        journalService = jasmine.createSpyObj('EventJournalService', 
            ['initialize', 'getFilteredEvents'], {
                messageReceived$: messageReceived$,
                roomEvents: mockEvents,
                playerName: 'player1'
            }
        );

        changeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

        await TestBed.configureTestingModule({
            imports: [EventJournalComponent],
            providers: [
                { provide: EventJournalService, useValue: journalService },
                { provide: ChangeDetectorRef, useValue: changeDetectorRef }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(EventJournalComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should initialize with default values', () => {
            expect(component.events).toEqual(mockEvents);
            expect(component.shouldScroll).toBeFalse();
            expect(component.showMyEvents).toBeFalse();
        });

        it('should initialize filtered events', () => {
            spyOn(component, 'getFilteredEvents').and.callThrough();
            fixture.detectChanges();
            expect(component.getFilteredEvents).toHaveBeenCalled();
            expect(component.filteredEvents).toBeDefined();
        });
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should initialize journal service', () => {
            expect(journalService.initialize).toHaveBeenCalled();
        });

        it('should subscribe to messageReceived$', fakeAsync(() => {
            messageReceived$.next();
            tick();

            expect(component.shouldScroll).toBeTrue();
            expect(changeDetectorRef.detectChanges).toHaveBeenCalled();
        }));
    });

    describe('ngAfterViewChecked', () => {
        beforeEach(() => {
            spyOn(component as any, 'scrollToBottom');
            spyOn(component, 'getFilteredEvents').and.callThrough();
        });

        it('should update filtered events', () => {
            component.ngAfterViewChecked();
            expect(component.getFilteredEvents).toHaveBeenCalled();
        });

        it('should scroll to bottom when shouldScroll is true', fakeAsync(() => {
            component.shouldScroll = true;
            component.ngAfterViewChecked();
            
            tick(1);
            
            expect(component['scrollToBottom']).toHaveBeenCalled();
            expect(component.shouldScroll).toBeFalse();
        }));

        it('should not scroll when shouldScroll is false', fakeAsync(() => {
            component.shouldScroll = false;
            component.ngAfterViewChecked();
            
            tick(1);
            
            expect(component['scrollToBottom']).not.toHaveBeenCalled();
            expect(component.shouldScroll).toBeFalse();
        }));
    });

    describe('scrollToBottom', () => {
        it('should set scroll position when eventsContainer exists', () => {
            const mockElement = {
                scrollTop: 0,
                scrollHeight: 100
            };
            component.eventsContainer = { nativeElement: mockElement } as any;

            component['scrollToBottom']();

            expect(mockElement.scrollTop).toBe(mockElement.scrollHeight);
        });

        it('should handle error when eventsContainer is undefined', () => {
            component.eventsContainer = undefined as any;
            
            expect(() => {
                component['scrollToBottom']();
            }).not.toThrow();
        });
    });

    describe('getFilteredEvents', () => {
        it('should filter events for current player', () => {
            const filteredEvents = component.getFilteredEvents();
            
            expect(filteredEvents.length).toBe(1);
            expect(filteredEvents[0]).toEqual(mockEvents[0]);
        });

        it('should return empty array when no events match', () => {
            Object.defineProperty(journalService, 'playerName', {
                get: () => 'player4'
            });

            const filteredEvents = component.getFilteredEvents();
            expect(filteredEvents.length).toBe(0);
        });

        it('should handle empty events array', () => {
            component.events = [];
            const filteredEvents = component.getFilteredEvents();
            expect(filteredEvents.length).toBe(0);
        });
    });

    describe('Template Integration', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should toggle showMyEvents flag', () => {
            const button = fixture.debugElement.nativeElement.querySelector('button');
            expect(component.showMyEvents).toBeFalse();
            
            button.click();
            fixture.detectChanges();
            
            expect(component.showMyEvents).toBeTrue();
        });

        it('should update button text based on showMyEvents', () => {
            const button = fixture.debugElement.nativeElement.querySelector('button');
            
            expect(button.textContent.trim()).toContain('Show My Events');
            
            component.showMyEvents = true;
            fixture.detectChanges();
            
            expect(button.textContent.trim()).toContain('Show All Events');
        });

        it('should display correct events based on showMyEvents', () => {
            // Test for all events
            let eventElements = fixture.debugElement.nativeElement.querySelectorAll('.events li');
            expect(eventElements.length).toBe(mockEvents.length);

            // Test for filtered events
            component.showMyEvents = true;
            fixture.detectChanges();
            
            eventElements = fixture.debugElement.nativeElement.querySelectorAll('.events li');
            expect(eventElements.length).toBe(component.filteredEvents.length);
        });
    });
});