import { TestBed } from '@angular/core/testing';
import { EventJournalService } from './event-journal.service';
import { SocketStateService } from '../SocketService/socket-state.service';
import { WebSocketService } from '../SocketService/websocket.service';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { Subject } from 'rxjs';

describe('EventJournalService', () => {
    let service: EventJournalService;
    let socketStateService: jasmine.SpyObj<SocketStateService>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
    let hasActiveSocket$: Subject<boolean>;

    beforeEach(() => {
        // Create mock WebSocketService
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['sendEventToRoom']);

        // Create Subject for hasActiveSocket$
        hasActiveSocket$ = new Subject<boolean>();

        // Create mock SocketStateService
        socketStateService = jasmine.createSpyObj('SocketStateService', ['getActiveSocket'], {
            hasActiveSocket$,
        });

        // Configure getActiveSocket spy
        socketStateService.getActiveSocket.and.returnValue(mockWebSocketService);

        TestBed.configureTestingModule({
            providers: [EventJournalService, { provide: SocketStateService, useValue: socketStateService }],
        });

        service = TestBed.inject(EventJournalService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Initial State', () => {
        it('should initialize with default values', () => {
            expect(service.socket).toBeNull();
            expect(service.roomEvents).toEqual([]);
            expect(service.playerName).toBe('');
            expect(service.messageReceivedSubject).toBeTruthy();
            expect(service.messageReceived$).toBeTruthy();
        });
    });

    describe('initialize', () => {
        it('should set socket initially', () => {
            service.initialize();
            expect(service.socket).toBe(mockWebSocketService);
            expect(socketStateService.getActiveSocket).toHaveBeenCalled();
        });

        it('should update socket when hasActiveSocket$ emits true', () => {
            service.initialize();
            socketStateService.getActiveSocket.calls.reset();

            hasActiveSocket$.next(true);

            expect(socketStateService.getActiveSocket).toHaveBeenCalled();
            expect(service.socket).toBe(mockWebSocketService);
        });

        it('should set socket to null when hasActiveSocket$ emits false', () => {
            service.initialize();
            hasActiveSocket$.next(false);

            expect(service.socket).toBeNull();
        });
    });

    describe('setCharacter', () => {
        it('should set playerName from character', () => {
            const mockCharacter: PlayerCharacter = {
                name: 'TestPlayer',
            } as PlayerCharacter;

            service.setCharacter(mockCharacter);

            expect(service.playerName).toBe('TestPlayer');
        });

        it('should handle character with empty name', () => {
            const mockCharacter: PlayerCharacter = {
                name: '',
            } as PlayerCharacter;

            service.setCharacter(mockCharacter);

            expect(service.playerName).toBe('');
        });
    });

    describe('setAccessCode', () => {
        it('should set accessCode and roomID', () => {
            const code = 12345;
            service.setAccessCode(code);

            expect(service.accessCode).toBe(code);
            expect(service.roomID).toBe(code.toString());
        });

        it('should handle zero accessCode', () => {
            service.setAccessCode(0);

            expect(service.accessCode).toBe(0);
            expect(service.roomID).toBe('0');
        });
    });

    describe('broadcastEvent', () => {
        beforeEach(() => {
            service.initialize();
        });

        it('should send event when socket exists and event is not empty', () => {
            const event = 'test event';
            const players = ['player1', 'player2'];

            service.broadcastEvent(event, players);

            expect(mockWebSocketService.sendEventToRoom).toHaveBeenCalledWith(event, players);
        });

        it('should not send event when socket is null', () => {
            service.socket = null;
            const event = 'test event';
            const players = ['player1', 'player2'];

            service.broadcastEvent(event, players);

            expect(mockWebSocketService.sendEventToRoom).not.toHaveBeenCalled();
        });

        it('should not send event when event is empty string', () => {
            const event = '   ';
            const players = ['player1', 'player2'];

            service.broadcastEvent(event, players);

            expect(mockWebSocketService.sendEventToRoom).not.toHaveBeenCalled();
        });

        it('should not send event when event is empty and socket is null', () => {
            service.socket = null;
            const event = '';
            const players = ['player1', 'player2'];

            service.broadcastEvent(event, players);

            expect(mockWebSocketService.sendEventToRoom).not.toHaveBeenCalled();
        });
    });

    describe('addEvent', () => {
        it('should add event to roomEvents array', () => {
            const eventData = {
                event: 'test event',
                associatedPlayers: ['player1', 'player2'],
            };

            service.addEvent(eventData);

            expect(service.roomEvents).toContain(eventData);
            expect(service.roomEvents.length).toBe(1);
        });

        it('should maintain order of events', () => {
            const event1 = {
                event: 'first event',
                associatedPlayers: ['player1'],
            };
            const event2 = {
                event: 'second event',
                associatedPlayers: ['player2'],
            };

            service.addEvent(event1);
            service.addEvent(event2);

            expect(service.roomEvents).toEqual([event1, event2]);
        });

        it('should handle event with empty associatedPlayers', () => {
            const eventData = {
                event: 'test event',
                associatedPlayers: [],
            };

            service.addEvent(eventData);

            expect(service.roomEvents).toContain(eventData);
        });
    });

    describe('messageReceived$ Observable', () => {
        it('should emit when messageReceivedSubject emits', (done) => {
            service.messageReceived$.subscribe(() => {
                expect(true).toBeTruthy();
                done();
            });

            service.messageReceivedSubject.next();
        });
    });
});
