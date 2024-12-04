import { TestBed } from '@angular/core/testing';
import { SocketStateService } from '@app/services/socket-service/socket-state-service/socket-state.service';
import { WebSocketService } from '@app/services/socket-service/websocket-service/websocket.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Subject } from 'rxjs';
import { EventJournalService } from './event-journal.service';

describe('EventJournalService', () => {
    let service: EventJournalService;
    let socketStateService: jasmine.SpyObj<SocketStateService>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
    let hasActiveSocketSubject: Subject<boolean>;

    beforeEach(async () => {
        hasActiveSocketSubject = new Subject<boolean>();
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['sendEventToRoom']);
        socketStateService = jasmine.createSpyObj('SocketStateService', ['getActiveSocket'], {
            hasActiveSocket$: hasActiveSocketSubject.asObservable(),
        });
        socketStateService.getActiveSocket.and.returnValue(mockWebSocketService);

        await TestBed.configureTestingModule({
            providers: [EventJournalService, { provide: SocketStateService, useValue: socketStateService }],
        }).compileComponents();

        service = TestBed.inject(EventJournalService);
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

    describe('broadcastEvent', () => {
        let testPlayers: PlayerCharacter[];

        beforeEach(() => {
            service.initialize();
            testPlayers = [new PlayerCharacter('Player1'), new PlayerCharacter('Player2')];
        });

        it('should send event to room when socket exists and event is not empty', () => {
            const testEvent = 'test event';
            service.broadcastEvent(testEvent, testPlayers);
            expect(mockWebSocketService.sendEventToRoom).toHaveBeenCalledWith(testEvent, testPlayers);
        });

        it('should not send event when socket is null', () => {
            service.socket = null;
            const testEvent = 'test event';
            service.broadcastEvent(testEvent, testPlayers);
            expect(mockWebSocketService.sendEventToRoom).not.toHaveBeenCalled();
        });

        it('should not send event when event string is empty', () => {
            const testEvent = '  ';
            service.broadcastEvent(testEvent, testPlayers);
            expect(mockWebSocketService.sendEventToRoom).not.toHaveBeenCalled();
        });
    });

    describe('event management', () => {
        let testPlayers: PlayerCharacter[];

        beforeEach(() => {
            testPlayers = [new PlayerCharacter('Player1'), new PlayerCharacter('Player2')];
        });

        it('should add event to roomEvents array', () => {
            const testEvent = {
                event: { time: new Date(), content: 'test' },
                associatedPlayers: testPlayers,
            };
            service.addEvent(testEvent);
            expect(service.roomEvents).toContain(testEvent);
        });

        it('should clear all events from roomEvents array', () => {
            const testEvent = {
                event: { time: new Date(), content: 'test' },
                associatedPlayers: testPlayers,
            };
            service.addEvent(testEvent);
            service.clearEvents();
            expect(service.roomEvents.length).toBe(0);
        });
    });

    describe('getFilteredEvents', () => {
        let player1: PlayerCharacter;
        let player2: PlayerCharacter;

        beforeEach(() => {
            player1 = new PlayerCharacter('Player1');
            player2 = new PlayerCharacter('Player2');
            service.setCharacter(player1);
        });

        it('should return only events associated with current player', () => {
            const event1 = {
                event: { time: new Date(), content: 'test1' },
                associatedPlayers: [player1],
            };
            const event2 = {
                event: { time: new Date(), content: 'test2' },
                associatedPlayers: [player2],
            };

            service.addEvent(event1);
            service.addEvent(event2);

            const filteredEvents = service.getFilteredEvents();
            expect(filteredEvents).toContain(event1);
            expect(filteredEvents).not.toContain(event2);
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
