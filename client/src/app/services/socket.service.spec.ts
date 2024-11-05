import { TestBed } from '@angular/core/testing';
import { SocketManagerService } from '@app/services/socket.service';
import { Socket } from 'socket.io-client';

describe('SocketManagerService', () => {
    let service: SocketManagerService;
    let socketMock: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        // Create a mock for Socket
        socketMock = jasmine.createSpyObj('Socket', ['on', 'emit']);

        // Spy on the `io` function to return the mock socket
        spyOn(<any>Socket, 'io').and.returnValue(socketMock);

        // Configure the testing module
        TestBed.configureTestingModule({
            providers: [SocketManagerService],
        });

        service = TestBed.inject(SocketManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call socket.on with correct event and action', () => {
        const mockAction = jasmine.createSpy('mockAction');
        const eventName = 'testEvent';

        service.on(eventName, mockAction);

        expect(socketMock.on).toHaveBeenCalledWith(eventName, mockAction);
    });

    it('should call socket.emit with correct event and data', () => {
        const eventName = 'sendEvent';
        const data = { message: 'Hello, World!' };

        service.send(eventName, data);

        expect(socketMock.emit).toHaveBeenCalledWith(eventName, data);
    });

    it('should call socket.emit with callback if provided', () => {
        const eventName = 'sendEvent';
        const data = { message: 'Hello, World!' };
        const mockCallback = jasmine.createSpy('mockCallback');

        service.send(eventName, data, mockCallback);

        expect(socketMock.emit).toHaveBeenCalledWith(eventName, data, mockCallback);
    });

    it('should call socket.emit without callback if not provided', () => {
        const eventName = 'sendEvent';
        const data = { message: 'Hello, World!' };

        service.send(eventName, data);

        expect(socketMock.emit).toHaveBeenCalledWith(eventName, data);
    });
});
