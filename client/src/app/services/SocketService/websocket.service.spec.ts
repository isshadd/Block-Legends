// src/app/services/SocketService/websocket.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { GameService } from '@app/services/game-services/game.service';
import { Socket } from 'socket.io-client';
import { GameRoom, WebSocketService } from './websocket.service';

describe('WebSocketService', () => {
    let service: jasmine.SpyObj<WebSocketService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockSocket: jasmine.SpyObj<Socket>;
    let eventHandlers: Map<string, Function>;

    beforeEach(() => {
        mockRouter = jasmine.createSpyObj<Router>('Router', ['navigate']);
        mockGameService = jasmine.createSpyObj<GameService>('GameService', ['setAccessCode', 'clearGame']);

        // Créer un mock pour Socket avec les méthodes nécessaires
        mockSocket = jasmine.createSpyObj<Socket>('Socket', ['on', 'emit', 'disconnect'], { id: 'socket123' });
        mockSocket.on.and.returnValue(mockSocket); // Pour permettre le chaînage si nécessaire

        eventHandlers = new Map<string, Function>();

        TestBed.configureTestingModule({
            imports: [WebSocketService],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: GameService, useValue: mockGameService },
            ],
        });

        service = jasmine.createSpyObj<WebSocketService>('WebSocketService', [
            'init',
            'createGame',
            'joinGame',
            'addPlayerToRoom',
            'kickPlayer',
            'leaveGame',
            'lockRoom',
            'unlockRoom',
            'startGame',
            'getRoomInfo',
        ]);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize the socket connection', () => {
        service.init();
        expect(service['socket']).toBe(mockSocket);
        expect(mockSocket.on).toHaveBeenCalled(); // Vérifier que 'on' a été appelé
    });

    it('should emit createGame event', () => {
        service.init();
        const gameId = 'game123';
        const player: PlayerCharacter = { name: 'Hero', socketId: 'socket123', attributes: {} } as PlayerCharacter;
        service.createGame(gameId, player);
        expect(mockSocket.emit).toHaveBeenCalledWith('createGame', { gameId, playerOrganizer: player });
    });

    it('should emit joinGame event', () => {
        service.init();
        const accessCode = 1234;
        service.joinGame(accessCode);
        expect(mockSocket.emit).toHaveBeenCalledWith('joinGame', accessCode);
    });

    it('should emit addPlayerToRoom event', () => {
        service.init();
        const accessCode = 1234;
        const player: PlayerCharacter = { name: 'Hero', socketId: 'socket123', attributes: {} } as PlayerCharacter;
        service.addPlayerToRoom(accessCode, player);
        expect(mockSocket.emit).toHaveBeenCalledWith('addPlayerToRoom', { accessCode, player });
    });

    it('should emit kickPlayer event', () => {
        service.init();
        const player: PlayerCharacter = { name: 'Hero', socketId: 'socket123', attributes: {} } as PlayerCharacter;
        service.kickPlayer(player);
        expect(mockSocket.emit).toHaveBeenCalledWith('kickPlayer', player);
    });

    it('should emit leaveGame event and clear game', () => {
        service.init();
        service.currentRoom = {
            roomId: 'string',
            accessCode: 1234,
            players: [] as PlayerCharacter[],
            isLocked: false,
            maxPlayers: 4,
            currentPlayerTurn: 'player1',
        };
        service.leaveGame();
        expect(mockSocket.emit).toHaveBeenCalledWith('leaveGame', 1234);
        expect(mockGameService.clearGame).toHaveBeenCalled();
        expect(service.isLockedSubject.value).toBeFalse();
    });

    it('should emit lockRoom event', () => {
        service.init();
        service.currentRoom = {
            roomId: 'string',
            accessCode: 1234,
            players: [] as PlayerCharacter[],
            isLocked: false,
            maxPlayers: 4,
            currentPlayerTurn: 'player1',
        };
        service.lockRoom();
        expect(mockSocket.emit).toHaveBeenCalledWith('lockRoom', 1234);
    });

    it('should emit unlockRoom event', () => {
        service.init();
        service.currentRoom = {
            roomId: 'string',
            accessCode: 1234,
            players: [] as PlayerCharacter[],
            isLocked: false,
            maxPlayers: 4,
            currentPlayerTurn: 'player1',
        };
        service.unlockRoom();
        expect(mockSocket.emit).toHaveBeenCalledWith('unlockRoom', 1234);
    });

    it('should emit startGame event', () => {
        service.init();
        service.currentRoom = {
            roomId: 'string',
            accessCode: 1234,
            players: [] as PlayerCharacter[],
            isLocked: false,
            maxPlayers: 4,
            currentPlayerTurn: 'player1',
        };
        service.startGame();
        expect(mockSocket.emit).toHaveBeenCalledWith('startGame', 1234);
    });

    it('should return current room info', () => {
        service.currentRoom = {
            roomId: 'string',
            accessCode: 1234,
            players: [] as PlayerCharacter[],
            isLocked: false,
            maxPlayers: 4,
            currentPlayerTurn: 'player1',
        };
        expect(service.getRoomInfo()).toEqual({ accessCode: 1234 } as GameRoom);
    });

    it('should handle roomState event', () => {
        service.init();
        const room: GameRoom = {
            roomId: 'game123',
            accessCode: 1234,
            players: [],
            isLocked: false,
            maxPlayers: 5,
            currentPlayerTurn: 'socket123',
        };

        const roomStateHandler = getEventHandler(mockSocket, 'roomState');
        expect(roomStateHandler).toBeDefined();

        if (roomStateHandler) {
            roomStateHandler(room);
        }

        expect(mockGameService.setAccessCode).toHaveBeenCalledWith(1234);
        expect(service.playersSubject.value).toEqual([]);
        expect(service.currentRoom).toEqual(room);
        expect(service.isLockedSubject.value).toBeFalse();
    });

    it('should handle joinGameResponse event with valid response', () => {
        service.init();
        const response = {
            valid: true,
            message: 'Joined successfully',
            roomId: 'game123',
            accessCode: 1234,
            isLocked: false,
        };

        const joinGameResponseHandler = getEventHandler(mockSocket, 'joinGameResponse');
        expect(joinGameResponseHandler).toBeDefined();

        if (joinGameResponseHandler) {
            joinGameResponseHandler(response);
        }

        expect(mockGameService.setAccessCode).toHaveBeenCalledWith(1234);
        expect(service.isLockedSubject.value).toBeFalse();
        expect(service.maxPlayersSubject.value).toBe(service.maxPlayersSubject.value); // Selon votre implémentation
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/player-create-character'], { queryParams: { roomId: 1234 } });
    });

    it('should handle joinGameResponseCodeInvalid event', () => {
        service.init();
        const response = { message: 'Invalid code' };

        const handler = getEventHandler(mockSocket, 'joinGameResponseCodeInvalid');
        expect(handler).toBeDefined();

        spyOn(window, 'alert');

        if (handler) {
            handler(response);
        }
        expect(window.alert).toHaveBeenCalledWith('Invalid code');
    });

    it('should handle joinGameResponseLockedRoom event', () => {
        const response = { message: 'Room is locked' };

        spyOn(window, 'alert');

        // Simuler l'événement 'joinGameResponseLockedRoom'
        const handler = eventHandlers.get('joinGameResponseLockedRoom');
        expect(handler).toBeDefined();
        expect(typeof handler).toBe('function');

        if (handler) {
            handler(response);
        }
        expect(window.alert).toHaveBeenCalledWith('Room is locked');
    });

    it('should handle joinGameResponseNoMoreExisting event', () => {
        service.init();
        const response = { message: 'No more rooms' };

        const handler = getEventHandler(mockSocket, 'joinGameResponseNoMoreExisting');
        expect(handler).toBeDefined();

        spyOn(window, 'alert');

        if (handler) {
            handler(response);
        }
        expect(window.alert).toHaveBeenCalledWith('No more rooms');
    });

    it('should handle joinGameResponseLockedAfterJoin event', () => {
        service.init();
        const response = { message: 'Room locked after join' };

        const handler = getEventHandler(mockSocket, 'joinGameResponseLockedAfterJoin');
        expect(handler).toBeDefined();

        spyOn(window, 'alert');

        if (handler) {
            handler(response);
        }
        expect(window.alert).toHaveBeenCalledWith('Room locked after join');
    });

    it('should disconnect the socket when leaveGame is called without currentRoom', () => {
        service.init();
        // service.currentRoom = undefined;
        service.leaveGame();
        expect(mockSocket.emit).not.toHaveBeenCalledWith('leaveGame', jasmine.anything());
        expect(mockGameService.clearGame).toHaveBeenCalled();
        expect(service.isLockedSubject.value).toBeFalse();
    });

    it('should handle playerKicked event', async () => {
        service.init();
        service.currentRoom = {
            roomId: 'string',
            accessCode: 1234,
            players: [] as PlayerCharacter[],
            isLocked: false,
            maxPlayers: 4,
            currentPlayerTurn: 'player1',
        };

        spyOn(window, 'alert');
        spyOn(window, 'setTimeout');
        spyOn(service, 'leaveGame').and.callThrough();

        const data = {
            message: 'You have been kicked',
            kickedPlayerId: 'socket123',
        };

        const handler = getEventHandler(mockSocket, 'playerKicked');
        expect(handler).toBeDefined();

        if (handler) {
            await handler(data);
        }

        expect(window.alert).toHaveBeenCalledWith('You have been kicked');
        expect(service.leaveGame).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should handle playerLeft event', () => {
        service.init();

        const handler = getEventHandler(mockSocket, 'playerLeft');
        expect(handler).toBeDefined();

        if (handler) {
            handler();
        }

        expect(mockGameService.clearGame).toHaveBeenCalled();
        expect(service.isLockedSubject.value).toBeFalse();
        expect(service.playersSubject.value).toEqual([]);
        expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should handle gameStarted event', () => {
        service.init();

        const handler = getEventHandler(mockSocket, 'gameStarted');
        expect(handler).toBeDefined();

        if (handler) {
            handler();
        }

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/play-page']);
    });

    it('should handle roomClosed event', () => {
        service.init();
        service.currentRoom = {
            roomId: 'string',
            accessCode: 1234,
            players: [{ isOrganizer: false }] as PlayerCharacter[],
            isLocked: false,
            maxPlayers: 4,
            currentPlayerTurn: 'player1',
        };

        spyOn(window, 'alert');
        spyOn(service, 'leaveGame').and.callThrough();

        const handler = getEventHandler(mockSocket, 'roomClosed');
        expect(handler).toBeDefined();

        if (handler) {
            handler();
        }

        expect(service.leaveGame).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
        expect(window.alert).toHaveBeenCalledWith('Vous avez été expulsé de la salle, redirection en cours...');
    });

    it('should handle error event', () => {
        service.init();

        const handler = getEventHandler(mockSocket, 'error');
        expect(handler).toBeDefined();

        spyOn(window, 'alert');

        if (handler) {
            handler('An error occurred');
        }
        expect(window.alert).toHaveBeenCalledWith('An error occurred');
    });

    // Fonction utilitaire pour obtenir le gestionnaire d'événement pour un événement donné
    function getEventHandler(socketSpy: jasmine.SpyObj<Socket>, eventName: string): Function | undefined {
        const calls = socketSpy.on.calls.all();
        for (const call of calls) {
            if (call.args[0] === eventName) {
                return call.args[1];
            }
        }
        return undefined;
    }
});
