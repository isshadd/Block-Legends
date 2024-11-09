/* eslint-disable no-restricted-imports */
import { TestBed } from '@angular/core/testing';
import { SocketStateService } from './socket-state.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { first } from 'rxjs/operators';

const MEDIUM_EMMITED = 3;
const LONG_EMMITED = 4;

describe('SocketStateService', () => {
    let service: SocketStateService;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;

    beforeEach(() => {
        // Create a spy object for WebSocketService
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['']);

        TestBed.configureTestingModule({
            providers: [SocketStateService, { provide: WebSocketService, useValue: mockWebSocketService }],
        });

        service = TestBed.inject(SocketStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with no active socket', () => {
        expect(service.getActiveSocket()).toBeNull();
    });

    it('should initialize with hasActiveSocket$ as false', (done) => {
        service.hasActiveSocket$.pipe(first()).subscribe((hasSocket) => {
            expect(hasSocket).toBeFalse();
            done();
        });
    });

    it('should set active socket and emit true', (done) => {
        // Track the emitted values
        const emittedValues: boolean[] = [];

        service.hasActiveSocket$.subscribe((hasSocket) => {
            emittedValues.push(hasSocket);

            // After the socket is set, check the values
            if (emittedValues.length === 2) {
                expect(emittedValues).toEqual([false, true]); // Initial false, then true
                expect(service.getActiveSocket()).toBe(mockWebSocketService);
                done();
            }
        });

        service.setActiveSocket(mockWebSocketService);
    });

    it('should clear socket and emit false', (done) => {
        // First set the socket
        service.setActiveSocket(mockWebSocketService);

        // Track the emitted values
        const emittedValues: boolean[] = [];

        service.hasActiveSocket$.subscribe((hasSocket) => {
            emittedValues.push(hasSocket);

            // After the socket is cleared, check the values
            if (emittedValues.length === 2) {
                expect(emittedValues).toEqual([true, false]); // Initial true, then false
                expect(service.getActiveSocket()).toBeNull();
                done();
            }
        });

        service.clearSocket();
    });

    it('should return the correct socket after setting it', () => {
        service.setActiveSocket(mockWebSocketService);
        expect(service.getActiveSocket()).toBe(mockWebSocketService);
    });

    it('should return null after clearing socket', () => {
        service.setActiveSocket(mockWebSocketService);
        service.clearSocket();
        expect(service.getActiveSocket()).toBeNull();
    });

    it('should handle multiple socket sets', (done) => {
        const mockWebSocketService2 = jasmine.createSpyObj('WebSocketService', ['']);
        const emittedValues: boolean[] = [];

        service.hasActiveSocket$.subscribe((hasSocket) => {
            emittedValues.push(hasSocket);

            if (emittedValues.length === MEDIUM_EMMITED) {
                expect(emittedValues).toEqual([false, true, true]);
                expect(service.getActiveSocket()).toBe(mockWebSocketService2);
                done();
            }
        });

        service.setActiveSocket(mockWebSocketService);
        service.setActiveSocket(mockWebSocketService2);
    });

    it('should handle set-clear-set sequence', (done) => {
        const emittedValues: boolean[] = [];

        service.hasActiveSocket$.subscribe((hasSocket) => {
            emittedValues.push(hasSocket);

            if (emittedValues.length === LONG_EMMITED) {
                expect(emittedValues).toEqual([false, true, false, true]);
                expect(service.getActiveSocket()).toBe(mockWebSocketService);
                done();
            }
        });

        service.setActiveSocket(mockWebSocketService);
        service.clearSocket();
        service.setActiveSocket(mockWebSocketService);
    });

    it('should handle multiple clears', (done) => {
        const emittedValues: boolean[] = [];

        service.hasActiveSocket$.subscribe((hasSocket) => {
            emittedValues.push(hasSocket);

            if (emittedValues.length === LONG_EMMITED) {
                expect(emittedValues).toEqual([false, true, false, false]);
                expect(service.getActiveSocket()).toBeNull();
                done();
            }
        });

        service.setActiveSocket(mockWebSocketService);
        service.clearSocket();
        service.clearSocket(); // Second clear
    });

    it('should not emit if setting same socket', (done) => {
        const emittedValues: boolean[] = [];

        service.hasActiveSocket$.subscribe((hasSocket) => {
            emittedValues.push(hasSocket);

            if (emittedValues.length === 2) {
                expect(emittedValues).toEqual([false, true]);
                expect(service.getActiveSocket()).toBe(mockWebSocketService);
                done();
            }
        });

        service.setActiveSocket(mockWebSocketService);
        service.setActiveSocket(mockWebSocketService); // Setting same socket
    });
});
