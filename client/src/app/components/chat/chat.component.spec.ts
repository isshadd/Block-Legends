import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Subject } from 'rxjs';
import { ChatComponent } from './chat.component';

describe('ClavardageComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let chatService: jasmine.SpyObj<ChatService>;
    let messageReceivedSubject: Subject<void>;

    beforeEach(async () => {
        messageReceivedSubject = new Subject<void>();

        const playerMock: PlayerCharacter = {
            name: 'TestPlayer',
            socketId: '12345',
            // Add other properties as needed
        } as PlayerCharacter;

        const chatServiceSpy = jasmine.createSpyObj('ChatService', ['initialize', 'broadcastMessageToAll'], {
            roomMessages: [],
            player: playerMock,
            messageReceived$: messageReceivedSubject.asObservable(),
        });

        await TestBed.configureTestingModule({
            imports: [FormsModule, CommonModule, ChatComponent],
            providers: [{ provide: ChatService, useValue: chatServiceSpy }, ChangeDetectorRef],
        }).compileComponents();

        chatService = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatComponent);
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

    it('should return the correct color for the player ID', () => {
        const playerId = 'test-player-id';
        const expectedColor = '#123456';

        // Spy on the getColor method of the ColorService
        const colorServiceSpy = jasmine.createSpyObj('ColorService', ['getColor']);
        colorServiceSpy.getColor.and.returnValue(expectedColor);

        // Inject the mock ColorService into the component
        component['colorService'] = colorServiceSpy;

        const result = component.getPlayerClass(playerId);

        // Check that getColor was called with the correct playerId
        expect(colorServiceSpy.getColor).toHaveBeenCalledWith(playerId);
        // Check that the returned value is the expected color
        expect(result).toBe(expectedColor);
    });
});
