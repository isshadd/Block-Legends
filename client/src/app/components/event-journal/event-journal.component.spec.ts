import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EventJournalComponent } from './event-journal.component';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { ElementRef } from '@angular/core';

describe('EventJournalComponent', () => {
  let component: EventJournalComponent;
  let fixture: ComponentFixture<EventJournalComponent>;
  let journalService: jasmine.SpyObj<EventJournalService>;
  let messageReceivedSubject: Subject<void>;
  let changeDetectorRef: ChangeDetectorRef;

  beforeEach(async () => {
    messageReceivedSubject = new Subject<void>();
    
    // Create spy object for EventJournalService
    const journalServiceSpy = jasmine.createSpyObj('EventJournalService', 
      ['initialize'],
      {
        roomEvents: ['event1', 'event2'],
        playersInvolved: [['player1'], ['player1', 'player2']],
        messageReceived$: messageReceivedSubject.asObservable()
      }
    );

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [],
      providers: [
        { provide: EventJournalService, useValue: journalServiceSpy },
        ChangeDetectorRef
      ]
    }).compileComponents();

    journalService = TestBed.inject(EventJournalService) as jasmine.SpyObj<EventJournalService>;
    changeDetectorRef = TestBed.inject(ChangeDetectorRef);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with events and players from service', () => {
    expect(component.events).toEqual(['event1', 'event2']);
    expect(component.players).toEqual([['player1'], ['player1', 'player2']]);
  });

  it('should initialize journal service on init', () => {
    component.ngOnInit();
    expect(journalService.initialize).toHaveBeenCalled();
  });

  it('should set shouldScroll to true when message is received', () => {
    spyOn(changeDetectorRef, 'detectChanges');
    component.ngOnInit();
    messageReceivedSubject.next();
    
    expect(component.shouldScroll).toBeTrue();
    expect(changeDetectorRef.detectChanges).toHaveBeenCalled();
  });

  it('should scroll to bottom after view checked when shouldScroll is true', fakeAsync(() => {
    const mockElement = {
      scrollTop: 0,
      scrollHeight: 1000
    };
    
    component.eventsContainer = {
      nativeElement: mockElement
    } as ElementRef;
    
    component.shouldScroll = true;
    component.ngAfterViewChecked();
    
    tick(1);
    
    expect(mockElement.scrollTop).toBe(mockElement.scrollHeight);
    expect(component.shouldScroll).toBeFalse();
  }));

  it('should not scroll when shouldScroll is false', fakeAsync(() => {
    const mockElement = {
      scrollTop: 0,
      scrollHeight: 1000
    };
    
    component.eventsContainer = {
      nativeElement: mockElement
    } as ElementRef;
    
    component.shouldScroll = false;
    component.ngAfterViewChecked();
    
    tick(1);
    
    expect(mockElement.scrollTop).toBe(0);
  }));


  it('should handle scroll error gracefully when nativeElement is undefined', fakeAsync(() => {
    component.eventsContainer = {} as ElementRef;
    component.shouldScroll = true;
    
    expect(() => {
      component.ngAfterViewChecked();
      tick(1);
    }).not.toThrow();
  }));

  it('should maintain subscription to messageReceived$', () => {
    spyOn(messageReceivedSubject, 'subscribe').and.callThrough();
    component.ngOnInit();
    
    expect(messageReceivedSubject.subscribe).toHaveBeenCalled();
  });

  it('should trigger change detection when message is received', () => {
    spyOn(changeDetectorRef, 'detectChanges');
    component.ngOnInit();
    messageReceivedSubject.next();
    
    expect(changeDetectorRef.detectChanges).toHaveBeenCalled();
  });

  // Test timing of scroll behavior
  it('should respect setTimeout timing for scroll', fakeAsync(() => {
    const mockElement = {
      scrollTop: 0,
      scrollHeight: 1000
    };
    
    component.eventsContainer = {
      nativeElement: mockElement
    } as ElementRef;
    
    component.shouldScroll = true;
    component.ngAfterViewChecked();
    
    expect(mockElement.scrollTop).toBe(0); // Should not have scrolled yet
    
    tick(1); // Advance timer by 1ms
    
    expect(mockElement.scrollTop).toBe(mockElement.scrollHeight); // Should have scrolled
    expect(component.shouldScroll).toBeFalse();
  }));

  // Test for multiple message receives
  it('should handle multiple message receives correctly', fakeAsync(() => {
    spyOn(changeDetectorRef, 'detectChanges');
    component.ngOnInit();
    
    messageReceivedSubject.next();
    expect(component.shouldScroll).toBeTrue();
    expect(changeDetectorRef.detectChanges).toHaveBeenCalledTimes(1);
    
    messageReceivedSubject.next();
    expect(component.shouldScroll).toBeTrue();
    expect(changeDetectorRef.detectChanges).toHaveBeenCalledTimes(2);
  }));
});