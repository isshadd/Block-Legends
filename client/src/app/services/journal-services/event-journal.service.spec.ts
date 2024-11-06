import { TestBed } from '@angular/core/testing';
import { EventJournalService } from './event-journal.service';
import { SocketStateService } from '../SocketService/socket-state.service';
import { WebSocketService } from '../SocketService/websocket.service';
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
            hasActiveSocket$: hasActiveSocket$
        });

        // Configure getActiveSocket spy
        socketStateService.getActiveSocket.and.returnValue(mockWebSocketService);

        TestBed.configureTestingModule({
            providers: [
                EventJournalService,
                { provide: SocketStateService, useValue: socketStateService }
            ]
        });

        service = TestBed.inject(EventJournalService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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

    describe('setAccessCode', () => {
        it('should set accessCode and roomID', () => {
            const code = 12345;
            service.setAccessCode(code);

            expect(service.accessCode).toBe(code);
            expect(service.roomID).toBe(code.toString());
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
        it('should add event and players to respective arrays', () => {
            const event = 'test event';
            const players = ['player1', 'player2'];

            service.addEvent(event, players);

            expect(service.roomEvents).toContain(event);
            expect(service.playersInvolved).toContain(players);
            expect(service.roomEvents.length).toBe(1);
            expect(service.playersInvolved.length).toBe(1);
        });

        it('should maintain order of events and players', () => {
            const events = ['event1', 'event2'];
            const players = [['player1'], ['player2', 'player3']];

            service.addEvent(events[0], players[0]);
            service.addEvent(events[1], players[1]);

            expect(service.roomEvents).toEqual(events);
            expect(service.playersInvolved).toEqual(players);
        });
    });

    describe('messageReceived$ Observable', () => {
        it('should be initialized', () => {
            expect(service.messageReceived$).toBeTruthy();
        });

        it('should emit when messageReceivedSubject emits', (done) => {
            service.messageReceived$.subscribe(() => {
                expect(true).toBeTruthy();
                done();
            });

            service.messageReceivedSubject.next();
        });
    });

    describe('Initial State', () => {
        it('should have correct initial values', () => {
            expect(service.socket).toBeNull();
            expect(service.roomEvents).toEqual([]);
            expect(service.playersInvolved).toEqual([]);
            expect(service.messageReceivedSubject).toBeTruthy();
            expect(service.messageReceived$).toBeTruthy();
        });
    });
});