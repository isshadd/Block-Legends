/* eslint-disable no-restricted-imports */
import { TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Subject } from 'rxjs';
import { SocketStateService } from '../SocketService/socket-state.service';
import { WebSocketService } from '../SocketService/websocket.service';
import { EventJournalService } from './event-journal.service';

const NUMBER_OF_CALLS = 3;

describe('EventJournalService', () => {
    let service: EventJournalService;
    let socketStateService: jasmine.SpyObj<SocketStateService>;
    let mockWebSocket: jasmine.SpyObj<WebSocketService>;
    let hasActiveSocketSubject: Subject<boolean>;

    beforeEach(() => {
        hasActiveSocketSubject = new Subject<boolean>();
        mockWebSocket = jasmine.createSpyObj('WebSocketService', ['registerPlayer', 'sendEventToRoom']);

        socketStateService = jasmine.createSpyObj('SocketStateService', ['getActiveSocket'], {
            hasActiveSocket$: hasActiveSocketSubject.asObservable(),
        });
        socketStateService.getActiveSocket.and.returnValue(mockWebSocket);

        TestBed.configureTestingModule({
            providers: [EventJournalService, { provide: SocketStateService, useValue: socketStateService }],
        });

        service = TestBed.inject(EventJournalService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initialize', () => {
        beforeEach(() => {
            service.playerName = 'TestPlayer';
        });

        it('should get active socket on initialization', () => {
            service.initialize();
            expect(socketStateService.getActiveSocket).toHaveBeenCalled();
            expect(service.socket).toBe(mockWebSocket);
        });

        it('should handle socket activation', () => {
            service.initialize();
            hasActiveSocketSubject.next(true);

            expect(socketStateService.getActiveSocket).toHaveBeenCalled();
            expect(mockWebSocket.registerPlayer).toHaveBeenCalledWith('TestPlayer');
        });

        it('should handle socket deactivation', () => {
            service.initialize();
            hasActiveSocketSubject.next(false);

            expect(service.socket).toBeNull();
        });

        it('should not register player if socket is null', () => {
            socketStateService.getActiveSocket.and.returnValue(null);
            service.initialize();
            hasActiveSocketSubject.next(true);

            expect(mockWebSocket.registerPlayer).not.toHaveBeenCalled();
        });
    });

    describe('setCharacter', () => {
        it('should set player name from character', () => {
            const mockCharacter = { name: 'TestCharacter' } as PlayerCharacter;
            service.setCharacter(mockCharacter);

            expect(service.playerName).toBe('TestCharacter');
        });
    });

    describe('setAccessCode', () => {
        it('should set access code and room ID', () => {
            const code = 12345;
            service.setAccessCode(code);

            expect(service.accessCode).toBe(code);
            expect(service.roomID).toBe(code.toString());
        });

        it('should handle zero accessCode', () => {
            service.setAccessCode(0);

            expect(service.accessCode).toBe(0);
            expect(service.roomID).toBe('');
        });
    });

    describe('broadcastEvent', () => {
        beforeEach(() => {
            service.initialize();
        });

        it('should send event to room when socket exists and event is not empty', () => {
            const event = 'test event';
            const players = ['player1', 'player2'];

            service.broadcastEvent(event, players);

            expect(mockWebSocket.sendEventToRoom).toHaveBeenCalledWith(event, players);
        });

        it('should not send event when socket is null', () => {
            service.socket = null;
            service.broadcastEvent('test event', ['player1']);

            expect(mockWebSocket.sendEventToRoom).not.toHaveBeenCalled();
        });

        it('should not send event when event is empty or whitespace', () => {
            service.broadcastEvent('', ['player1']);
            expect(mockWebSocket.sendEventToRoom).not.toHaveBeenCalled();

            service.broadcastEvent('   ', ['player1']);
            expect(mockWebSocket.sendEventToRoom).not.toHaveBeenCalled();
        });
    });

    describe('addEvent', () => {
        it('should add event to roomEvents array', () => {
            const event = { event: 'test event', associatedPlayers: ['player1'] };
            const initialLength = service.roomEvents.length;

            service.addEvent(event);

            expect(service.roomEvents.length).toBe(initialLength + 1);
            expect(service.roomEvents[service.roomEvents.length - 1]).toEqual(event);
        });
    });

    describe('getFilteredEvents', () => {
        beforeEach(() => {
            service.playerName = 'player1';
            service.roomEvents = [
                { event: 'event1', associatedPlayers: ['player1'] },
                { event: 'event2', associatedPlayers: ['player2'] },
                { event: 'event3', associatedPlayers: ['player1', 'player2'] },
            ];
        });

        it('should return events associated with current player', () => {
            const filteredEvents = service.getFilteredEvents();

            expect(filteredEvents.length).toBe(2);
            expect(filteredEvents).toContain(service.roomEvents[0]);
            expect(filteredEvents).toContain(service.roomEvents[2]);
            expect(filteredEvents).not.toContain(service.roomEvents[1]);
        });

        it('should handle empty roomEvents array', () => {
            service.roomEvents = [];
            const filteredEvents = service.getFilteredEvents();

            expect(filteredEvents).toEqual([]);
        });

        it('should handle no events for current player', () => {
            service.playerName = 'player3';
            const filteredEvents = service.getFilteredEvents();

            expect(filteredEvents).toEqual([]);
        });
    });

    describe('messageReceived$ Observable', () => {
        it('should emit when messageReceivedSubject emits', (done) => {
            service.messageReceived$.subscribe(() => {
                expect(true).toBeTruthy(); // Verify emission occurred
                done();
            });

            service.messageReceivedSubject.next();
        });
    });

    // Edge cases and error handling
    describe('edge cases', () => {
        it('should handle multiple socket state changes', () => {
            service.initialize();
            hasActiveSocketSubject.next(true);
            hasActiveSocketSubject.next(false);
            hasActiveSocketSubject.next(true);

            expect(socketStateService.getActiveSocket).toHaveBeenCalledTimes(NUMBER_OF_CALLS);
        });

        it('should handle events with empty players array', () => {
            const event = { event: 'test event', associatedPlayers: [] };
            service.addEvent(event);
            const filteredEvents = service.getFilteredEvents();

            expect(filteredEvents).toEqual([]);
        });
    });
});
