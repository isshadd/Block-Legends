import { TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { ChatService } from '@app/services/chat-service.service';
import { of } from 'rxjs';
import { SocketStateService } from './SocketService/socket-state.service';
import { WebSocketService } from './SocketService/websocket.service';

describe('ChatService', () => {
    let chatService: ChatService;
    let socketStateServiceMock: jasmine.SpyObj<SocketStateService>;
    let webSocketServiceMock: jasmine.SpyObj<WebSocketService>;

    beforeEach(() => {
        // Create mock instances
        socketStateServiceMock = jasmine.createSpyObj('SocketStateService', ['getActiveSocket']);
        webSocketServiceMock = jasmine.createSpyObj('WebSocketService', ['send', 'players$']);

        // Setup the mock for players$ observable
        socketStateServiceMock.getActiveSocket.and.returnValue(webSocketServiceMock);
        socketStateServiceMock.hasActiveSocket$ = of(true);

        // Mock players$ to return a behavior subject
        const playersMock = [{ name: 'Player1' } as PlayerCharacter];
        webSocketServiceMock.players$ = of(playersMock); // Ensuring it's observable

        TestBed.configureTestingModule({
            providers: [ChatService, { provide: SocketStateService, useValue: socketStateServiceMock }],
        });

        chatService = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(chatService).toBeTruthy();
    });

    it('should initialize socket and player name', () => {
        chatService.initialize();

        expect(chatService.socket).toEqual(webSocketServiceMock);
        expect(chatService.playerName).toEqual('Player1');
    });

    it('should not broadcast messages longer than 200 characters', () => {
        spyOn(window, 'alert');

        chatService.initialize();
        chatService.broadcastMessageToAll('A'.repeat(201)); // Message longer than 200 characters

        expect(window.alert).toHaveBeenCalledWith('Message cannot exceed 200 characters.');
        expect(webSocketServiceMock.send).not.toHaveBeenCalled();
    });

    it('should broadcast message when roomMessage is valid', () => {
        chatService.initialize();
        chatService.playerName = 'Player1';
        chatService.serverClock = new Date(); // Assigning a mock date

        const validMessage = 'Hello, world!';
        chatService.broadcastMessageToAll(validMessage);

        expect(webSocketServiceMock.send).toHaveBeenCalledWith(
            'broadcastAll',
            jasmine.objectContaining({
                time: chatService.serverClock,
                sender: chatService.playerName,
                content: validMessage,
            }),
        );
    });
});
