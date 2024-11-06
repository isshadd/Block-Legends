import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { WebSocketService, GameRoom } from './websocket.service';
import { GameService } from '@app/services/game-services/game.service';
import { ChatService } from '../chat-services/chat-service.service';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { Socket } from 'socket.io-client';

describe('WebSocketService', () => {
    let service: WebSocketService;
    let router: jasmine.SpyObj<Router>;
    let gameService: jasmine.SpyObj<GameService>;
    let chatService: jasmine.SpyObj<ChatService>;
    let eventJournalService: jasmine.SpyObj<EventJournalService>;
    let mockSocket: jasmine.SpyObj<Socket>;

    const mockGameRoom: GameRoom = {
        roomId: 'room1',
        accessCode: 12345,
        players: [],
        isLocked: false,
        maxPlayers: 4,
        currentPlayerTurn: ''
    };

    const mockPlayer: PlayerCharacter = {
        socketId: 'socket1',
        isOrganizer: false
    } as PlayerCharacter;

    beforeEach(() => {
        router = jasmine.createSpyObj('Router', ['navigate']);
        gameService = jasmine.createSpyObj('GameService', ['setAccessCode', 'clearGame']);
        chatService = jasmine.createSpyObj('ChatService', [], {
            roomMessages: [],
            messageReceivedSubject: jasmine.createSpyObj('Subject', ['next'])
        });
        eventJournalService = jasmine.createSpyObj('EventJournalService', ['addEvent'], {
            messageReceivedSubject: jasmine.createSpyObj('Subject', ['next']),
            serverClock: new Date(),
            roomID: 'room1'
        });

        mockSocket = jasmine.createSpyObj('Socket', ['emit', 'on', 'disconnect']);
        
        TestBed.configureTestingModule({
            providers: [
                WebSocketService,
                { provide: Router, useValue: router },
                { provide: GameService, useValue: gameService },
                { provide: ChatService, useValue: chatService },
                { provide: EventJournalService, useValue: eventJournalService }
            ]
        });

        service = TestBed.inject(WebSocketService);
        service.currentRoom = mockGameRoom;
        service.socket = mockSocket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Socket Emission Methods', () => {
        it('should emit createGame event', () => {
            service.createGame('game1', mockPlayer);
            expect(mockSocket.emit).toHaveBeenCalledWith('createGame', {
                gameId: 'game1',
                playerOrganizer: mockPlayer
            });
        });

        it('should emit sendMsgToRoom event', () => {
            const roomMessage = { 
                content: 'test message', 
                roomId: 'room1',
                room: 'room1',
                time: new Date(),
                sender: 'testSender'
            };
            service.sendMsgToRoom(roomMessage);
            expect(mockSocket.emit).toHaveBeenCalledWith('roomMessage', roomMessage);
        });

        it('should emit sendEventToRoom with correct data', () => {
            const event = 'testEvent';
            const players = ['player1', 'player2'];
            service.sendEventToRoom(event, players);
            expect(mockSocket.emit).toHaveBeenCalledWith('eventMessage', {
                time: eventJournalService.serverClock,
                event,
                roomID: eventJournalService.roomID,
                associatedPlayers: players
            });
        });

        it('should emit joinGame event', () => {
            service.joinGame(12345);
            expect(mockSocket.emit).toHaveBeenCalledWith('joinGame', 12345);
        });

        it('should emit addPlayerToRoom event', () => {
            service.addPlayerToRoom(12345, mockPlayer);
            expect(mockSocket.emit).toHaveBeenCalledWith('addPlayerToRoom', {
                accessCode: 12345,
                player: mockPlayer
            });
        });

        it('should emit kickPlayer event', () => {
            service.kickPlayer(mockPlayer);
            expect(mockSocket.emit).toHaveBeenCalledWith('kickPlayer', mockPlayer);
        });
    });

    describe('Room Management Methods', () => {
        it('should handle leaveGame when room exists', () => {
            service.leaveGame();
            expect(mockSocket.emit).toHaveBeenCalledWith('leaveGame', mockGameRoom.accessCode);
            expect(gameService.clearGame).toHaveBeenCalled();
            expect(service.isLockedSubject.value).toBeFalse();
        });

        it('should handle lockRoom when room exists', () => {
            service.lockRoom();
            expect(mockSocket.emit).toHaveBeenCalledWith('lockRoom', mockGameRoom.accessCode);
        });

        it('should handle unlockRoom when room exists', () => {
            service.unlockRoom();
            expect(mockSocket.emit).toHaveBeenCalledWith('unlockRoom', mockGameRoom.accessCode);
        });

        it('should handle startGame when room exists', () => {
            service.startGame();
            expect(mockSocket.emit).toHaveBeenCalledWith('startGame', mockGameRoom.accessCode);
        });

        it('should return current room info', () => {
            const roomInfo = service.getRoomInfo();
            expect(roomInfo).toEqual(mockGameRoom);
        });
    });

    describe('Socket Listeners', () => {
        it('should handle roomState event', () => {
            const mockRoom: GameRoom = { ...mockGameRoom, players: [mockPlayer] };
            service.setupSocketListeners();
            
            // Simulate socket.on callback for roomState
            const roomStateCallback = mockSocket.on.calls.allArgs()
                .find(call => call[0] === 'roomState')?.[1];
            if (roomStateCallback) {
                roomStateCallback(mockRoom);
            }

            expect(gameService.setAccessCode).toHaveBeenCalledWith(mockRoom.accessCode);
            expect(service.playersSubject.value).toEqual(mockRoom.players);
            expect(service.currentRoom).toEqual(mockRoom);
            expect(service.isLockedSubject.value).toEqual(mockRoom.isLocked);
        });

        it('should handle valid joinGameResponse', fakeAsync(() => {
            const response = {
                valid: true,
                message: 'Success',
                roomId: 'room1',
                accessCode: 12345,
                isLocked: false
            };

            service.setupSocketListeners();
            
            // Simulate socket.on callback for joinGameResponse
            const joinGameResponseCallback = mockSocket.on.calls.allArgs()
                .find(call => call[0] === 'joinGameResponse')?.[1];
            if (joinGameResponseCallback) {
                joinGameResponseCallback(response);
            }

            tick();

            expect(gameService.setAccessCode).toHaveBeenCalledWith(response.accessCode);
            expect(service.isLockedSubject.value).toEqual(response.isLocked);
            expect(router.navigate).toHaveBeenCalledWith(
                ['/player-create-character'],
                { queryParams: { roomId: response.accessCode } }
            );
        }));

        it('should handle playerKicked event for current player', fakeAsync(() => {
            const data = {
                message: 'You were kicked',
                kickedPlayerId: 'socket1'
            };
            service.socket.id = 'socket1';

            service.setupSocketListeners();
            
            // Simulate socket.on callback for playerKicked
            const playerKickedCallback = mockSocket.on.calls.allArgs()
                .find(call => call[0] === 'playerKicked')?.[1];
            if (playerKickedCallback) {
                playerKickedCallback(data);
            }

            tick();

            expect(gameService.clearGame).toHaveBeenCalled();
            expect(service.isLockedSubject.value).toBeFalse();
            expect(service.playersSubject.value).toEqual([]);
            expect(router.navigate).toHaveBeenCalledWith(['/home']);
        }));

        it('should handle roomMessage event', () => {
            const message = 'Test message';
            service.setupSocketListeners();
            
            // Simulate socket.on callback for roomMessage
            const roomMessageCallback = mockSocket.on.calls.allArgs()
                .find(call => call[0] === 'roomMessage')?.[1];
            if (roomMessageCallback) {
                roomMessageCallback(message);
            }

            expect(chatService.roomMessages).toContain(message);
            expect(chatService.messageReceivedSubject.next).toHaveBeenCalled();
        });

        it('should handle eventReceived event', () => {
            const eventData = {
                sentEvent: 'testEvent',
                associatedPlayers: ['player1', 'player2']
            };
            service.setupSocketListeners();
            
            // Simulate socket.on callback for eventReceived
            const eventReceivedCallback = mockSocket.on.calls.allArgs()
                .find(call => call[0] === 'eventReceived')?.[1];
            if (eventReceivedCallback) {
                eventReceivedCallback(eventData);
            }

            expect(eventJournalService.addEvent).toHaveBeenCalledWith(
                eventData.sentEvent,
                eventData.associatedPlayers
            );
            expect(eventJournalService.messageReceivedSubject.next).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            spyOn(window, 'alert');
        });

        it('should handle joinGameResponseCodeInvalid', () => {
            const response = { message: 'Invalid code' };
            service.setupSocketListeners();
            
            const joinGameResponseCodeInvalidCallback = mockSocket.on.calls.allArgs()
                .find(call => call[0] === 'joinGameResponseCodeInvalid')?.[1];
            if (joinGameResponseCodeInvalidCallback) {
                joinGameResponseCodeInvalidCallback(response);
            }

            expect(window.alert).toHaveBeenCalledWith(response.message);
        });

        it('should handle joinGameResponseLockedRoom', () => {
            const response = { message: 'Room is locked' };
            service.setupSocketListeners();
            
            const joinGameResponseLockedRoomCallback = mockSocket.on.calls.allArgs()
                .find(call => call[0] === 'joinGameResponseLockedRoom')?.[1];
            if (joinGameResponseLockedRoomCallback) {
                joinGameResponseLockedRoomCallback(response);
            }

            expect(window.alert).toHaveBeenCalledWith(response.message);
        });

        it('should handle error event', () => {
            const errorMessage = 'Test error';
            service.setupSocketListeners();
            
            const errorCallback = mockSocket.on.calls.allArgs()
                .find(call => call[0] === 'error')?.[1];
            if (errorCallback) {
                errorCallback(errorMessage);
            }

            expect(window.alert).toHaveBeenCalledWith(errorMessage);
        });
    });
    // Add these tests within the existing 'Socket Listeners' describe block

describe('Socket Listeners - Additional Tests', () => {
    beforeEach(() => {
        spyOn(window, 'alert');
        spyOn(location, 'reload');
    });

    it('should handle joinGameResponseNoMoreExisting', () => {
        const response = { message: 'No more slots available' };
        service.setupSocketListeners();
        
        const noMoreExistingCallback = mockSocket.on.calls.allArgs()
            .find(call => call[0] === 'joinGameResponseNoMoreExisting')?.[1];
        if (noMoreExistingCallback) {
            noMoreExistingCallback(response);
        }

        expect(window.alert).toHaveBeenCalledWith(response.message);
    });

    it('should handle joinGameResponseLockedAfterJoin', () => {
        const response = { message: 'Room locked after join' };
        service.setupSocketListeners();
        
        const lockedAfterJoinCallback = mockSocket.on.calls.allArgs()
            .find(call => call[0] === 'joinGameResponseLockedAfterJoin')?.[1];
        if (lockedAfterJoinCallback) {
            lockedAfterJoinCallback(response);
        }

        expect(window.alert).toHaveBeenCalledWith(response.message);
    });

    it('should handle roomLocked event', () => {
        const data = { 
            message: 'Room is now locked', 
            isLocked: true 
        };
        service.setupSocketListeners();
        
        const roomLockedCallback = mockSocket.on.calls.allArgs()
            .find(call => call[0] === 'roomLocked')?.[1];
        if (roomLockedCallback) {
            roomLockedCallback(data);
        }

        expect(service.isLockedSubject.value).toBe(true);
        expect(window.alert).toHaveBeenCalledWith(data.message);
    });

    it('should handle roomUnlocked event', () => {
        const data = { 
            message: 'Room is now unlocked', 
            isLocked: false 
        };
        service.setupSocketListeners();
        
        const roomUnlockedCallback = mockSocket.on.calls.allArgs()
            .find(call => call[0] === 'roomUnlocked')?.[1];
        if (roomUnlockedCallback) {
            roomUnlockedCallback(data);
        }

        expect(service.isLockedSubject.value).toBe(false);
        expect(window.alert).toHaveBeenCalledWith(data.message);
    });

    it('should handle playerLeft event', () => {
        service.setupSocketListeners();
        
        const playerLeftCallback = mockSocket.on.calls.allArgs()
            .find(call => call[0] === 'playerLeft')?.[1];
        if (playerLeftCallback) {
            playerLeftCallback();
        }

        expect(gameService.clearGame).toHaveBeenCalled();
        expect(service.isLockedSubject.value).toBeFalse();
        expect(service.playersSubject.value).toEqual([]);
        expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should handle gameStarted event', () => {
        service.setupSocketListeners();
        
        const gameStartedCallback = mockSocket.on.calls.allArgs()
            .find(call => call[0] === 'gameStarted')?.[1];
        if (gameStartedCallback) {
            gameStartedCallback();
        }

        expect(router.navigate).toHaveBeenCalledWith(['/play-page']);
    });

    it('should handle roomClosed event for non-organizer players', fakeAsync(() => {
        service.currentRoom = {
            ...mockGameRoom,
            players: [
                { 
                    ...mockPlayer, 
                    isOrganizer: false,
                    assignAttackDice: () => {},
                    assignDefenseDice: () => {},
                    assignLifeBonus: () => {},
                    assignSpeedBonus: () => {},
                    setOrganizer: () => {}
                }
            ]
        };
        service.setupSocketListeners();
        
        const roomClosedCallback = mockSocket.on.calls.allArgs()
            .find(call => call[0] === 'roomClosed')?.[1];
        if (roomClosedCallback) {
            roomClosedCallback();
        }

        tick();

        expect(mockSocket.emit).toHaveBeenCalledWith('leaveGame', mockGameRoom.accessCode);
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
        expect(location.reload).toHaveBeenCalled();
    }));

    it('should not handle roomClosed event for organizer players', () => {
        service.currentRoom = {
            ...mockGameRoom,
            players: [
                { 
                    ...mockPlayer, 
                    isOrganizer: true,
                    assignAttackDice: () => {},
                    assignDefenseDice: () => {},
                    assignLifeBonus: () => {},
                    assignSpeedBonus: () => {},
                    setOrganizer: () => {}
                }
            ]
        };
        service.setupSocketListeners();
        
        const roomClosedCallback = mockSocket.on.calls.allArgs()
            .find(call => call[0] === 'roomClosed')?.[1];
        if (roomClosedCallback) {
            roomClosedCallback();
        }

        expect(mockSocket.emit).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle clock event', () => {
        const serverTime = new Date();
        service.setupSocketListeners();
        
        const clockCallback = mockSocket.on.calls.allArgs()
            .find(call => call[0] === 'clock')?.[1];
        if (clockCallback) {
            clockCallback(serverTime);
        }

        expect(chatService.serverClock).toEqual(serverTime);
        expect(eventJournalService.serverClock).toEqual(serverTime);
    });
});
});