import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BattleManagerService } from '@app/services/play-page-services/game-board/battle-manager.service';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayGameBoardSocketService } from '@app/services/play-page-services/game-board/play-game-board-socket.service';
import { PlayPageMouseHandlerService } from '@app/services/play-page-services/play-page-mouse-handler.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';

describe('PlayGameBoardSocketService', () => {
    let service: PlayGameBoardSocketService;
    let mockSocket: jasmine.SpyObj<Socket>;
    /* eslint-disable */
    let mockWebSocketService: any;
    let mockPlayGameBoardManagerService: any;
    let mockPlayPageMouseHandlerService: any;
    let mockBattleManagerService: any;
    let mockRouter: any;
    let socketCallbacks: { [event: string]: Function };
    /* eslint-disable */
    beforeEach(() => {
        socketCallbacks = {};

        mockSocket = jasmine.createSpyObj('Socket', ['emit', 'on', 'disconnect']);

        mockSocket.on.and.callFake((event: string, callback: Function) => {
            socketCallbacks[event] = callback;
            return mockSocket;
        });

        mockWebSocketService = {
            socket: mockSocket,
            getRoomInfo: jasmine.createSpy().and.returnValue({ accessCode: 1234 }),
            resetValues: jasmine.createSpy().and.callFake(() => {}),
        };

        mockPlayGameBoardManagerService = {
            signalUserMoved$: new Subject<unknown>(),
            signalUserRespawned$: new Subject<unknown>(),
            signalUserStartedMoving$: new Subject<void>(),
            signalUserFinishedMoving$: new Subject<void>(),
            signalUserGotTurnEnded$: new Subject<void>(),
            signalUserDidDoorAction$: new Subject<unknown>(),
            signalUserDidBattleAction$: new Subject<unknown>(),
            signalUserWon$: new Subject<void>(),
            isUserTurn: false,
            currentPlayerIdTurn: '',
            winnerPlayer: null,
            init: jasmine.createSpy('init'),
            movePlayer: jasmine.createSpy('movePlayer'),
            toggleDoor: jasmine.createSpy('toggleDoor'),
            startBattle: jasmine.createSpy('startBattle'),
            endTurn: jasmine.createSpy('endTurn'),
            startTurn: jasmine.createSpy('startTurn'),
            endBattleByDeath: jasmine.createSpy('endBattleByDeath'),
            endGame: jasmine.createSpy('endGame'),
            resetManager: jasmine.createSpy('resetManager'),
            continueTurn: jasmine.createSpy('continueTurn'),
            removePlayerFromMap: jasmine.createSpy('removePlayerFromMap'),
        };

        mockPlayPageMouseHandlerService = {
            clearUI: jasmine.createSpy('clearUI'),
            endTurn: jasmine.createSpy('endTurn'),
        };

        mockBattleManagerService = {
            signalUserAttacked$: new Subject<number>(),
            signalUserTriedEscape$: new Subject<void>(),
            currentPlayerIdTurn: '',
            isUserTurn: false,
            onOpponentAttack: jasmine.createSpy('onOpponentAttack'),
            onOpponentEscape: jasmine.createSpy('onOpponentEscape'),
            onUserAttack: jasmine.createSpy('onUserAttack'),
            onSuccessfulAttack: jasmine.createSpy('onSuccessfulAttack'),
            endBattle: jasmine.createSpy('endBattle'),
            clearBattle: jasmine.createSpy('clearBattle'),
        };

        mockRouter = {
            navigate: jasmine.createSpy('navigate'),
        };

        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardSocketService,
                { provide: WebSocketService, useValue: mockWebSocketService },
                { provide: PlayGameBoardManagerService, useValue: mockPlayGameBoardManagerService },
                { provide: PlayPageMouseHandlerService, useValue: mockPlayPageMouseHandlerService },
                { provide: BattleManagerService, useValue: mockBattleManagerService },
                { provide: Router, useValue: mockRouter },
            ],
        });

        service = TestBed.inject(PlayGameBoardSocketService);
        service.init();
    });

    afterEach(() => {
        service.ngOnDestroy();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Constructor', () => {
        it('should set up socket listeners', () => {
            expect(mockSocket.on).toHaveBeenCalled();
            expect(Object.keys(socketCallbacks).length).toBeGreaterThan(0);
        });

        it('should subscribe to signalUserMoved$ and emit "userMoved"', () => {
            const data = { x: 1, y: 2 };
            mockPlayGameBoardManagerService.signalUserMoved$.next(data);
            expect(mockSocket.emit).toHaveBeenCalledWith('userMoved', data);
        });

        it('should subscribe to signalUserRespawned$ and emit "userRespawned"', () => {
            const data = { x: 3, y: 4 };
            mockPlayGameBoardManagerService.signalUserRespawned$.next(data);
            expect(mockSocket.emit).toHaveBeenCalledWith('userRespawned', data);
        });

        it('should subscribe to signalUserStartedMoving$ and emit "userStartedMoving"', () => {
            mockPlayGameBoardManagerService.signalUserStartedMoving$.next();
            expect(mockSocket.emit).toHaveBeenCalledWith('userStartedMoving');
        });

        it('should subscribe to signalUserFinishedMoving$ and emit "userFinishedMoving"', () => {
            mockPlayGameBoardManagerService.signalUserFinishedMoving$.next();
            expect(mockSocket.emit).toHaveBeenCalledWith('userFinishedMoving');
        });

        it('should subscribe to signalUserGotTurnEnded$ and call endTurn', () => {
            spyOn(service, 'endTurn');
            mockPlayGameBoardManagerService.signalUserGotTurnEnded$.next();
            expect(service.endTurn).toHaveBeenCalled();
        });

        it('should subscribe to signalUserDidDoorAction$ and emit "userDidDoorAction"', () => {
            const tileCoordinate = { x: 5, y: 6 };
            mockPlayGameBoardManagerService.signalUserDidDoorAction$.next(tileCoordinate);
            expect(mockSocket.emit).toHaveBeenCalledWith('userDidDoorAction', tileCoordinate);
        });

        it('should subscribe to signalUserDidBattleAction$ and emit "userDidBattleAction"', () => {
            const enemyPlayerId = 'enemy123';
            mockPlayGameBoardManagerService.signalUserDidBattleAction$.next(enemyPlayerId);
            expect(mockSocket.emit).toHaveBeenCalledWith('userDidBattleAction', enemyPlayerId);
        });

        it('should subscribe to signalUserWon$ and emit "userWon"', () => {
            mockPlayGameBoardManagerService.signalUserWon$.next();
            expect(mockSocket.emit).toHaveBeenCalledWith('userWon');
        });

        it('should subscribe to battleManagerService.signalUserAttacked$ and emit "userAttacked"', () => {
            const attackResult = 50;
            mockBattleManagerService.signalUserAttacked$.next(attackResult);
            expect(mockSocket.emit).toHaveBeenCalledWith('userAttacked', attackResult);
        });

        it('should subscribe to battleManagerService.signalUserTriedEscape$ and emit "userTriedEscape"', () => {
            mockBattleManagerService.signalUserTriedEscape$.next();
            expect(mockSocket.emit).toHaveBeenCalledWith('userTriedEscape');
        });
    });

    describe('endTurn', () => {
        it('should emit "userEndTurn" if isUserTurn is true', () => {
            mockPlayGameBoardManagerService.isUserTurn = true;
            service.endTurn();
            expect(mockSocket.emit).toHaveBeenCalledWith('userEndTurn');
        });

        it('should not emit "userEndTurn" if isUserTurn is false', () => {
            mockPlayGameBoardManagerService.isUserTurn = false;
            service.endTurn();
            expect(mockSocket.emit).not.toHaveBeenCalledWith('userEndTurn');
        });
    });

    describe('leaveGame', () => {
        it('should disconnect the socket, clear battle, reset manager, clear UI, and navigate to /home', () => {
            service.leaveGame();
            expect(mockBattleManagerService.clearBattle).toHaveBeenCalled();
            expect(mockPlayGameBoardManagerService.resetManager).toHaveBeenCalled();
            expect(mockPlayPageMouseHandlerService.clearUI).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
        });
    });

    describe('ngOnDestroy', () => {
        it('should complete destroy$ subject', () => {
            /* eslint-disable */
            spyOn((service as any).destroy$, 'next').and.callThrough();
            spyOn((service as any).destroy$, 'complete').and.callThrough();
            service.ngOnDestroy();
            expect((service as any).destroy$.next).toHaveBeenCalled();
            expect((service as any).destroy$.complete).toHaveBeenCalled();
            /* eslint-disable */
        });
    });

    describe('Socket Listeners', () => {
        it('should handle "initGameBoardParameters" event', () => {
            const gameBoardParameters = {};
            socketCallbacks['initGameBoardParameters'](gameBoardParameters);
            expect(mockPlayGameBoardManagerService.init).toHaveBeenCalledWith(gameBoardParameters);
        });

        it('should handle "setTime" event', () => {
            const time = 100;
            socketCallbacks['setTime'](time);
            expect(mockPlayGameBoardManagerService.currentTime).toBe(time);
        });

        it('should handle "endTurn" event', () => {
            mockPlayGameBoardManagerService.isUserTurn = true;
            socketCallbacks['endTurn']();
            expect(mockPlayGameBoardManagerService.endTurn).toHaveBeenCalled();
            expect(mockPlayPageMouseHandlerService.endTurn).toHaveBeenCalled();
            expect(mockPlayGameBoardManagerService.currentPlayerIdTurn).toBe('');
            expect(mockPlayGameBoardManagerService.isUserTurn).toBeFalse();
        });

        it('should handle "startTurn" event when it is user turn', () => {
            const playerIdTurn = 'user123';
            // eslint-disable-next-line
            (mockSocket as any).id = 'user123';
            socketCallbacks['startTurn'](playerIdTurn);
            expect(mockPlayGameBoardManagerService.currentPlayerIdTurn).toBe(playerIdTurn);
            expect(mockPlayGameBoardManagerService.isUserTurn).toBeTrue();
            expect(mockPlayGameBoardManagerService.startTurn).toHaveBeenCalled();
        });

        it('should handle "startTurn" event when it is not user turn', () => {
            const playerIdTurn = 'otherPlayer';
            // eslint-disable-next-line
            (mockSocket as any).id = 'user123';
            socketCallbacks['startTurn'](playerIdTurn);
            expect(mockPlayGameBoardManagerService.currentPlayerIdTurn).toBe(playerIdTurn);
            expect(mockPlayGameBoardManagerService.isUserTurn).toBeFalse();
            expect(mockPlayGameBoardManagerService.startTurn).not.toHaveBeenCalled();
        });

        it('should handle "gameBoardPlayerLeft" event', () => {
            const playerId = 'playerLeft';
            socketCallbacks['gameBoardPlayerLeft'](playerId);
            expect(mockPlayGameBoardManagerService.removePlayerFromMap).toHaveBeenCalledWith(playerId);
        });

        it('should handle "roomUserMoved" event', () => {
            const data = { playerId: 'player1', fromTile: { x: 0, y: 0 }, toTile: { x: 1, y: 1 } };
            socketCallbacks['roomUserMoved'](data);
            expect(mockPlayGameBoardManagerService.movePlayer).toHaveBeenCalledWith(data.playerId, data.fromTile, data.toTile);
        });

        it('should handle "roomUserRespawned" event', () => {
            const data = { playerId: 'player2', fromTile: { x: 2, y: 2 }, toTile: { x: 3, y: 3 } };
            socketCallbacks['roomUserRespawned'](data);
            expect(mockPlayGameBoardManagerService.movePlayer).toHaveBeenCalledWith(data.playerId, data.fromTile, data.toTile);
            expect(mockPlayGameBoardManagerService.continueTurn).toHaveBeenCalled();
        });

        it('should handle "roomUserDidDoorAction" event', () => {
            const tileCoordinate = { x: 4, y: 4 };
            socketCallbacks['roomUserDidDoorAction'](tileCoordinate);
            expect(mockPlayGameBoardManagerService.toggleDoor).toHaveBeenCalledWith(tileCoordinate);
        });

        it('should handle "roomUserDidBattleAction" event', () => {
            const data = { playerId: 'player1', enemyPlayerId: 'enemy1' };
            socketCallbacks['roomUserDidBattleAction'](data);
            expect(mockPlayGameBoardManagerService.startBattle).toHaveBeenCalledWith(data.playerId, data.enemyPlayerId);
        });

        it('should handle "startBattleTurn" event', () => {
            const playerIdTurn = 'playerTurn';
            // eslint-disable-next-line
            (mockSocket as any).id = 'playerTurn';
            socketCallbacks['startBattleTurn'](playerIdTurn);
            expect(mockPlayGameBoardManagerService.currentPlayerIdTurn).toBe(playerIdTurn);
            expect(mockPlayGameBoardManagerService.isUserTurn).toBeTrue();
            expect(mockBattleManagerService.currentPlayerIdTurn).toBe(playerIdTurn);
            expect(mockBattleManagerService.isUserTurn).toBeTrue();
        });

        it('should handle "opponentAttacked" event', () => {
            const attackResult = 75;
            socketCallbacks['opponentAttacked'](attackResult);
            expect(mockBattleManagerService.onOpponentAttack).toHaveBeenCalledWith(attackResult);
        });

        it('should handle "opponentTriedEscape" event', () => {
            socketCallbacks['opponentTriedEscape']();
            expect(mockBattleManagerService.onOpponentEscape).toHaveBeenCalled();
        });

        it('should handle "automaticAttack" event', () => {
            socketCallbacks['automaticAttack']();
            expect(mockBattleManagerService.onUserAttack).toHaveBeenCalled();
        });

        it('should handle "successfulAttack" event', () => {
            socketCallbacks['successfulAttack']();
            expect(mockBattleManagerService.onSuccessfulAttack).toHaveBeenCalled();
        });

        it('should handle "battleEndedByEscape" event', () => {
            const playerIdTurn = 'playerEscape';
            // eslint-disable-next-line
            (mockSocket as any).id = 'playerEscape';
            socketCallbacks['battleEndedByEscape'](playerIdTurn);
            expect(mockPlayGameBoardManagerService.currentPlayerIdTurn).toBe(playerIdTurn);
            expect(mockPlayGameBoardManagerService.isUserTurn).toBeTrue();
            expect(mockBattleManagerService.endBattle).toHaveBeenCalled();
            expect(mockPlayGameBoardManagerService.continueTurn).toHaveBeenCalled();
        });

        it('should handle "firstPlayerWonBattle" event', () => {
            const data = { firstPlayer: 'player1', loserPlayer: 'player2' };
            // eslint-disable-next-line
            (mockSocket as any).id = 'player1';
            socketCallbacks['firstPlayerWonBattle'](data);
            expect(mockPlayGameBoardManagerService.currentPlayerIdTurn).toBe(data.firstPlayer);
            expect(mockPlayGameBoardManagerService.isUserTurn).toBeTrue();
            expect(mockBattleManagerService.endBattle).toHaveBeenCalled();
            expect(mockPlayGameBoardManagerService.endBattleByDeath).toHaveBeenCalledWith(data.firstPlayer, data.loserPlayer);
        });

        it('should handle "secondPlayerWonBattle" event', () => {
            const data = { winnerPlayer: 'player2', loserPlayer: 'player1' };
            socketCallbacks['secondPlayerWonBattle'](data);
            expect(mockBattleManagerService.endBattle).toHaveBeenCalled();
            expect(mockPlayGameBoardManagerService.endBattleByDeath).toHaveBeenCalledWith(data.winnerPlayer, data.loserPlayer);
        });

        it('should handle "gameBoardPlayerWon" event and leave game after timeout', fakeAsync(() => {
            const playerId = 'winnerPlayer';
            spyOn(service, 'leaveGame');
            socketCallbacks['gameBoardPlayerWon'](playerId);
            expect(mockPlayGameBoardManagerService.endGame).toHaveBeenCalledWith(playerId);

            tick(5000);
            expect(service.leaveGame).toHaveBeenCalled();
        }));

        it('should handle "lastPlayerStanding" event and leave game', () => {
            spyOn(window, 'alert');
            spyOn(service, 'leaveGame');
            socketCallbacks['lastPlayerStanding']();
            expect(window.alert).toHaveBeenCalledWith('Tous les autres joueurs ont quitté la partie. Fin de partie');
            expect(service.leaveGame).toHaveBeenCalled();
        });
    });
});
