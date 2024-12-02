import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BattleManagerService } from '@app/services/play-page-services/game-board/battle-manager.service';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayGameBoardSocketService } from '@app/services/play-page-services/game-board/play-game-board-socket.service';
import { PlayPageMouseHandlerService } from '@app/services/play-page-services/play-page-mouse-handler.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { SocketEvents } from '@common/enums/gateway-events/socket-events';
import { ItemType } from '@common/enums/item-type';
import { GameStatistics } from '@common/interfaces/game-statistics';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { GameStatisticsService } from '../game-statistics.service';
import { VirtualPlayerBattleManagerService } from './virtual-player-battle-manager.service';
import { VirtualPlayerManagerService } from './virtual-player-manager.service';

describe('PlayGameBoardSocketService', () => {
    let service: PlayGameBoardSocketService;
    let mockSocket: jasmine.SpyObj<Socket>;
    /* eslint-disable */
    let mockWebSocketService: any;
    let mockPlayGameBoardManagerService: any;
    let mockPlayPageMouseHandlerService: any;
    let mockBattleManagerService: any;
    let mockRouter: any;
    let mockPlayer: PlayerCharacter;
    let mockVirtualPlayerManagerService: any;
    let mockVirtualPlayerBattleManagerService: any;
    let mockGameStatisticsService: any;
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
            signalUserMoved$: new Subject<{
                fromTile: Vec2;
                toTile: Vec2;
                playerTurnId: string;
            }>(),
            signalUserRespawned$: new Subject<{
                fromTile: Vec2;
                toTile: Vec2;
                playerTurnId: string;
            }>(),
            signalUserStartedMoving$: new Subject<string>(),
            signalUserFinishedMoving$: new Subject<string>(),
            signalUserGotTurnEnded$: new Subject<string>(),
            signalUserDidDoorAction$: new Subject<{
                tileCoordinate: Vec2;
                playerTurnId: string;
            }>(),
            signalUserDidBattleAction$: new Subject<{
                playerTurnId: string;
                enemyPlayerId: string;
            }>(),
            signalUserGrabbedItem$: new Subject<{
                itemType: ItemType;
                tileCoordinates: Vec2;
                playerTurnId: string;
            }>(),
            signalUserThrewItem$: new Subject<{
                itemType: ItemType;
                tileCoordinates: Vec2;
                playerTurnId: string;
            }>(),
            signalUserWon$: new Subject<string>(),
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
            playerUsedAction: jasmine.createSpy('playerUsedAction'),
            grabItem: jasmine.createSpy('grabItem'),
            throwItem: jasmine.createSpy('throwItem'),
        };

        mockPlayPageMouseHandlerService = {
            clearUI: jasmine.createSpy('clearUI'),
            endTurn: jasmine.createSpy('endTurn'),
        };

        mockBattleManagerService = {
            signalUserAttacked$: new Subject<{
                playerTurnId: string;
                attackResult: number;
                playerHasTotem: boolean;
            }>(),
            signalUserTriedEscape$: new Subject<string>(),
            currentPlayerIdTurn: '',
            isUserTurn: false,
            onOpponentAttack: jasmine.createSpy('onOpponentAttack'),
            onOpponentEscape: jasmine.createSpy('onOpponentEscape'),
            onUserAttack: jasmine.createSpy('onUserAttack'),
            onSuccessfulAttack: jasmine.createSpy('onSuccessfulAttack'),
            endBattle: jasmine.createSpy('endBattle'),
            clearBattle: jasmine.createSpy('clearBattle'),
        };

        mockVirtualPlayerManagerService = {
            signalMoveVirtualPlayer$: new Subject<{
                coordinates: Vec2;
                virtualPlayerId: string;
            }>(),
            signalVirtualPlayerContinueTurn$: new Subject<string>(),
            signalVirtualPlayerEndedTurn$: new Subject<string>(),
            startTurn: jasmine.createSpy('startTurn'),
            continueTurn: jasmine.createSpy('continueTurn'),
            wonBattle: jasmine.createSpy('wonBattle'),
            lostBattle: jasmine.createSpy('lostBattle'),
            moveVirtualPlayer: jasmine.createSpy('moveVirtualPlayer'),
        };

        mockVirtualPlayerBattleManagerService = {
            startTurn: jasmine.createSpy('startTurn'),
        };

        mockRouter = {
            navigate: jasmine.createSpy('navigate'),
        };

        mockPlayer = new PlayerCharacter('player1');
        mockPlayer.socketId = 'player1';

        mockGameStatisticsService = {
            initGameStatistics: jasmine.createSpy('initGameStatistics'),
        };

        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardSocketService,
                { provide: WebSocketService, useValue: mockWebSocketService },
                { provide: PlayGameBoardManagerService, useValue: mockPlayGameBoardManagerService },
                { provide: PlayPageMouseHandlerService, useValue: mockPlayPageMouseHandlerService },
                { provide: BattleManagerService, useValue: mockBattleManagerService },
                { provide: VirtualPlayerManagerService, useValue: mockVirtualPlayerManagerService },
                { provide: VirtualPlayerBattleManagerService, useValue: mockVirtualPlayerBattleManagerService },
                { provide: GameStatisticsService, useValue: mockGameStatisticsService },
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

        it(`should subscribe to signalUserMoved$ and emit ${SocketEvents.USER_MOVED}`, () => {
            const fromTile = { x: 0, y: 0 } as Vec2;
            const toTile = { x: 1, y: 0 } as Vec2;
            const data = { fromTile, toTile, playerTurnId: mockPlayer.socketId };
            mockPlayGameBoardManagerService.signalUserMoved$.next(data);
            expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.USER_MOVED, data);
        });

        it(`should subscribe to signalUserRespawned$ and emit ${SocketEvents.USER_RESPAWNED}`, () => {
            const fromTile = { x: 0, y: 0 } as Vec2;
            const toTile = { x: 1, y: 0 } as Vec2;
            const data = { fromTile, toTile, playerTurnId: mockPlayer.socketId };
            mockPlayGameBoardManagerService.signalUserRespawned$.next(data);
            expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.USER_RESPAWNED, data);
        });

        it(`should subscribe to signalUserStartedMoving$ and emit ${SocketEvents.USER_STARTED_MOVING}`, () => {
            mockPlayGameBoardManagerService.signalUserStartedMoving$.next(mockPlayer.socketId);
            expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.USER_STARTED_MOVING, mockPlayer.socketId);
        });

        it(`should subscribe to signalUserFinishedMoving$ and emit ${SocketEvents.USER_FINISHED_MOVING}`, () => {
            mockPlayGameBoardManagerService.signalUserFinishedMoving$.next(mockPlayer.socketId);
            expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.USER_FINISHED_MOVING, mockPlayer.socketId);
        });

        it('should subscribe to signalUserGotTurnEnded$ and call endTurn', () => {
            spyOn(service, 'endTurn');
            mockPlayGameBoardManagerService.signalUserGotTurnEnded$.next(mockPlayer.socketId);
            expect(service.endTurn).toHaveBeenCalledWith(mockPlayer.socketId);
        });

        it(`should subscribe to signalUserDidDoorAction$ and emit ${SocketEvents.USER_DID_DOOR_ACTION}`, () => {
            const tileCoordinate = { x: 0, y: 0 };
            const data = { tileCoordinate, playerTurnId: mockPlayer.socketId };
            mockPlayGameBoardManagerService.signalUserDidDoorAction$.next(data);
            expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.USER_DID_DOOR_ACTION, data);
        });

        it(`should subscribe to signalUserDidBattleAction$ and emit ${SocketEvents.USER_DID_DOOR_ACTION}`, () => {
            const enemyPlayerId = 'enemy123';
            const data = { playerTurnId: mockPlayer.socketId, enemyPlayerId };
            mockPlayGameBoardManagerService.signalUserDidBattleAction$.next(data);
            expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.USER_DID_BATTLE_ACTION, data);
        });

        it(`should subscribe to signalUserWon$ and emit ${SocketEvents.USER_WON}`, () => {
            mockPlayGameBoardManagerService.signalUserWon$.next(mockPlayer.socketId);
            expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.USER_WON, mockPlayer.socketId);
        });

        it(`should subscribe to signalUserGrabbedItem$ and emit ${SocketEvents.USER_GRABBED_ITEM}`, () => {
            const itemType = ItemType.Totem;
            const tileCoordinates = { x: 0, y: 0 };
            const data = { itemType, tileCoordinates, playerTurnId: mockPlayer.socketId };
            mockPlayGameBoardManagerService.signalUserGrabbedItem$.next(data);
            expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.USER_GRABBED_ITEM, data);
        });

        it(`should subscribe to signalUserThrewItem$ and emit ${SocketEvents.USER_THREW_ITEM}`, () => {
            const itemType = ItemType.Totem;
            const tileCoordinates = { x: 0, y: 0 };
            const data = { itemType, tileCoordinates, playerTurnId: mockPlayer.socketId };
            mockPlayGameBoardManagerService.signalUserThrewItem$.next(data);
            expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.USER_THREW_ITEM, data);
        });

        it(`should subscribe to battleManagerService.signalUserAttacked$ and emit ${SocketEvents.USER_ATTACKED}`, () => {
            const attackResult = 50;
            const playerHasTotem = true;
            const data = { playerTurnId: mockPlayer.socketId, attackResult, playerHasTotem };
            mockBattleManagerService.signalUserAttacked$.next(data);
            expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.USER_ATTACKED, data);
        });

        it(`should subscribe to battleManagerService.signalUserTriedEscape$ and emit ${SocketEvents.USER_TRIED_ESCAPE}`, () => {
            mockBattleManagerService.signalUserTriedEscape$.next(mockPlayer.socketId);
            expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.USER_TRIED_ESCAPE, mockPlayer.socketId);
        });

        it(`should subscribe to virtualPlayerManagerService.signalMoveVirtualPlayer$ and emit ${SocketEvents.VIRTUAL_PLAYER_CHOOSED_DESTINATION}`, () => {
            const coordinates = { x: 1, y: 1 } as Vec2;
            const data = { coordinates, virtualPlayerId: mockPlayer.socketId };
            mockVirtualPlayerManagerService.signalMoveVirtualPlayer$.next(data);
            expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.VIRTUAL_PLAYER_CHOOSED_DESTINATION, data);
        });

        it(`should subscribe to virtualPlayerManagerService.signalVirtualPlayerContinueTurn$ and emit ${SocketEvents.VIRTUAL_PLAYER_CONTINUE_TURN}`, () => {
            mockVirtualPlayerManagerService.signalVirtualPlayerContinueTurn$.next(mockPlayer.socketId);
            expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.VIRTUAL_PLAYER_CONTINUE_TURN, mockPlayer.socketId);
        });

        it(`should subscribe to virtualPlayerManagerService.signalVirtualPlayerEndedTurn$ and call endturn`, () => {
            spyOn(service, 'endTurn');
            mockVirtualPlayerManagerService.signalVirtualPlayerEndedTurn$.next(mockPlayer.socketId);
            expect(service.endTurn).toHaveBeenCalledWith(mockPlayer.socketId);
        });
    });

    describe('endTurn', () => {
        it(`should emit ${SocketEvents.USER_END_TURN} if isUserTurn is true`, () => {
            service.endTurn(mockPlayer.socketId);
            expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.USER_END_TURN, mockPlayer.socketId);
        });
    });

    describe('leaveGame', () => {
        it('should disconnect the socket, clear battle, reset manager, clear UI, and navigate to /home', () => {
            service.leaveGame();
            expect(mockWebSocketService.resetValues).toHaveBeenCalled();
            expect(mockBattleManagerService.clearBattle).toHaveBeenCalled();
            expect(mockPlayGameBoardManagerService.resetManager).toHaveBeenCalled();
            expect(mockPlayPageMouseHandlerService.clearUI).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
        });
    });

    describe('goToStatisticsPage', () => {
        it('should navigate to statistics page', () => {
            service.goToStatisticsPage();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/statistics-page']);
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
        it(`should handle ${SocketEvents.INIT_GAME_BOARD_PARAMETERS} event`, () => {
            const gameBoardParameters = {};
            socketCallbacks[SocketEvents.INIT_GAME_BOARD_PARAMETERS](gameBoardParameters);
            expect(mockPlayGameBoardManagerService.init).toHaveBeenCalledWith(gameBoardParameters);
        });

        it(`should handle ${SocketEvents.SET_TIME} event`, () => {
            const time = 100;
            socketCallbacks[SocketEvents.SET_TIME](time);
            expect(mockPlayGameBoardManagerService.currentTime).toBe(time);
        });

        it(`should handle ${SocketEvents.END_TURN} event`, () => {
            mockPlayGameBoardManagerService.isUserTurn = true;
            socketCallbacks[SocketEvents.END_TURN]();
            expect(mockPlayGameBoardManagerService.endTurn).toHaveBeenCalled();
            expect(mockPlayPageMouseHandlerService.endTurn).toHaveBeenCalled();
            expect(mockPlayGameBoardManagerService.currentPlayerIdTurn).toBe('');
            expect(mockPlayGameBoardManagerService.isUserTurn).toBeFalse();
        });

        it(`should handle ${SocketEvents.START_TURN} event when it is user turn`, () => {
            // eslint-disable-next-line
            (mockSocket as any).id = mockPlayer.socketId;
            socketCallbacks[SocketEvents.START_TURN](mockPlayer.socketId);
            expect(mockPlayGameBoardManagerService.currentPlayerIdTurn).toBe(mockPlayer.socketId);
            expect(mockPlayGameBoardManagerService.isUserTurn).toBeTrue();
            expect(mockPlayGameBoardManagerService.startTurn).toHaveBeenCalled();
        });

        it(`should handle ${SocketEvents.START_TURN} event winnerPlayerExists`, () => {
            mockPlayGameBoardManagerService.winnerPlayer = new PlayerCharacter('winnerPlayer');
            // eslint-disable-next-line
            (mockSocket as any).id = mockPlayer.socketId;
            socketCallbacks[SocketEvents.START_TURN](mockPlayer.socketId);
            expect(mockPlayGameBoardManagerService.currentPlayerIdTurn).toBe(mockPlayer.socketId);
            expect(mockPlayGameBoardManagerService.isUserTurn).toBeTrue();
            expect(mockPlayGameBoardManagerService.startTurn).not.toHaveBeenCalled();
        });

        it(`should handle ${SocketEvents.START_VIRTUAL_PLAYER_TURN} event`, () => {
            socketCallbacks[SocketEvents.START_VIRTUAL_PLAYER_TURN](mockPlayer.socketId);
            expect(mockVirtualPlayerManagerService.startTurn).toHaveBeenCalledWith(mockPlayer.socketId);
        });

        it(`should handle ${SocketEvents.CONTINUE_VIRTUAL_PLAYER_TURN} event`, () => {
            socketCallbacks[SocketEvents.CONTINUE_VIRTUAL_PLAYER_TURN](mockPlayer.socketId);
            expect(mockVirtualPlayerManagerService.continueTurn).toHaveBeenCalledWith(mockPlayer.socketId);
        });

        it(`should handle ${SocketEvents.GAME_BOARD_PLAYER_LEFT} event`, () => {
            socketCallbacks[SocketEvents.GAME_BOARD_PLAYER_LEFT](mockPlayer.socketId);
            expect(mockPlayGameBoardManagerService.removePlayerFromMap).toHaveBeenCalledWith(mockPlayer.socketId);
        });

        it(`should handle ${SocketEvents.ROOM_USER_MOVED} event`, () => {
            const data = { playerId: mockPlayer.socketId, fromTile: { x: 0, y: 0 }, toTile: { x: 1, y: 1 }, isTeleport: false };
            socketCallbacks[SocketEvents.ROOM_USER_MOVED](data);
            expect(mockPlayGameBoardManagerService.movePlayer).toHaveBeenCalledWith(data.playerId, data.fromTile, data.toTile, data.isTeleport);
        });

        it(`should handle ${SocketEvents.VIRTUAL_PLAYER_MOVED} event`, () => {
            const data = { destination: { x: 1, y: 1 } as Vec2, virtualPlayerId: mockPlayer.socketId };
            socketCallbacks[SocketEvents.VIRTUAL_PLAYER_MOVED](data);
            expect(mockVirtualPlayerManagerService.moveVirtualPlayer).toHaveBeenCalledWith(data.virtualPlayerId, data.destination);
        });

        it(`should handle ${SocketEvents.ROOM_USER_GRABBED_ITEM} event`, () => {
            const data = { itemType: ItemType.Totem, tileCoordinate: { x: 1, y: 1 } as Vec2, playerId: mockPlayer.socketId };
            socketCallbacks[SocketEvents.ROOM_USER_GRABBED_ITEM](data);
            expect(mockPlayGameBoardManagerService.grabItem).toHaveBeenCalledWith(data.playerId, data.itemType, data.tileCoordinate);
        });

        it(`should handle ${SocketEvents.ROOM_USER_THREW_ITEM} event`, () => {
            const data = { itemType: ItemType.Totem, tileCoordinate: { x: 1, y: 1 } as Vec2, playerId: mockPlayer.socketId };
            socketCallbacks[SocketEvents.ROOM_USER_THREW_ITEM](data);
            expect(mockPlayGameBoardManagerService.throwItem).toHaveBeenCalledWith(data.playerId, data.itemType, data.tileCoordinate);
        });

        it(`should handle ${SocketEvents.ROOM_USER_RESPAWNED} event`, () => {
            const data = { playerId: mockPlayer.socketId, fromTile: { x: 2, y: 2 }, toTile: { x: 3, y: 3 }, isTeleport: false };
            socketCallbacks[SocketEvents.ROOM_USER_RESPAWNED](data);
            expect(mockPlayGameBoardManagerService.movePlayer).toHaveBeenCalledWith(data.playerId, data.fromTile, data.toTile, data.isTeleport);
            expect(mockPlayGameBoardManagerService.continueTurn).toHaveBeenCalled();
        });

        it(`should handle ${SocketEvents.ROOM_USER_DID_DOOR_ACTION} event`, () => {
            const tileCoordinate = { x: 4, y: 4 };
            socketCallbacks[SocketEvents.ROOM_USER_DID_DOOR_ACTION]({ tileCoordinate: tileCoordinate, playerId: mockPlayer.socketId });
            expect(mockPlayGameBoardManagerService.playerUsedAction).toHaveBeenCalledWith(mockPlayer.socketId);
            expect(mockPlayGameBoardManagerService.toggleDoor).toHaveBeenCalledWith(tileCoordinate);
        });

        it(`should handle ${SocketEvents.ROOM_USER_DID_BATTLE_ACTION} event`, () => {
            const data = { playerId: mockPlayer.socketId, enemyPlayerId: 'enemy1' };
            socketCallbacks[SocketEvents.ROOM_USER_DID_BATTLE_ACTION](data);
            expect(mockPlayGameBoardManagerService.playerUsedAction).toHaveBeenCalledWith(data.playerId);
            expect(mockPlayGameBoardManagerService.startBattle).toHaveBeenCalledWith(data.playerId, data.enemyPlayerId);
        });

        it(`should handle ${SocketEvents.START_BATTLE_TURN} event`, () => {
            // eslint-disable-next-line
            (mockSocket as any).id = mockPlayer.socketId;
            socketCallbacks[SocketEvents.START_BATTLE_TURN](mockPlayer.socketId);
            expect(mockPlayGameBoardManagerService.currentPlayerIdTurn).toBe(mockPlayer.socketId);
            expect(mockPlayGameBoardManagerService.isUserTurn).toBeTrue();
            expect(mockBattleManagerService.currentPlayerIdTurn).toBe(mockPlayer.socketId);
            expect(mockBattleManagerService.isUserTurn).toBeTrue();
        });

        it(`should handle ${SocketEvents.START_VIRTUAL_PLAYER_BATTLE_TURN} event`, () => {
            const data = {
                playerId: mockPlayer.socketId,
                enemyId: 'player2',
                virtualPlayerRemainingHealth: 0,
                enemyRemainingHealth: 0,
                virtualPlayerRemainingEvasions: 0,
            };
            socketCallbacks[SocketEvents.START_VIRTUAL_PLAYER_BATTLE_TURN](data);
            expect(mockVirtualPlayerBattleManagerService.startTurn).toHaveBeenCalledWith(
                data.playerId,
                data.enemyId,
                data.virtualPlayerRemainingHealth,
                data.enemyRemainingHealth,
                data.virtualPlayerRemainingEvasions,
            );
        });

        it(`should handle ${SocketEvents.OPPONENT_ATTACKED} event`, () => {
            const attackResult = 75;
            socketCallbacks[SocketEvents.OPPONENT_ATTACKED](attackResult);
            expect(mockBattleManagerService.onOpponentAttack).toHaveBeenCalledWith(attackResult);
        });

        it(`should handle ${SocketEvents.OPPONENT_TRIED_ESCAPE} event`, () => {
            socketCallbacks[SocketEvents.OPPONENT_TRIED_ESCAPE]();
            expect(mockBattleManagerService.onOpponentEscape).toHaveBeenCalled();
        });

        it(`should handle ${SocketEvents.AUTOMATIC_ATTACK} event`, () => {
            socketCallbacks[SocketEvents.AUTOMATIC_ATTACK]();
            expect(mockBattleManagerService.onUserAttack).toHaveBeenCalled();
        });

        it(`should handle ${SocketEvents.SUCCESSFUL_ATTACK} event`, () => {
            socketCallbacks[SocketEvents.SUCCESSFUL_ATTACK]();
            expect(mockBattleManagerService.onSuccessfulAttack).toHaveBeenCalled();
        });

        it(`should handle ${SocketEvents.BATTLE_ENDED_BY_ESCAPE} event`, () => {
            // eslint-disable-next-line
            (mockSocket as any).id = mockPlayer.socketId;
            socketCallbacks[SocketEvents.BATTLE_ENDED_BY_ESCAPE](mockPlayer.socketId);
            expect(mockPlayGameBoardManagerService.currentPlayerIdTurn).toBe(mockPlayer.socketId);
            expect(mockPlayGameBoardManagerService.isUserTurn).toBeTrue();
            expect(mockBattleManagerService.endBattle).toHaveBeenCalled();
            expect(mockPlayGameBoardManagerService.continueTurn).toHaveBeenCalled();
        });

        it(`should handle ${SocketEvents.FIRST_PLAYER_WON_BATTLE} event`, () => {
            const data = { firstPlayer: mockPlayer.socketId, loserPlayer: 'player2' };
            // eslint-disable-next-line
            (mockSocket as any).id = mockPlayer.socketId;
            socketCallbacks[SocketEvents.FIRST_PLAYER_WON_BATTLE](data);
            expect(mockPlayGameBoardManagerService.currentPlayerIdTurn).toBe(data.firstPlayer);
            expect(mockPlayGameBoardManagerService.isUserTurn).toBeTrue();
            expect(mockBattleManagerService.endBattle).toHaveBeenCalled();
            expect(mockPlayGameBoardManagerService.endBattleByDeath).toHaveBeenCalledWith(data.firstPlayer, data.loserPlayer);
        });

        it(`should handle ${SocketEvents.SECOND_PLAYER_WON_BATTLE} event`, () => {
            const data = { winnerPlayer: 'player2', loserPlayer: 'player1' };
            socketCallbacks[SocketEvents.SECOND_PLAYER_WON_BATTLE](data);
            expect(mockBattleManagerService.endBattle).toHaveBeenCalled();
            expect(mockPlayGameBoardManagerService.endBattleByDeath).toHaveBeenCalledWith(data.winnerPlayer, data.loserPlayer);
        });

        it(`should handle ${SocketEvents.VIRTUAL_PLAYER_WON_BATTLE} event`, () => {
            socketCallbacks[SocketEvents.VIRTUAL_PLAYER_WON_BATTLE](mockPlayer.socketId);
            expect(mockVirtualPlayerManagerService.wonBattle).toHaveBeenCalledWith(mockPlayer.socketId);
        });

        it(`should handle ${SocketEvents.VIRTUAL_PLAYER_LOST_BATTLE} event`, () => {
            socketCallbacks[SocketEvents.VIRTUAL_PLAYER_LOST_BATTLE](mockPlayer.socketId);
            expect(mockVirtualPlayerManagerService.lostBattle).toHaveBeenCalledWith(mockPlayer.socketId);
        });

        it(`should handle ${SocketEvents.GAME_BOARD_PLAYER_WON} event and leave game after timeout`, fakeAsync(() => {
            const data = { playerTurnId: mockPlayer.socketId, gameStatistics: {} as GameStatistics };
            spyOn(service, 'goToStatisticsPage');
            socketCallbacks[SocketEvents.GAME_BOARD_PLAYER_WON](data);
            expect(mockPlayGameBoardManagerService.endGame).toHaveBeenCalledWith(data.playerTurnId);
            expect(mockGameStatisticsService.initGameStatistics).toHaveBeenCalledWith(data.gameStatistics);

            tick(5000);
            expect(service.goToStatisticsPage).toHaveBeenCalled();
        }));

        it(`should handle ${SocketEvents.LAST_PLAYER_STANDING} event and leave game`, () => {
            spyOn(window, 'alert');
            spyOn(service, 'leaveGame');
            socketCallbacks[SocketEvents.LAST_PLAYER_STANDING]();
            expect(window.alert).toHaveBeenCalledWith('Tous les autres joueurs ont quitté la partie. Fin de partie');
            expect(service.leaveGame).toHaveBeenCalled();
        });
    });
});
