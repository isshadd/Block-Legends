/* eslint-disable @typescript-eslint/no-explicit-any */ // Allow usage of 'any' type it is necessary for this file to be tested
/* eslint-disable max-lines */ // Allow file to exceed maximum line limit and it necessary for this file to be tested becasue it has many tests and it is expected because it is the websocket service which is a very long file to begin with
/* eslint-disable @typescript-eslint/no-empty-function */ // Allow empty functions which is necessary for testing of this file
/* eslint-disable @typescript-eslint/promise-function-async */ // Allow non-async promise functions
/* eslint-disable no-undef */ // Allow usage of undefined variables which is necessary for testing of this file
/* eslint-disable @typescript-eslint/ban-types */ // Allow usage of banned types which is necessary for testing of this file

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game-services/game.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { ChatEvents } from '@common/enums/gateway-events/chat-events';
import { SocketEvents } from '@common/enums/gateway-events/socket-events';
import { GameRoom } from '@common/interfaces/game-room';
import { RoomEvent } from '@common/interfaces/RoomEvent';
import { RoomMessage, RoomMessageReceived } from '@common/interfaces/roomMessage';
import { Socket } from 'socket.io-client';
import { WebSocketService } from '../websocket.service';

const ACCESS_CODE = 1234;

describe('WebSocketService', () => {
    let service: WebSocketService;
    let routerSpy: jasmine.SpyObj<Router>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let socketSpy: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        const router = jasmine.createSpyObj('Router', ['navigate']);
        const gameService = jasmine.createSpyObj('GameService', [
            'setAccessCode',
            'clearGame',
            'updatePlayerName',
            'releaseVirtualPlayerName',
            'setCharacter',
        ]);
        const socket = jasmine.createSpyObj('Socket', ['emit', 'on', 'disconnect']);
        socket.id = 'socket-id';

        TestBed.configureTestingModule({
            providers: [WebSocketService, { provide: Router, useValue: router }, { provide: GameService, useValue: gameService }],
        });

        service = TestBed.inject(WebSocketService);
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        service.socket = socket as any;
        socketSpy = service.socket as jasmine.SpyObj<Socket>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize socket and set up listeners', async () => {
        spyOn(service, 'setupSocketListeners');
        service.init();
        expect(service.socket).toBeDefined();
        expect(service.setupSocketListeners).toHaveBeenCalled();
    });

    it('should emit createGame event', async () => {
        const gameId = 'game123';
        const player = new PlayerCharacter('Hero');
        service.createGame(gameId, player);
        expect(socketSpy.emit).toHaveBeenCalledWith('createGame', {
            gameId,
            playerOrganizer: player,
        });
    });

    it('should emit joinGame event', async () => {
        const accessCode = ACCESS_CODE;
        service.joinGame(accessCode);
        expect(socketSpy.emit).toHaveBeenCalledWith('joinGame', accessCode);
    });

    it('should emit addPlayerToRoom event', async () => {
        const accessCode = ACCESS_CODE;
        const player = new PlayerCharacter('Hero');
        service.addPlayerToRoom(accessCode, player);
        expect(socketSpy.emit).toHaveBeenCalledWith('addPlayerToRoom', {
            accessCode,
            player,
        });
    });

    it('should emit kickPlayer event', async(() => {
        const player = new PlayerCharacter('Hero');
        service.kickPlayer(player);
        expect(socketSpy.emit).toHaveBeenCalledWith('kickPlayer', player);
    }));

    it('should leave game and reset state', fakeAsync(() => {
        service.currentRoom = { accessCode: ACCESS_CODE } as any;
        service.leaveGame();
        expect(socketSpy.emit).toHaveBeenCalledWith('leaveGame', ACCESS_CODE);
        tick();
    }));

    it('should lock the room', async () => {
        service.currentRoom = { accessCode: ACCESS_CODE } as any;
        service.lockRoom();
        expect(socketSpy.emit).toHaveBeenCalledWith('lockRoom', ACCESS_CODE);
    });

    it('should unlock the room', async () => {
        service.currentRoom = { accessCode: ACCESS_CODE } as any;
        service.unlockRoom();
        expect(socketSpy.emit).toHaveBeenCalledWith('unlockRoom', ACCESS_CODE);
    });

    it('should start the game', async () => {
        service.currentRoom = { accessCode: ACCESS_CODE } as any;
        service.startGame();
        expect(socketSpy.emit).toHaveBeenCalledWith('startGame', ACCESS_CODE);
    });

    it('should get room info', async () => {
        service.currentRoom = { roomId: 'room123' } as any;
        expect(service.getRoomInfo()).toEqual(service.currentRoom);
    });

    it('should set up socket listeners', async () => {
        service.setupSocketListeners();
        expect(socketSpy.on).toHaveBeenCalledWith('roomState', jasmine.any(Function));
        expect(socketSpy.on).toHaveBeenCalledWith('joinGameResponse', jasmine.any(Function));
    });

    it('should handle roomState event', fakeAsync(() => {
        const room: GameRoom = {
            accessCode: ACCESS_CODE,
            players: [],
            isLocked: false,
            maxPlayers: 4,
            currentPlayerTurn: '',
            id: 'room123',
            organizer: 'socket-id',
        };

        let handler: (room: GameRoom) => void = () => {};
        socketSpy.on.and.callFake(function (event, fn) {
            if (event === 'roomState') {
                handler = fn as (room: GameRoom) => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();

        handler(room);
        expect(gameServiceSpy.setAccessCode).toHaveBeenCalledWith(ACCESS_CODE);
        service.players$.subscribe((players) => {
            expect(players).toEqual([]);
        });
        expect(service.currentRoom).toEqual(room);
        service.isLocked$.subscribe((isLocked) => {
            expect(isLocked).toBeFalse();
        });
        tick();
    }));

    it('should handle joinGameResponse event with valid response', fakeAsync(() => {
        const response = {
            valid: true,
            message: '',
            roomId: 'room123',
            accessCode: ACCESS_CODE,
            isLocked: false,
            playerName: 'Player1',
            takenAvatars: ['avatar1'],
        };

        let handler: (response: any) => void = () => {};
        socketSpy.on.and.callFake(function (event, fn) {
            if (event === 'joinGameResponse') {
                handler = fn as (response: any) => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();

        handler(response);
        expect(gameServiceSpy.setAccessCode).toHaveBeenCalledWith(ACCESS_CODE);
        service.isLocked$.subscribe((isLocked) => {
            expect(isLocked).toBeFalse();
        });
        service.takenAvatars$.subscribe((avatars) => {
            expect(avatars).toEqual(['avatar1']);
        });
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/player-create-character'], {
            queryParams: { roomId: ACCESS_CODE },
        });
        expect(gameServiceSpy.updatePlayerName).toHaveBeenCalledWith('Player1');
        tick();
    }));

    it('should handle joinGameResponse event with invalid response', fakeAsync(() => {
        const response = {
            valid: false,
            message: 'Error message',
            roomId: '',
            accessCode: 0,
            isLocked: false,
            playerName: '',
            takenAvatars: [],
        };

        spyOn(window, 'alert');

        let handler: (response: any) => void = () => {};
        socketSpy.on.and.callFake(function (event, fn) {
            if (event === 'joinGameResponse') {
                handler = fn as (response: any) => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();

        handler(response);

        expect(window.alert).toHaveBeenCalledWith('Error message');
        tick();
    }));

    it('should handle avatarTakenError event', fakeAsync(() => {
        const data = { message: 'Avatar already taken' };

        let handler: (data: { message: string }) => void = () => {};
        socketSpy.on.and.callFake(function (event, fn) {
            if (event === 'avatarTakenError') {
                handler = fn as (data: { message: string }) => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();

        handler(data);

        service.avatarTakenError$.subscribe((message) => {
            expect(message).toEqual('Avatar already taken');
        });
        tick();
    }));

    it('should call releaseVirtualPlayerName when player is virtual', () => {
        const player = new PlayerCharacter('Hero');
        player.isVirtual = true;

        service.kickPlayer(player);

        expect(gameServiceSpy.releaseVirtualPlayerName).toHaveBeenCalledWith(player.name);
        expect(socketSpy.emit).toHaveBeenCalledWith('kickPlayer', player);
    });

    it('should not call releaseVirtualPlayerName when player is not virtual', () => {
        const player = new PlayerCharacter('Hero');
        player.isVirtual = false;

        service.kickPlayer(player);

        expect(gameServiceSpy.releaseVirtualPlayerName).not.toHaveBeenCalled();
        expect(socketSpy.emit).toHaveBeenCalledWith('kickPlayer', player);
    });

    it('should handle DEBUG_MODE_REC event', () => {
        service.debugService.isDebugMode = false;
        let handler: () => void = () => {};

        socketSpy.on.and.callFake((event: string, fn: Function) => {
            if (event === SocketEvents.DEBUG_MODE_REC) {
                handler = fn as () => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();
        handler();

        expect(service.debugService.isDebugMode).toBeTrue();
    });

    it('should handle DEBUG_MODE_OFF_REC event', () => {
        service.debugService.isDebugMode = true;
        let handler: () => void = () => {};

        socketSpy.on.and.callFake((event: string, fn: Function) => {
            if (event === SocketEvents.DEBUG_MODE_OFF_REC) {
                handler = fn as () => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();
        handler();

        expect(service.debugService.isDebugMode).toBeFalse();
    });

    it('should handle USER_DID_MOVE event', () => {
        service.debugService.isPlayerMoving = false;
        let handler: () => void = () => {};

        socketSpy.on.and.callFake((event: string, fn: Function) => {
            if (event === SocketEvents.USER_DID_MOVE) {
                handler = fn as () => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();
        handler();

        expect(service.debugService.isPlayerMoving).toBeTrue();
    });

    it('should handle USER_FINISHED_MOVE event', () => {
        service.debugService.isPlayerMoving = true;
        let handler: () => void = () => {};

        socketSpy.on.and.callFake((event: string, fn: Function) => {
            if (event === SocketEvents.USER_FINISHED_MOVE) {
                handler = fn as () => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();
        handler();

        expect(service.debugService.isPlayerMoving).toBeFalse();
    });

    it('should handle ChatEvents.Clock event', () => {
        const serverClock = new Date();
        let handler: (serverClock: Date) => void = () => {};

        socketSpy.on.and.callFake((event: string, fn: Function) => {
            if (event === ChatEvents.Clock) {
                handler = fn as (serverClock: Date) => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();
        handler(serverClock);

        expect(service.chatService.serverClock).toEqual(serverClock);
        expect(service.eventJournalService.serverClock).toEqual(serverClock);
    });

    it('should handle ChatEvents.EventReceived event', () => {
        const data = { event: {} as RoomEvent, associatedPlayers: [] };
        spyOn(service.eventJournalService.messageReceivedSubject, 'next');
        spyOn(service.eventJournalService, 'addEvent');

        let handler: (data: { event: RoomEvent; associatedPlayers: PlayerCharacter[] }) => void = () => {};

        socketSpy.on.and.callFake((event: string, fn: Function) => {
            if (event === ChatEvents.EventReceived) {
                handler = fn as (data: { event: RoomEvent; associatedPlayers: PlayerCharacter[] }) => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();
        handler(data);

        expect(service.eventJournalService.addEvent).toHaveBeenCalledWith(data);
        expect(service.eventJournalService.messageReceivedSubject.next).toHaveBeenCalled();
    });

    it('should handle ChatEvents.RoomMessage event', () => {
        const message = {} as RoomMessageReceived;
        spyOn(service.chatService.messageReceivedSubject, 'next');

        let handler: (message: RoomMessageReceived) => void = () => {};

        socketSpy.on.and.callFake((event: string, fn: Function) => {
            if (event === ChatEvents.RoomMessage) {
                handler = fn as (message: RoomMessageReceived) => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();
        handler(message);

        expect(service.chatService.roomMessages).toContain(message);
        expect(service.chatService.messageReceivedSubject.next).toHaveBeenCalled();
    });

    it('should emit toggleDebugMode event when debugMode is called and accessCode is defined', () => {
        service.currentRoom = { accessCode: ACCESS_CODE } as any;
        service.debugMode();
        expect(socketSpy.emit).toHaveBeenCalledWith(SocketEvents.TOGGLE_DEBUG_MODE, ACCESS_CODE.toString());
    });

    it('debugMode should not emit if accessCode is undefined', () => {
        service.currentRoom = {} as any;
        service.debugMode();
        expect(socketSpy.emit).not.toHaveBeenCalled();
    });

    it('should emit debugModeOff event when debugModeOff is called and accessCode is defined', () => {
        service.currentRoom = { accessCode: ACCESS_CODE } as any;
        service.debugModeOff();
        expect(socketSpy.emit).toHaveBeenCalledWith(SocketEvents.DEBUG_MODE_OFF, ACCESS_CODE.toString());
    });

    it('debugModeOff should not emit if accessCode is undefined', () => {
        service.currentRoom = {} as any;
        service.debugModeOff();
        expect(socketSpy.emit).not.toHaveBeenCalled();
    });

    it('should get total players', () => {
        const players = [new PlayerCharacter('Hero'), new PlayerCharacter('Hero2')];
        service.playersSubject.next(players);

        const totalPlayers = service.getTotalPlayers();

        expect(totalPlayers).toEqual(players);
    });

    it('should handle playerKicked event when current player is kicked', async () => {
        const data = { message: 'You have been kicked', kickedPlayerId: 'socket-id' };
        service.currentRoom = { accessCode: ACCESS_CODE } as any;
        spyOn(window, 'alert').and.stub();
        routerSpy.navigate.and.returnValue(Promise.resolve(true));
        socketSpy.id = 'socket-id';

        let handler: (data: { message: string; kickedPlayerId: string }) => Promise<void> = () => Promise.resolve();

        socketSpy.on.and.callFake(function (event, fn) {
            if (event === 'playerKicked') {
                handler = fn as (data: { message: string; kickedPlayerId: string }) => Promise<void>;
            }
            return socketSpy;
        });

        service.setupSocketListeners();

        await handler(data);

        expect(window.alert).toHaveBeenCalledWith('You have been kicked');
        expect(socketSpy.emit).toHaveBeenCalledWith('leaveGame', ACCESS_CODE);
        expect(gameServiceSpy.clearGame).toHaveBeenCalled();
        expect(service.isLockedSubject.value).toBeFalse();
        expect(service.playersSubject.value).toEqual([]);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should handle playerLeft event', fakeAsync(() => {
        let handler: () => void = () => {};
        socketSpy.on.and.callFake(function (event, fn) {
            if (event === 'playerLeft') {
                handler = fn as () => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();

        handler();

        expect(gameServiceSpy.clearGame).toHaveBeenCalled();
        service.isLocked$.subscribe((isLocked) => {
            expect(isLocked).toBeFalse();
        });
        service.players$.subscribe((players) => {
            expect(players).toEqual([]);
        });
        expect(service.socket.disconnect).toHaveBeenCalled();
        tick();
    }));

    it('should handle gameStarted event', fakeAsync(() => {
        let handler: () => void = () => {};
        socketSpy.on.and.callFake(function (event, fn) {
            if (event === 'gameStarted') {
                handler = fn as () => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();

        handler();

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/play-page']);
        tick();
    }));

    it('should handle roomClosed event', fakeAsync(() => {
        const player1 = new PlayerCharacter('Hero');
        player1.isOrganizer = false;
        const player2 = new PlayerCharacter('Hero2');
        player2.isOrganizer = true;

        service.currentRoom = {
            players: [player1, player2],
        } as any;

        spyOn(service, 'leaveGame');

        let handler: () => void = () => {};
        socketSpy.on.and.callFake(function (event, fn) {
            if (event === 'roomClosed') {
                handler = fn as () => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();

        handler();

        expect(service.leaveGame).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
        tick();
    }));

    it('should handle error event', fakeAsync(() => {
        const message = 'An error occurred';
        spyOn(window, 'alert');

        let handler: (message: string) => void = () => {};
        socketSpy.on.and.callFake(function (event, fn) {
            if (event === 'error') {
                handler = fn as (message: string) => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();

        handler(message);

        expect(window.alert).toHaveBeenCalledWith(message);
        tick();
    }));

    it('leaveGame should not emit if accessCode is undefined', fakeAsync(() => {
        service.currentRoom = {} as any;
        service.leaveGame();
        expect(socketSpy.emit).not.toHaveBeenCalledWith('leaveGame', jasmine.anything());
        tick();
    }));

    it('lockRoom should not emit if accessCode is undefined', fakeAsync(() => {
        service.currentRoom = {} as any;
        service.lockRoom();
        expect(socketSpy.emit).not.toHaveBeenCalled();
        tick();
    }));

    it('unlockRoom should not emit if accessCode is undefined', fakeAsync(() => {
        service.currentRoom = {} as any;
        service.unlockRoom();
        expect(socketSpy.emit).not.toHaveBeenCalled();
        tick();
    }));

    it('startGame should not emit if accessCode is undefined', fakeAsync(() => {
        service.currentRoom = {} as any;
        service.startGame();
        expect(socketSpy.emit).not.toHaveBeenCalled();
        tick();
    }));

    it('should handle roomLocked event', fakeAsync(() => {
        const data = { message: 'Room is locked', isLocked: true };
        spyOn(window, 'alert');

        let handler: (data: { message: string; isLocked: boolean }) => void = () => {};
        socketSpy.on.and.callFake(function (event, fn) {
            if (event === 'roomLocked') {
                handler = fn as (data: { message: string; isLocked: boolean }) => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();

        handler(data);

        service.isLocked$.subscribe((isLocked) => {
            expect(isLocked).toBeTrue();
        });
        tick();
    }));

    it('should handle roomUnlocked event', fakeAsync(() => {
        const data = { message: 'Room is unlocked', isLocked: false };
        spyOn(window, 'alert');

        let handler: (data: { message: string; isLocked: boolean }) => void = () => {};
        socketSpy.on.and.callFake(function (event, fn) {
            if (event === 'roomUnlocked') {
                handler = fn as (data: { message: string; isLocked: boolean }) => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();

        handler(data);

        service.isLocked$.subscribe((isLocked) => {
            expect(isLocked).toBeFalse();
        });
        tick();
    }));

    it('should handle joinGameResponseNoMoreExisting event', fakeAsync(() => {
        const response = { message: 'Room does not exist' };
        spyOn(window, 'alert');

        let handler: (response: { message: string }) => void = () => {};

        socketSpy.on.and.callFake(function (event, fn) {
            if (event === 'joinGameResponseNoMoreExisting') {
                handler = fn as (response: { message: string }) => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();

        handler(response);
        tick();
    }));

    it('should handle joinGameResponseLockedAfterJoin event', fakeAsync(() => {
        const response = { message: 'Room was locked' };
        spyOn(window, 'alert');

        let handler: (response: { message: string }) => void = () => {};
        socketSpy.on.and.callFake(function (event, fn) {
            if (event === 'joinGameResponseLockedAfterJoin') {
                handler = fn as (response: { message: string }) => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();

        handler(response);
        tick();
    }));

    it('should send event to room with correct parameters', () => {
        const eventContent = 'Test event';
        const players = [new PlayerCharacter('Player1'), new PlayerCharacter('Player2')];
        const mockServerClock = new Date();
        const mockRoomId = 'room123';

        service.eventJournalService.serverClock = mockServerClock;
        service.eventJournalService.roomID = mockRoomId;

        service.sendEventToRoom(eventContent, players);

        expect(socketSpy.emit).toHaveBeenCalledWith(ChatEvents.EventMessage, {
            time: mockServerClock,
            content: eventContent,
            roomID: mockRoomId,
            associatedPlayers: players,
        });
    });

    it('should send event to room with empty players array', () => {
        const eventContent = 'Test event';
        const players: PlayerCharacter[] = [];
        const mockServerClock = new Date();
        const mockRoomId = 'room123';

        service.eventJournalService.serverClock = mockServerClock;
        service.eventJournalService.roomID = mockRoomId;

        service.sendEventToRoom(eventContent, players);

        expect(socketSpy.emit).toHaveBeenCalledWith(ChatEvents.EventMessage, {
            time: mockServerClock,
            content: eventContent,
            roomID: mockRoomId,
            associatedPlayers: players,
        });
    });

    it('should send message to room with correct parameters', () => {
        const messageContent: RoomMessage = { content: 'Test message', room: 'room123', sender: 'Player1', time: new Date() };
        const mockServerClock = new Date();
        const mockRoomId = 'room123';

        service.chatService.serverClock = mockServerClock;
        service.chatService.roomID = mockRoomId;

        service.sendMsgToRoom(messageContent);

        expect(socketSpy.emit).toHaveBeenCalledWith(ChatEvents.RoomMessage, messageContent);
    });

    it('should send log message to room with correct parameters', () => {
        const messageContent = 'Test message';

        service.sendLog(messageContent);

        expect(socketSpy.emit).toHaveBeenCalledWith('log', messageContent);
    });

    it('should emit JOIN_WAITING_ROOM_SUCCESS and set character if player is not virtual', fakeAsync(() => {
        const player = new PlayerCharacter('Hero');
        player.isVirtual = false;
        let handler: (player: PlayerCharacter) => void = () => {};
        socketSpy.on.and.callFake(function (event, fn) {
            if (event === 'joinWaitingRoomSuccess') {
                handler = fn as (player: PlayerCharacter) => void;
            }
            return socketSpy;
        });

        service.setupSocketListeners();

        handler(new PlayerCharacter('Hero'));
        tick();

        expect(gameServiceSpy.setCharacter).toHaveBeenCalledWith(player);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/waiting-view']);
    }));
});

function async(fn: Function): (done: DoneFn) => void {
    return (done: DoneFn) => {
        fn();
        done();
    };
}
