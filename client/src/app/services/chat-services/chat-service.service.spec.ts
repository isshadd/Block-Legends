import { TestBed } from '@angular/core/testing';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { SocketStateService } from '@app/services/socket-service/socket-state-service/socket-state.service';
import { WebSocketService } from '@app/services/socket-service/websocket-service/websocket.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Subject } from 'rxjs';

const FIRST_CALLS = 123;
const MAX_LENGHT = 201;

describe('ChatService', () => {
    let service: ChatService;
    let socketStateService: jasmine.SpyObj<SocketStateService>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
    let hasActiveSocketSubject: Subject<boolean>;

    beforeEach(async () => {
        hasActiveSocketSubject = new Subject<boolean>();
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['sendMsgToRoom']);
        socketStateService = jasmine.createSpyObj('SocketStateService', ['getActiveSocket'], {
            hasActiveSocket$: hasActiveSocketSubject.asObservable(),
        });
        socketStateService.getActiveSocket.and.returnValue(mockWebSocketService);

        await TestBed.configureTestingModule({
            providers: [ChatService, { provide: SocketStateService, useValue: socketStateService }],
        }).compileComponents();

        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initialize', () => {
        it('should set socket when initialized with active socket', () => {
            service.initialize();
            expect(service.socket).toBe(mockWebSocketService);
            expect(socketStateService.getActiveSocket).toHaveBeenCalled();
        });

        it('should update socket when socket state changes to active', () => {
            service.initialize();
            hasActiveSocketSubject.next(true);
            expect(service.socket).toBe(mockWebSocketService);
        });

        it('should set socket to null when socket state changes to inactive', () => {
            service.initialize();
            hasActiveSocketSubject.next(false);
            expect(service.socket).toBeNull();
        });
    });

    describe('setCharacter', () => {
        it('should set the player character', () => {
            const testCharacter = new PlayerCharacter('TestPlayer');
            service.setCharacter(testCharacter);
            expect(service.player).toBe(testCharacter);
        });
    });

    describe('setAccessCode', () => {
        it('should set access code and room ID when code is provided', () => {
            const testCode = 12345;
            service.setAccessCode(testCode);
            expect(service.accessCode).toBe(testCode);
            expect(service.roomID).toBe(testCode.toString());
        });

        it('should reset access code and room ID when code is undefined', () => {
            service.setAccessCode(undefined);
            expect(service.accessCode).toBe(0);
            expect(service.roomID).toBe('');
        });
    });

    describe('clearMessages', () => {
        it('should clear all messages from roomMessages array', () => {
            service.roomMessages = [{ room: '123', time: new Date(), sender: 'Test', content: 'test', senderId: '1' }];
            service.clearMessages();
            expect(service.roomMessages.length).toBe(0);
        });
    });

    describe('broadcastMessageToAll', () => {
        beforeEach(() => {
            service.initialize();
            service.setAccessCode(FIRST_CALLS);
            const testCharacter = new PlayerCharacter('TestPlayer');
            service.setCharacter(testCharacter);
            service.serverClock = new Date();
        });

        it('should send message to room when socket exists and message is not empty', () => {
            const testMessage = 'Test message';
            service.broadcastMessageToAll(testMessage);

            expect(mockWebSocketService.sendMsgToRoom).toHaveBeenCalledWith({
                room: service.roomID,
                time: service.serverClock,
                sender: service.player.name,
                content: testMessage,
            });
        });

        it('should not send message when socket is null', () => {
            service.socket = null;
            const testMessage = 'Test message';
            service.broadcastMessageToAll(testMessage);
            expect(mockWebSocketService.sendMsgToRoom).not.toHaveBeenCalled();
        });

        it('should not send message when message string is empty', () => {
            const testMessage = '  ';
            service.broadcastMessageToAll(testMessage);
            expect(mockWebSocketService.sendMsgToRoom).not.toHaveBeenCalled();
        });

        it('should show alert and not send message when message exceeds maximum length', () => {
            spyOn(window, 'alert');
            const longMessage = 'a'.repeat(MAX_LENGHT);

            service.broadcastMessageToAll(longMessage);

            expect(window.alert).toHaveBeenCalledWith('Message cannot exceed 200 characters.');
            expect(mockWebSocketService.sendMsgToRoom).not.toHaveBeenCalled();
        });
    });

    describe('messageReceived$', () => {
        it('should emit when messageReceivedSubject emits', (done) => {
            service.messageReceived$.subscribe(() => {
                expect(true).toBeTruthy();
                done();
            });

            service.messageReceivedSubject.next();
        });
    });
});
