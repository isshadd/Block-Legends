/* eslint-disable no-restricted-imports */
import { TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@common/classes/player-character';
import { Subject } from 'rxjs';
import { SocketStateService } from '../SocketService/socket-state.service';
import { WebSocketService } from '../SocketService/websocket.service';
import { ChatService } from './chat-service.service';

const ACCESS_CODE = 12345;

const stringLength = {
    shortString: 100,
    mediumString: 199,
    maxString: 200,
    tooLongString: 201,
};

describe('ChatService', () => {
    let service: ChatService;
    let socketStateService: jasmine.SpyObj<SocketStateService>;
    let webSocketService: jasmine.SpyObj<WebSocketService>;
    let hasActiveSocketSubject: Subject<boolean>;

    beforeEach(() => {
        hasActiveSocketSubject = new Subject<boolean>();
        webSocketService = jasmine.createSpyObj('WebSocketService', ['sendMsgToRoom']);

        socketStateService = jasmine.createSpyObj('SocketStateService', ['getActiveSocket'], {
            hasActiveSocket$: hasActiveSocketSubject.asObservable(),
        });

        socketStateService.getActiveSocket.and.returnValue(webSocketService);

        TestBed.configureTestingModule({
            providers: [ChatService, { provide: SocketStateService, useValue: socketStateService }],
        });

        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initialize', () => {
        it('should get active socket on initialization', () => {
            service.initialize();
            expect(socketStateService.getActiveSocket).toHaveBeenCalled();
            expect(service.socket).toBeTruthy();
        });

        it('should update socket when hasActiveSocket emits true', () => {
            service.initialize();
            hasActiveSocketSubject.next(true);
            expect(socketStateService.getActiveSocket).toHaveBeenCalledTimes(2);
            expect(service.socket).toBe(webSocketService);
        });

        it('should set socket to null when hasActiveSocket emits false', () => {
            service.initialize();
            hasActiveSocketSubject.next(false);
            expect(service.socket).toBeNull();
        });
    });

    describe('setCharacter', () => {
        it('should set player name from character', () => {
            const mockCharacter = { name: 'TestPlayer' } as PlayerCharacter;
            service.setCharacter(mockCharacter);
            expect(service.playerName).toBe('TestPlayer');
        });
    });

    describe('setAccessCode', () => {
        it('should set access code and room ID', () => {
            service.setAccessCode(ACCESS_CODE);
            expect(service.accessCode).toBe(ACCESS_CODE);
            expect(service.roomID).toBe(`${ACCESS_CODE}`);
        });
    });

    describe('broadcastMessageToAll', () => {
        beforeEach(() => {
            service.initialize();
            service.setAccessCode(ACCESS_CODE);
            service.playerName = 'TestPlayer';
            service.serverClock = new Date();
        });

        it('should send message to room when conditions are met', () => {
            const testMessage = 'Hello World';
            service.broadcastMessageToAll(testMessage);

            expect(webSocketService.sendMsgToRoom).toHaveBeenCalledWith({
                room: `${ACCESS_CODE}`,
                time: service.serverClock,
                sender: 'TestPlayer',
                content: testMessage,
            });
        });

        it('should not send message when socket is null', () => {
            service.socket = null;
            service.broadcastMessageToAll('Test Message');
            expect(webSocketService.sendMsgToRoom).not.toHaveBeenCalled();
        });

        it('should not send empty or whitespace messages', () => {
            service.broadcastMessageToAll('   ');
            expect(webSocketService.sendMsgToRoom).not.toHaveBeenCalled();

            service.broadcastMessageToAll('');
            expect(webSocketService.sendMsgToRoom).not.toHaveBeenCalled();
        });

        it('should not send messages exceeding 200 characters', () => {
            spyOn(window, 'alert');
            const longMessage = 'a'.repeat(stringLength.tooLongString);
            service.broadcastMessageToAll(longMessage);

            expect(window.alert).toHaveBeenCalledWith('Message cannot exceed 200 characters.');
            expect(webSocketService.sendMsgToRoom).not.toHaveBeenCalled();
        });

        it('should send message exactly 200 characters', () => {
            const message200 = 'a'.repeat(stringLength.maxString);
            service.broadcastMessageToAll(message200);

            expect(webSocketService.sendMsgToRoom).toHaveBeenCalled();
        });
    });

    describe('roomMessages', () => {
        it('should initialize with empty array', () => {
            expect(service.roomMessages).toEqual([]);
        });
    });

    describe('messageReceived$', () => {
        it('should properly emit when message is received', (done) => {
            service.messageReceived$.subscribe(() => {
                expect(true).toBeTruthy();
                done();
            });

            service.messageReceivedSubject.next();
        });
    });

    // Test multiple socket state changes
    it('should handle multiple socket state changes', () => {
        service.initialize();

        hasActiveSocketSubject.next(true);
        expect(service.socket).toBeTruthy();

        hasActiveSocketSubject.next(false);
        expect(service.socket).toBeNull();

        hasActiveSocketSubject.next(true);
        expect(service.socket).toBeTruthy();
    });

    // Test message sending with different character lengths
    describe('message length validation', () => {
        beforeEach(() => {
            service.initialize();
            service.setAccessCode(ACCESS_CODE);
            service.playerName = 'TestPlayer';
        });

        it('should send messages of varying valid lengths', () => {
            const testCases = [
                'Hi', // 2 chars
                'Hello World', // 11 chars
                'a'.repeat(stringLength.shortString), // 100 chars
                'a'.repeat(stringLength.mediumString), // 199 chars
                'a'.repeat(stringLength.maxString), // 200 chars
            ];

            testCases.forEach((message) => {
                service.broadcastMessageToAll(message);
                expect(webSocketService.sendMsgToRoom).toHaveBeenCalledWith({
                    room: `${ACCESS_CODE}`,
                    time: service.serverClock,
                    sender: 'TestPlayer',
                    content: message,
                });
            });
        });
    });

    // Test edge cases for room ID
    describe('room ID handling', () => {
        it('should handle different access code formats', () => {
            const testCases = [
                { input: 0, expected: '' },
                { input: 1, expected: '1' },
                { input: 999999, expected: '999999' },
            ];

            testCases.forEach(({ input, expected }) => {
                service.setAccessCode(input);
                expect(service.roomID).toBe(expected);
            });
        });
    });
});
