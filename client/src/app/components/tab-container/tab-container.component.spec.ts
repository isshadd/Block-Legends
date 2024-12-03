import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabContainerComponent } from './tab-container.component';
import { ClavardageComponent } from '@app/components/clavardage/clavardage.component';
import { EventJournalComponent } from '@app/components/event-journal/event-journal.component';
import { CommonModule } from '@angular/common';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { BehaviorSubject } from 'rxjs';

describe('TabContainerComponent', () => {
    let component: TabContainerComponent;
    let fixture: ComponentFixture<TabContainerComponent>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let eventJournalServiceSpy: jasmine.SpyObj<EventJournalService>;

    const mockCharacter: Partial<PlayerCharacter> = {
        name: 'TestPlayer',
        socketId: 'test-socket-id',
    };

    beforeEach(async () => {
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['setCharacter', 'setAccessCode'], {
            roomMessages: [],
            player: mockCharacter,
            messageReceived$: new BehaviorSubject<void>(undefined),
        });

        eventJournalServiceSpy = jasmine.createSpyObj('EventJournalService', ['setCharacter', 'setAccessCode', 'broadcastEvent'], {
            roomEvents: [],
            messageReceived$: new BehaviorSubject<void>(undefined),
        });

        await TestBed.configureTestingModule({
            imports: [TabContainerComponent, ClavardageComponent, CommonModule, EventJournalComponent],
            providers: [
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: EventJournalService, useValue: eventJournalServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TabContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with chat as the active tab', () => {
        expect(component.activeTab).toBe('chat');
    });

    it('should maintain active tab state when changed', () => {
        component.activeTab = 'journal';
        expect(component.activeTab).toBe('journal');

        component.activeTab = 'chat';
        expect(component.activeTab).toBe('chat');
    });
});
