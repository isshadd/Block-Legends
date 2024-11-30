import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ClavardageComponent } from './clavardage.component';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { ChangeDetectorRef, ElementRef } from '@angular/core';

describe('ClavardageComponent', () => {
    let component: ClavardageComponent;
    let fixture: ComponentFixture<ClavardageComponent>;
    let chatService: jasmine.SpyObj<ChatService>;
    let messageReceivedSubject: Subject<void>;

    beforeEach(async () => {
        messageReceivedSubject = new Subject<void>();

        const chatServiceSpy = jasmine.createSpyObj('ChatService', ['initialize', 'broadcastMessageToAll'], {
            roomMessages: [],
            playerName: 'TestPlayer',
            messageReceived$: messageReceivedSubject.asObservable(),
        });

        await TestBed.configureTestingModule({
            imports: [FormsModule, CommonModule],
            declarations: [],
            providers: [{ provide: ChatService, useValue: chatServiceSpy }, ChangeDetectorRef],
        }).compileComponents();

        chatService = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ClavardageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should send message and clear input', () => {
        component.messageToSend = 'Test message';
        component.sendMessage();

        expect(chatService.broadcastMessageToAll).toHaveBeenCalledWith('Test message');
        expect(component.messageToSend).toBe('');
        expect(component.shouldScroll).toBeTrue();
    });

    it('should set shouldScroll to true when message is received', () => {
        component.ngOnInit();
        messageReceivedSubject.next();

        expect(component.shouldScroll).toBeTrue();
    });

    it('should track by index correctly', () => {
        const index = 5;
        expect(component.trackByIndex(index)).toBe(index);
    });

    it('should scroll to bottom after view checked when shouldScroll is true', fakeAsync(() => {
        // Create a mock element with scrollHeight
        const mockElement = {
            scrollTop: 0,
            scrollHeight: 1000,
        };

        // Set up the component's messagesContainer
        component.messagesContainer = {
            nativeElement: mockElement,
        } as ElementRef<unknown>;

        component.shouldScroll = true;
        component.ngAfterViewChecked();

        tick(1); // Wait for setTimeout

        expect(mockElement.scrollTop).toBe(mockElement.scrollHeight);
        expect(component.shouldScroll).toBeFalse();
    }));

    // Test for message subscription cleanup
    it('should unsubscribe on destroy', () => {
        spyOn(messageReceivedSubject, 'subscribe').and.callThrough();
        component.ngOnInit();

        const subscription = messageReceivedSubject.subscribe();

        // Verify subscription is active
        expect(subscription.closed).toBeFalse();

        // Clean up
        subscription.unsubscribe();
    });
});
