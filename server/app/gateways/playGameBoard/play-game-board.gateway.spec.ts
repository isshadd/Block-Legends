import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { PlayGameBoardGateway } from './play-game-board.gateway';
import { PlayGameBoardSocketService } from '@app/services/gateway-services/play-game-board-socket/play-game-board-socket.service';
import { PlayGameBoardTimeService } from '@app/services/gateway-services/play-game-board-time/play-game-board-time.service';
import { PlayGameBoardBattleService } from '@app/services/gateway-services/play-game-board-battle-time/play-game-board-battle.service';
import { GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { Logger } from '@nestjs/common';
import { GameTimerState } from '@common/enums/game.timer.state';
import { MapSize } from '@common/enums/map-size';
import { GameMode } from '@common/enums/game-mode';
import { ItemType } from '@common/enums/item-type';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { SocketEvents } from '@common/enums/gateway-events/socket-events';

describe('PlayGameBoardGateway', () => {
    let gateway: PlayGameBoardGateway;
    let playGameBoardSocketService: jest.Mocked<PlayGameBoardSocketService>;
    let playGameBoardTimeService: jest.Mocked<PlayGameBoardTimeService>;
    let playGameBoardBattleService: jest.Mocked<PlayGameBoardBattleService>;
    let gameSocketRoomService: jest.Mocked<GameSocketRoomService>;
    let mockServer: Partial<Server>;

    const mockRoom = {
        id: 'room1',
        accessCode: 123,
        players: [
            {
                socketId: 'player1',
                attributes: {
                    speed: 10,
                    life: 100,
                    attack: 0,
                    defense: 0,
                },
                avatar: undefined,
                name: 'player1',
            } as PlayerCharacter,
            {
                socketId: 'player2',
                attributes: {
                    speed: 15,
                    life: 100,
                    attack: 0,
                    defense: 0,
                },
                avatar: undefined,
                name: 'player2',
            } as PlayerCharacter,
        ],
        organizer: 'player1',
        isLocked: false,
        maxPlayers: 2,
        currentPlayerTurn: 'player1',
    };

    const mockGame = {
        name: '',
        description: '',
        size: MapSize.SMALL,
        mode: GameMode.Classique,
        imageUrl: '',
        isVisible: false,
        tiles: [],
    };

    const mockGameBoardRoom = {
        game: mockGame,
        spawnPlaces: [
            [0, 'player1'],
            [1, 'player2'],
            [2, 'player3'],
            [3, 'player4'],
        ] as [number, string][],
        turnOrder: ['player1', 'player2', 'player3', 'player4'],
    };
    const mockGameTimer = {
        time: 0,
        isPaused: false,
        state: GameTimerState.ActiveTurn,
    };

    const battleRoom = {
        time: 3,
        firstPlayerId: 'player1',
        secondPlayerId: 'player2',
        isFirstPlayerTurn: true,
        firstPlayerRemainingEvades: 2,
        secondPlayerRemainingEvades: 2,
        firstPlayerRemainingLife: 100,
        secondPlayerRemainingLife: 100,
    };

    beforeEach(async () => {
        playGameBoardSocketService = {
            initRoomGameBoard: jest.fn(),
            changeTurn: jest.fn(),
        } as any;

        playGameBoardTimeService = {
            setTimerPreparingTurn: jest.fn(),
            setTimerActiveTurn: jest.fn(),
            pauseTimer: jest.fn(),
            resumeTimer: jest.fn(),
            signalRoomTimePassed$: {
                subscribe: jest.fn(),
            },
            signalRoomTimeOut$: {
                subscribe: jest.fn(),
            },
        } as any;

        playGameBoardBattleService = {
            createBattleTimer: jest.fn(),
            endBattleTurn: jest.fn(),
            getPlayerBattleTurn: jest.fn(),
            userSucceededAttack: jest.fn(),
            userUsedEvade: jest.fn(),
            battleRoomFinished: jest.fn(),
            signalRoomTimeOut$: {
                subscribe: jest.fn(),
            },
            signalRoomTimePassed$: {
                subscribe: jest.fn(),
            },
        } as any;

        gameSocketRoomService = {
            getRoomByAccessCode: jest.fn(),
            getRoomBySocketId: jest.fn(),
            gameBoardRooms: new Map(),
            gameTimerRooms: new Map(),
            gameBattleRooms: new Map(),
            signalPlayerLeftRoom$: {
                subscribe: jest.fn(),
            },
        } as any;

        mockServer = {
            emit: jest.fn(),
            to: jest.fn().mockReturnThis(),
        };

        jest.spyOn(Logger.prototype, 'log').mockImplementation(jest.fn());
        jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayGameBoardGateway,
                { provide: PlayGameBoardSocketService, useValue: playGameBoardSocketService },
                { provide: PlayGameBoardTimeService, useValue: playGameBoardTimeService },
                { provide: PlayGameBoardBattleService, useValue: playGameBoardBattleService },
                { provide: GameSocketRoomService, useValue: gameSocketRoomService },
            ],
        }).compile();

        gateway = module.get<PlayGameBoardGateway>(PlayGameBoardGateway);
        (gateway as any).server = mockServer;

        // Setup default returns
        gameSocketRoomService.getRoomBySocketId.mockReturnValue(mockRoom);
        gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
        gameSocketRoomService.gameBoardRooms.set(mockRoom.accessCode, mockGameBoardRoom);
        gameSocketRoomService.gameTimerRooms.set(mockRoom.accessCode, mockGameTimer);
        gameSocketRoomService.gameBattleRooms.set(mockRoom.accessCode, battleRoom);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Constructor and Event Subscriptions', () => {
        it('should set up all subscriptions', () => {
            expect(playGameBoardTimeService.signalRoomTimePassed$.subscribe).toHaveBeenCalled();
            expect(playGameBoardTimeService.signalRoomTimeOut$.subscribe).toHaveBeenCalled();
            expect(gameSocketRoomService.signalPlayerLeftRoom$.subscribe).toHaveBeenCalled();
            expect(playGameBoardBattleService.signalRoomTimeOut$.subscribe).toHaveBeenCalled();
            expect(playGameBoardBattleService.signalRoomTimePassed$.subscribe).toHaveBeenCalled();
        });

        it('should handle signal emissions', () => {
            const timePassedCallback = (playGameBoardTimeService.signalRoomTimePassed$.subscribe as jest.Mock).mock.calls[0][0];
            const timeOutCallback = (playGameBoardTimeService.signalRoomTimeOut$.subscribe as jest.Mock).mock.calls[0][0];
            const playerLeftCallback = (gameSocketRoomService.signalPlayerLeftRoom$.subscribe as jest.Mock).mock.calls[0][0];
            const battleTimeOutCallback = (playGameBoardBattleService.signalRoomTimeOut$.subscribe as jest.Mock).mock.calls[0][0];
            const battleSecondPassedCallback = (playGameBoardBattleService.signalRoomTimePassed$.subscribe as jest.Mock).mock.calls[0][0];

            timePassedCallback(mockRoom.accessCode);
            timeOutCallback(mockRoom.accessCode);
            playerLeftCallback({ accessCode: mockRoom.accessCode, playerSocketId: 'player1' });
            battleTimeOutCallback(mockRoom.accessCode);
            battleSecondPassedCallback(mockRoom.accessCode);

            expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
        });
    });

    describe('handleInitGameBoard', () => {
        it('should initialize game board when room exists', () => {
            const mockClient = { id: 'player1', emit: jest.fn() } as any;
            gameSocketRoomService.gameBoardRooms.set(mockRoom.accessCode, mockGameBoardRoom);

            gateway.handleInitGameBoard(mockClient);

            expect(mockClient.emit).toHaveBeenCalledWith(SocketEvents.INIT_GAME_BOARD_PARAMETERS, mockGameBoardRoom);
            expect(playGameBoardTimeService.setTimerPreparingTurn).toHaveBeenCalledWith(mockRoom.accessCode);
            expect(playGameBoardTimeService.resumeTimer).toHaveBeenCalledWith(mockRoom.accessCode);
        });

        it('should emit error when room does not exist', () => {
            const mockClient = { id: 'player1', emit: jest.fn() } as any;
            gameSocketRoomService.gameBoardRooms.clear();

            gateway.handleInitGameBoard(mockClient);

            expect(mockClient.emit).toHaveBeenCalledWith(SocketEvents.ERROR, { message: 'Room pas trouvé' });
        });

        it('should return early if no room found for socket', () => {
            const mockClient = { id: 'player1', emit: jest.fn() } as any;
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

            gateway.handleInitGameBoard(mockClient);

            expect(mockClient.emit).not.toHaveBeenCalled();
        });
    });

    describe('handleUserEndTurn', () => {
        it('should handle time out if it is client turn', () => {
            const mockClient = { id: 'player1' } as Socket;
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
            jest.spyOn(gateway, 'handleTimeOut').mockImplementation(jest.fn());

            gateway.handleUserEndTurn(mockClient);

            expect(gateway.handleTimeOut).toHaveBeenCalledWith(mockRoom.accessCode);
        });

        it('should do nothing if it is not client turn', () => {
            const mockClient = { id: 'player1' } as Socket;
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);
            jest.spyOn(gateway, 'handleTimeOut').mockImplementation(jest.fn());

            gateway.handleUserEndTurn(mockClient);

            expect(gateway.handleTimeOut).not.toHaveBeenCalled();
        });
    });

    describe('handleUserStartedMoving', () => {
        it('should pause timer and emit when it is client turn', () => {
            const mockClient = { id: 'player1', emit: jest.fn() } as any;
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);

            gateway.handleUserStartedMoving(mockClient);

            expect(mockClient.emit).toHaveBeenCalledWith(SocketEvents.USER_DID_MOVE);
            expect(playGameBoardTimeService.pauseTimer).toHaveBeenCalledWith(mockRoom.accessCode);
        });

        it('should do nothing when it is not client turn', () => {
            const mockClient = { id: 'player1', emit: jest.fn() } as any;
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);

            gateway.handleUserStartedMoving(mockClient);

            expect(mockClient.emit).not.toHaveBeenCalled();
            expect(playGameBoardTimeService.pauseTimer).not.toHaveBeenCalled();
        });
    });

    describe('handleUserFinishedMoving', () => {
        it('should resume timer and emit when it is client turn', () => {
            const mockClient = { id: 'player1', emit: jest.fn() } as any;
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);

            gateway.handleUserFinishedMoving(mockClient);

            expect(mockClient.emit).toHaveBeenCalledWith(SocketEvents.USER_FINISHED_MOVE);
            expect(playGameBoardTimeService.resumeTimer).toHaveBeenCalledWith(mockRoom.accessCode);
        });

        it('should do nothing when it is not client turn', () => {
            const mockClient = { id: 'player1', emit: jest.fn() } as any;
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);

            gateway.handleUserFinishedMoving(mockClient);

            expect(mockClient.emit).not.toHaveBeenCalled();
            expect(playGameBoardTimeService.resumeTimer).not.toHaveBeenCalled();
        });
    });

    describe('handleUserMoved', () => {
        it('should emit room user moved when it is client turn', () => {
            const mockClient = { id: 'player1' } as Socket;
            const moveData = {
                fromTile: { x: 1, y: 1 },
                toTile: { x: 2, y: 2 },
                isTeleport: false,
            };
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);

            gateway.handleUserMoved(mockClient, moveData);

            expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.ROOM_USER_MOVED, {
                playerId: mockClient.id,
                fromTile: moveData.fromTile,
                toTile: moveData.toTile,
                isTeleport: moveData.isTeleport,
            });
        });

        it('should do nothing when it is not client turn', () => {
            const mockClient = { id: 'player1' } as Socket;
            const moveData = {
                fromTile: { x: 1, y: 1 },
                toTile: { x: 2, y: 2 },
                isTeleport: false,
            };
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);

            gateway.handleUserMoved(mockClient, moveData);

            expect(mockServer.to).not.toHaveBeenCalled();
        });
    });

    describe('handleUserGrabbedItem', () => {
        it('should emit room user grabbed item when room exists', () => {
            const mockClient = { id: 'player1' } as Socket;
            const itemData = {
                itemType: ItemType.EnchantedBook,
                tileCoordinates: { x: 1, y: 1 },
            };

            gateway.handleUserGrabbedItem(mockClient, itemData);

            expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.ROOM_USER_GRABBED_ITEM, {
                playerId: mockClient.id,
                itemType: itemData.itemType,
                tileCoordinate: itemData.tileCoordinates,
            });
        });

        it('should do nothing when room does not exist', () => {
            const mockClient = { id: 'player1' } as Socket;
            const itemData = {
                itemType: ItemType.EnchantedBook,
                tileCoordinates: { x: 1, y: 1 },
            };
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

            gateway.handleUserGrabbedItem(mockClient, itemData);

            expect(mockServer.to).not.toHaveBeenCalled();
        });
    });

    describe('handleUserThrewItem', () => {
        it('should emit room user threw item when room exists', () => {
            const mockClient = { id: 'player1' } as Socket;
            const itemData = {
                itemType: ItemType.EnchantedBook,
                tileCoordinates: { x: 1, y: 1 },
            };

            gateway.handleUserThrewItem(mockClient, itemData);

            expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.ROOM_USER_THREW_ITEM, {
                playerId: mockClient.id,
                itemType: itemData.itemType,
                tileCoordinate: itemData.tileCoordinates,
            });
        });

        it('should do nothing when room does not exist', () => {
            const mockClient = { id: 'player1' } as Socket;
            const itemData = {
                itemType: ItemType.EnchantedBook,
                tileCoordinates: { x: 1, y: 1 },
            };
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

            gateway.handleUserThrewItem(mockClient, itemData);

            expect(mockServer.to).not.toHaveBeenCalled();
        });
    });

    describe('handleUserRespawned', () => {
        it('should emit room user respawned when room exists', () => {
            const mockClient = { id: 'player1' } as Socket;
            const respawnData = {
                fromTile: { x: 1, y: 1 },
                toTile: { x: 2, y: 2 },
            };

            gateway.handleUserRespawned(mockClient, respawnData);

            expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.ROOM_USER_RESPAWNED, {
                playerId: mockClient.id,
                fromTile: respawnData.fromTile,
                toTile: respawnData.toTile,
            });
        });

        it('should do nothing when room does not exist', () => {
            const mockClient = { id: 'player1' } as Socket;
            const respawnData = {
                fromTile: { x: 1, y: 1 },
                toTile: { x: 2, y: 2 },
            };
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

            gateway.handleUserRespawned(mockClient, respawnData);

            expect(mockServer.to).not.toHaveBeenCalled();
        });
    });

    describe('handleUserDidDoorAction', () => {
        it('should emit room user did door action when it is client turn', () => {
            const mockClient = { id: 'player1' } as Socket;
            const tileCoordinate = { x: 1, y: 1 };
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);

            gateway.handleUserDidDoorAction(mockClient, tileCoordinate);

            expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.ROOM_USER_DID_DOOR_ACTION, {
                playerId: mockClient.id,
                tileCoordinate,
            });
        });

        it('should do nothing when it is not client turn', () => {
            const mockClient = { id: 'player1' } as Socket;
            const tileCoordinate = { x: 1, y: 1 };
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);

            gateway.handleUserDidDoorAction(mockClient, tileCoordinate);

            expect(mockServer.to).not.toHaveBeenCalled();
        });
    });

    describe('handleUserDidBattleAction', () => {
        it('should start battle and emit room user did battle action when it is client turn', () => {
            const mockClient = { id: 'player1' } as Socket;
            const enemyPlayerId = 'player2';
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
            jest.spyOn(gateway, 'handleStartBattle').mockImplementation(jest.fn());

            gateway.handleUserDidBattleAction(mockClient, enemyPlayerId);

            expect(gateway.handleStartBattle).toHaveBeenCalledWith(mockRoom.accessCode, mockClient.id, enemyPlayerId);
            expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.ROOM_USER_DID_BATTLE_ACTION, {
                playerId: mockClient.id,
                enemyPlayerId,
            });
        });

        it('should do nothing when it is not client turn', () => {
            const mockClient = { id: 'player1' } as Socket;
            const enemyPlayerId = 'player2';
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);
            jest.spyOn(gateway, 'handleStartBattle').mockImplementation(jest.fn());

            gateway.handleUserDidBattleAction(mockClient, enemyPlayerId);

            expect(gateway.handleStartBattle).not.toHaveBeenCalled();
            expect(mockServer.to).not.toHaveBeenCalled();
        });
    });

    describe('handleUserAttacked', () => {
        it('should handle successful attack without player death', () => {
            const mockClient = { id: 'player1' } as Socket;
            const attackData = {
                attackResult: 10,
                playerHasTotem: false,
            };

            playGameBoardBattleService.userSucceededAttack.mockReturnValue(false);
            jest.spyOn(gateway, 'endBattleTurn').mockImplementation(jest.fn());

            gateway.handleUserAttacked(mockClient, attackData);

            expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.OPPONENT_ATTACKED, attackData.attackResult);
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.SUCCESSFUL_ATTACK);
            expect(gateway.endBattleTurn).toHaveBeenCalledWith(mockRoom.accessCode);
        });

        it('should handle successful attack with player death', () => {
            const mockClient = { id: 'player1' } as Socket;
            const attackData = {
                attackResult: 10,
                playerHasTotem: false,
            };

            playGameBoardBattleService.userSucceededAttack.mockReturnValue(true);
            jest.spyOn(gateway, 'handleBattleEndedByDeath').mockImplementation(jest.fn());

            gateway.handleUserAttacked(mockClient, attackData);

            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.SUCCESSFUL_ATTACK);
            expect(gateway.handleBattleEndedByDeath).toHaveBeenCalledWith(mockRoom.accessCode, mockClient.id);
        });

        it('should handle failed attack', () => {
            const mockClient = { id: 'player1' } as Socket;
            const attackData = {
                attackResult: 0,
                playerHasTotem: false,
            };

            jest.spyOn(gateway, 'endBattleTurn').mockImplementation(jest.fn());

            gateway.handleUserAttacked(mockClient, attackData);

            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.OPPONENT_ATTACKED, attackData.attackResult);
            expect(gateway.endBattleTurn).toHaveBeenCalledWith(mockRoom.accessCode);
        });

        it('should do nothing when room does not exist', () => {
            const mockClient = { id: 'player1' } as Socket;
            const attackData = {
                attackResult: 10,
                playerHasTotem: false,
            };
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

            gateway.handleUserAttacked(mockClient, attackData);

            expect(mockServer.to).not.toHaveBeenCalled();
        });
    });

    describe('handleUserTriedEscape', () => {
        it('should handle successful escape', () => {
            const mockClient = { id: 'player1' } as Socket;
            playGameBoardBattleService.userUsedEvade.mockReturnValue(true);
            jest.spyOn(gateway, 'handleBattleEndedByEscape').mockImplementation(jest.fn());

            gateway.handleUserTriedEscape(mockClient);

            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.OPPONENT_TRIED_ESCAPE);
            expect(gateway.handleBattleEndedByEscape).toHaveBeenCalledWith(mockRoom.accessCode);
        });

        it('should handle failed escape', () => {
            const mockClient = { id: 'player1' } as Socket;
            playGameBoardBattleService.userUsedEvade.mockReturnValue(false);
            jest.spyOn(gateway, 'endBattleTurn').mockImplementation(jest.fn());

            gateway.handleUserTriedEscape(mockClient);

            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.OPPONENT_TRIED_ESCAPE);
            expect(gateway.endBattleTurn).toHaveBeenCalledWith(mockRoom.accessCode);
        });

        it('should do nothing when room does not exist', () => {
            const mockClient = { id: 'player1' } as Socket;
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

            gateway.handleUserTriedEscape(mockClient);

            expect(mockServer.to).not.toHaveBeenCalled();
        });
    });

    describe('handleUserWon', () => {
        it('should pause timer and emit game board player won', () => {
            const mockClient = { id: 'player1' } as Socket;

            gateway.handleUserWon(mockClient);

            expect(playGameBoardTimeService.pauseTimer).toHaveBeenCalledWith(mockRoom.accessCode);
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.GAME_BOARD_PLAYER_WON, mockClient.id);
        });

        it('should do nothing when room does not exist', () => {
            const mockClient = { id: 'player1' } as Socket;
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

            gateway.handleUserWon(mockClient);

            expect(playGameBoardTimeService.pauseTimer).not.toHaveBeenCalled();
            expect(mockServer.to).not.toHaveBeenCalled();
        });
    });

    describe('isClientTurn', () => {
        it('should return true when it is client turn and timer is active', () => {
            const mockClient = { id: 'player1' } as Socket;
            gameSocketRoomService.gameTimerRooms.get = jest.fn().mockReturnValue({
                state: GameTimerState.ActiveTurn,
            });

            const result = gateway.isClientTurn(mockClient);

            expect(result).toBe(true);
        });

        it('should return false when room does not exist', () => {
            const mockClient = { id: 'player1' } as Socket;
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

            const result = gateway.isClientTurn(mockClient);

            expect(result).toBe(false);
        });

        it('should return false when it is not client turn', () => {
            const mockClient = { id: 'player2' } as Socket;
            gameSocketRoomService.gameTimerRooms.get = jest.fn().mockReturnValue({
                state: GameTimerState.ActiveTurn,
            });

            const result = gateway.isClientTurn(mockClient);

            expect(result).toBe(false);
        });

        it('should return false when timer is not in active turn state', () => {
            const mockClient = { id: 'player1' } as Socket;
            gameSocketRoomService.gameTimerRooms.get = jest.fn().mockReturnValue({
                state: GameTimerState.PreparingTurn,
            });

            const result = gateway.isClientTurn(mockClient);

            expect(result).toBe(false);
        });
    });

    describe('Game Flow Methods', () => {
        describe('startRoomGame', () => {
            it('should initialize game board and emit game started', () => {
                gateway.startRoomGame(mockRoom.accessCode);

                expect(playGameBoardSocketService.initRoomGameBoard).toHaveBeenCalledWith(mockRoom.accessCode);
                expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.GAME_STARTED);
            });
        });
        describe('updateRoomTime', () => {
            it('should emit set time with current timer value', () => {
                const mockTime = 30;
                gameSocketRoomService.gameTimerRooms.get = jest.fn().mockReturnValue({ time: mockTime });

                gateway.updateRoomTime(mockRoom.accessCode);

                expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.SET_TIME, mockTime);
            });
        });
        describe('updateRoomTime', () => {
            it('should emit set time with current timer value', () => {
                const mockTime = 30;
                gameSocketRoomService.gameTimerRooms.get = jest.fn().mockReturnValue({ time: mockTime });

                gateway.updateRoomTime(mockRoom.accessCode);

                expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.SET_TIME, mockTime);
            });
        });
    });
    // Add these tests to the existing test suite

    describe('handleUserStartedMoving', () => {
        it('should emit USER_DID_MOVE when it is client turn', () => {
            const mockClient = { id: 'player1', emit: jest.fn() } as any;
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(mockRoom);

            gateway.handleUserStartedMoving(mockClient);

            expect(mockClient.emit).toHaveBeenCalledWith(SocketEvents.USER_DID_MOVE);
        });
    });

    describe('handlePlayerLeftRoom', () => {
        it('should filter out leaving player from spawn places and turn order', () => {
            const initialSpawnPlaces = [
                [0, 'player1'],
                [1, 'player2'],
            ] as [number, string][];

            const modifiedGameBoardRoom = {
                ...mockGameBoardRoom,
                spawnPlaces: initialSpawnPlaces,
                turnOrder: ['player1', 'player2'],
            };

            gameSocketRoomService.gameBoardRooms.set(mockRoom.accessCode, modifiedGameBoardRoom);
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            gateway.handlePlayerLeftRoom(mockRoom.accessCode, 'player1');

            const updatedGameBoardRoom = gameSocketRoomService.gameBoardRooms.get(mockRoom.accessCode);
            expect(updatedGameBoardRoom.spawnPlaces.length).toBe(1);
            expect(updatedGameBoardRoom.spawnPlaces[0][1]).toBe('player2');
            expect(updatedGameBoardRoom.turnOrder).toEqual(['player2']);
        });

        it('should handle battle room cases when player is neither first nor second player', () => {
            const battleRoomMock = {
                ...battleRoom,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
            };
            gameSocketRoomService.gameBoardRooms.set(mockRoom.accessCode, mockGameBoardRoom);
            gameSocketRoomService.gameBattleRooms.set(mockRoom.accessCode, battleRoomMock);
            jest.spyOn(gateway, 'handleBattleEndedByDeath').mockImplementation(jest.fn());

            gateway.handlePlayerLeftRoom(mockRoom.accessCode, 'player3');

            expect(gateway.handleBattleEndedByDeath).not.toHaveBeenCalled();
        });

        it('should handle preparing turn state when current player leaves', () => {
            const modifiedRoom = {
                ...mockRoom,
                currentPlayerTurn: 'player1',
            };
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(modifiedRoom);
            gameSocketRoomService.gameBoardRooms.set(mockRoom.accessCode, mockGameBoardRoom);
            gameSocketRoomService.gameTimerRooms.set(mockRoom.accessCode, {
                ...mockGameTimer,
                state: GameTimerState.PreparingTurn,
            });

            gateway.handlePlayerLeftRoom(mockRoom.accessCode, 'player1');

            expect(playGameBoardSocketService.changeTurn).toHaveBeenCalledWith(mockRoom.accessCode);
        });

        it('should emit GAME_BOARD_PLAYER_LEFT when not the last player', () => {
            const modifiedGameBoardRoom = {
                ...mockGameBoardRoom,
                turnOrder: ['player1', 'player2', 'player3'],
            };
            gameSocketRoomService.gameBoardRooms.set(mockRoom.accessCode, modifiedGameBoardRoom);
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            gateway.handlePlayerLeftRoom(mockRoom.accessCode, 'player1');

            expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.GAME_BOARD_PLAYER_LEFT, 'player1');
        });
    });
    describe('handleUserAttacked', () => {
        it('should handle successful attack without totem', () => {
            const mockClient = { id: 'player1' } as Socket;
            const attackData = { attackResult: 5, playerHasTotem: false };
            playGameBoardBattleService.userSucceededAttack.mockReturnValue(false);

            gateway.handleUserAttacked(mockClient, attackData);

            expect(playGameBoardBattleService.userSucceededAttack).toHaveBeenCalledWith(mockRoom.accessCode, false);
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.SUCCESSFUL_ATTACK);
        });

        it('should handle successful attack with totem', () => {
            const mockClient = { id: 'player1' } as Socket;
            const attackData = { attackResult: 5, playerHasTotem: true };
            playGameBoardBattleService.userSucceededAttack.mockReturnValue(false);

            gateway.handleUserAttacked(mockClient, attackData);

            expect(playGameBoardBattleService.userSucceededAttack).toHaveBeenCalledWith(mockRoom.accessCode, true);
        });

        it('should handle failed attack', () => {
            const mockClient = { id: 'player1' } as Socket;
            const attackData = { attackResult: 0, playerHasTotem: false };

            gateway.handleUserAttacked(mockClient, attackData);

            expect(playGameBoardBattleService.userSucceededAttack).not.toHaveBeenCalled();
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).not.toHaveBeenCalledWith(SocketEvents.SUCCESSFUL_ATTACK);
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.OPPONENT_ATTACKED, 0);
        });

        it('should handle null room case', () => {
            const mockClient = { id: 'player1' } as Socket;
            const attackData = { attackResult: 5, playerHasTotem: false };
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

            gateway.handleUserAttacked(mockClient, attackData);

            expect(mockServer.to).not.toHaveBeenCalled();
            expect(playGameBoardBattleService.userSucceededAttack).not.toHaveBeenCalled();
        });
    });

    describe('isClientTurn', () => {
        it('should handle null room case', () => {
            const mockClient = { id: 'player1' } as Socket;
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

            const result = gateway.isClientTurn(mockClient);

            expect(result).toBe(false);
        });
    });

    describe('handleUserStartedMoving', () => {
        it('should handle default client turn case', () => {
            const mockClient = { id: 'player1', emit: jest.fn() } as any;
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);

            gateway.handleUserStartedMoving(mockClient);

            expect(mockClient.emit).toHaveBeenCalledWith(SocketEvents.USER_DID_MOVE);
            expect(playGameBoardTimeService.pauseTimer).toHaveBeenCalledWith(mockRoom.accessCode);
        });

        it('should handle when not client turn', () => {
            const mockClient = { id: 'player1', emit: jest.fn() } as any;
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);

            gateway.handleUserStartedMoving(mockClient);

            expect(mockClient.emit).not.toHaveBeenCalled();
            expect(playGameBoardTimeService.pauseTimer).not.toHaveBeenCalled();
        });
    });

    describe('handlePlayerLeftRoom', () => {
        it('should handle player leaving from battle when second player', () => {
            const mockBattleRoom = {
                ...battleRoom,
                firstPlayerId: 'player1',
                secondPlayerId: 'leavingPlayer',
            };
            gameSocketRoomService.gameBattleRooms.set(mockRoom.accessCode, mockBattleRoom);
            jest.spyOn(gateway, 'handleBattleEndedByDeath').mockImplementation(jest.fn());

            gateway.handlePlayerLeftRoom(mockRoom.accessCode, 'leavingPlayer');

            expect(gateway.handleBattleEndedByDeath).toHaveBeenCalledWith(mockRoom.accessCode, mockBattleRoom.firstPlayerId);
        });

        it('should not handle battle case when battle room does not exist', () => {
            gameSocketRoomService.gameBattleRooms.set(mockRoom.accessCode, null);
            jest.spyOn(gateway, 'handleBattleEndedByDeath').mockImplementation(jest.fn());

            gateway.handlePlayerLeftRoom(mockRoom.accessCode, 'player1');

            expect(gateway.handleBattleEndedByDeath).not.toHaveBeenCalled();
        });
    });
});
