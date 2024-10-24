import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { GameService } from '@app/services/game-services/game.service';
import { io, Socket } from 'socket.io-client';
import { WebSocketService } from './websocket.service';

describe('WebSocketService', () => {
    let service: WebSocketService;
    let mockRouter: Router;
    let mockGameService: GameService;
    let mockPlayerCharacter: PlayerCharacter;
    let mockSocket: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockGameService = jasmine.createSpyObj('GameService', ['setAccessCode', 'clearGame']);
        mockPlayerCharacter = jasmine.createSpyObj('PlayerCharacter', ['name', 'socketId']);
        mockSocket = jasmine.createSpyObj<Socket>('Socket', ['emit', 'on']);

        TestBed.configureTestingModule({
            //imports: [WebSocketService],
            providers: [
                { provide: WebSocketService, useValue: { socket: mockSocket } },
                { provide: Router, useValue: mockRouter },
                { provide: GameService, useValue: mockGameService },
            ],
        });

        service = TestBed.inject(WebSocketService);
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should connect to the socket and setup listeners', () => {
        const socket = { on: jasmine.createSpy(), emit: jasmine.createSpy() };
        (io as jasmine.Spy).and.returnValue(socket);

        expect(socket.on).toHaveBeenCalled();
    });

    it('should handle room state reception', () => {
        const roomState = { roomId: 'room1', accessCode: 1234, players: [] };

        const onSpy = mockSocket.on as jasmine.Spy;
        const eventHandler = onSpy.calls.mostRecent().args[1];
        eventHandler(roomState);

        expect(mockGameService.setAccessCode).toHaveBeenCalledWith(roomState.accessCode);
        expect(service.playersSubject.getValue()).toEqual(roomState.players);
    });

    it('should handle players update', () => {
        const players: PlayerCharacter[] = [mockPlayerCharacter];

        const onSpy = mockSocket.on as jasmine.Spy;
        const eventHandler = onSpy.calls.mostRecent().args[1];
        eventHandler(players);

        expect(service.playersSubject.getValue()).toEqual(players);
    });

    it('should handle valid join game response', () => {
        const response = { valid: true, message: 'Joined successfully', roomId: 'room1', accessCode: 1234 };

        const onSpy = mockSocket.on as jasmine.Spy;
        onSpy.calls.mostRecent().args[1](response);

        expect(localStorage.getItem('roomId')).toBe('room1');
        expect(mockGameService.setAccessCode).toHaveBeenCalledWith(response.accessCode);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/player-create-character'], { queryParams: { roomId: 'room1' } });
    });

    it('should handle invalid join game response', () => {
        const response = { valid: false, message: 'Invalid access code', roomId: '', accessCode: 0 };
        spyOn(window, 'alert');

        const onSpy = mockSocket.on as jasmine.Spy;
        onSpy.calls.mostRecent().args[1](response);

        expect(window.alert).toHaveBeenCalledWith("Code d'accès invalide");
    });

    it('should create a game', () => {
        service.createGame('game1', mockPlayerCharacter);

        expect(mockSocket.emit).toHaveBeenCalledWith('createGame', { gameId: 'game1', playerOrganizer: mockPlayerCharacter });
        expect(localStorage.getItem('roomId')).toBe('game1');
    });

    it('should join a game', () => {
        service.joinGame(1234);

        expect(mockSocket.emit).toHaveBeenCalledWith('joinGame', 1234);
    });

    it('should add player to room', () => {
        service.addPlayerToRoom('game1', mockPlayerCharacter);

        expect(mockSocket.emit).toHaveBeenCalledWith('addPlayerToRoom', { gameId: 'game1', player: mockPlayerCharacter });
    });

    it('should leave the game', () => {
        localStorage.setItem('roomId', 'game1');
        service.leaveGame();

        expect(mockSocket.emit).toHaveBeenCalledWith('leaveGame', 'game1');
        expect(localStorage.getItem('roomId')).toBe(null);
        expect(mockGameService.clearGame).toHaveBeenCalled();
    });
});
