import { Game } from '@app/model/database/game';
import {
    GameBattle,
    GameBoardParameters,
    GameRoom,
    GameSocketRoomService,
    GameTimer,
    GameTimerState,
} from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { PlayGameBoardBattleService } from '@app/services/gateway-services/play-game-board-battle-time/play-game-board-battle.service';
import { PlayGameBoardSocketService } from '@app/services/gateway-services/play-game-board-socket/play-game-board-socket.service';
import { PlayGameBoardTimeService } from '@app/services/gateway-services/play-game-board-time/play-game-board-time.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { PlayGameBoardGateway } from './play-game-board.gateway';

describe('PlayGameBoardGateway', () => {
    let gateway: PlayGameBoardGateway;
    let playGameBoardSocketService: jest.Mocked<PlayGameBoardSocketService>;
    let playGameBoardTimeService: jest.Mocked<PlayGameBoardTimeService>;
    let playGameBoardBattleService: jest.Mocked<PlayGameBoardBattleService>;
    let gameSocketRoomService: jest.Mocked<GameSocketRoomService>;
    let loggerLogSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;
    let mockServer: Partial<Server>;

    const mockRoom: GameRoom = {
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
            },
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
            },
        ],
        organizer: 'player1',
        isLocked: false,
        maxPlayers: 2,
        currentPlayerTurn: 'player1',
    };

    const mockGame: Game = {
        name: '',
        description: '',
        size: MapSize.SMALL,
        mode: GameMode.Classique,
        imageUrl: '',
        isVisible: false,
        tiles: [],
    };

    const mockGameBoardRoom: GameBoardParameters = {
        game: mockGame,
        spawnPlaces: [],
        turnOrder: ['player1', 'player2'],
    };

    const mockGameTimer: GameTimer = {
        time: 0,
        isPaused: false,
        state: GameTimerState.ActiveTurn,
    };

    const battleRoom: GameBattle = {
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
            userSuccededAttack: jest.fn(),
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
            gameBoardRooms: new Map<number, GameBoardParameters>(),
            gameTimerRooms: new Map<number, any>(),
            gameBattleRooms: new Map<number, any>(),
            setCurrentPlayerTurn: jest.fn(),
            setSpawnCounter: jest.fn(),
            signalPlayerLeftRoom$: {
                subscribe: jest.fn(),
            },
        } as any;

        mockServer = {
            emit: jest.fn(),
            to: jest.fn().mockReturnThis(),
        };

        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
        loggerLogSpy = jest.spyOn(Logger.prototype, 'log');
        loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayGameBoardGateway,
                { provide: PlayGameBoardSocketService, useValue: playGameBoardSocketService },
                { provide: PlayGameBoardTimeService, useValue: playGameBoardTimeService },
                { provide: PlayGameBoardBattleService, useValue: playGameBoardBattleService },
                { provide: GameSocketRoomService, useValue: gameSocketRoomService },
                {
                    provide: 'WEB_SOCKET_SERVER',
                    useValue: mockServer,
                },
            ],
        }).compile();

        gateway = module.get<PlayGameBoardGateway>(PlayGameBoardGateway);
        (gateway as any).server = mockServer as Server;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('PlayGameBoardGateway Constructor', () => {
        it('should set up subscriptions and call corresponding methods on emission', () => {
            const mockUpdateRoomTime = jest.spyOn(gateway, 'updateRoomTime').mockImplementation(() => {});
            const mockHandleTimeOut = jest.spyOn(gateway, 'handleTimeOut').mockImplementation(() => {});
            const mockHandlePlayerLeftRoom = jest.spyOn(gateway, 'handlePlayerLeftRoom').mockImplementation(() => {});
            const mockHandleBattleTimeOut = jest.spyOn(gateway, 'handleBattleTimeOut').mockImplementation(() => {});
            const mockHandleBattleSecondPassed = jest.spyOn(gateway, 'handleBattleSecondPassed').mockImplementation(() => {});

            const accessCode = 123;
            const playerSocketId = 'player1';

            const timePassedCallback = (playGameBoardTimeService.signalRoomTimePassed$.subscribe as jest.Mock).mock.calls[0][0];
            const timeOutCallback = (playGameBoardTimeService.signalRoomTimeOut$.subscribe as jest.Mock).mock.calls[0][0];
            const playerLeftCallback = (gameSocketRoomService.signalPlayerLeftRoom$.subscribe as jest.Mock).mock.calls[0][0];
            const battleTimeOutCallback = (playGameBoardBattleService.signalRoomTimeOut$.subscribe as jest.Mock).mock.calls[0][0];
            const battleSecondPassedCallback = (playGameBoardBattleService.signalRoomTimePassed$.subscribe as jest.Mock).mock.calls[0][0];

            timePassedCallback(accessCode);
            expect(mockUpdateRoomTime).toHaveBeenCalledWith(accessCode);

            timeOutCallback(accessCode);
            expect(mockHandleTimeOut).toHaveBeenCalledWith(accessCode);

            playerLeftCallback({ accessCode, playerSocketId });
            expect(mockHandlePlayerLeftRoom).toHaveBeenCalledWith(accessCode, playerSocketId);

            battleTimeOutCallback(accessCode);
            expect(mockHandleBattleTimeOut).toHaveBeenCalledWith(accessCode);

            battleSecondPassedCallback(accessCode);
            expect(mockHandleBattleSecondPassed).toHaveBeenCalledWith(accessCode);
        });
    });

    describe('handleInitGameBoard', () => {
        it('should initialize game board and set timers when room exists', () => {
            const accessCode = 1111;
            gameSocketRoomService.gameBoardRooms.set(accessCode, mockGameBoardRoom);
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            jest.spyOn(gateway, 'updateRoomTime').mockImplementation(() => {});

            const mockClient: Partial<Socket> = {
                emit: jest.fn(),
            };

            gateway.handleInitGameBoard(mockClient as Socket, accessCode);

            expect(mockClient.emit).toHaveBeenCalledWith('initGameBoardParameters', mockGameBoardRoom);
            expect(playGameBoardTimeService.setTimerPreparingTurn).toHaveBeenCalledWith(accessCode);
            expect(playGameBoardTimeService.resumeTimer).toHaveBeenCalledWith(accessCode);
            expect(gateway.updateRoomTime).toHaveBeenCalledWith(accessCode);
        });

        it('should emit error when room does not exist', () => {
            const accessCode = 2222;
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(undefined);
            jest.spyOn(gateway, 'updateRoomTime').mockImplementation(() => {});

            const mockClient: Partial<Socket> = {
                emit: jest.fn(),
            };

            gateway.handleInitGameBoard(mockClient as Socket, accessCode);

            expect(mockClient.emit).toHaveBeenCalledWith('error', { message: 'Room pas trouvé' });
            expect(playGameBoardTimeService.setTimerPreparingTurn).not.toHaveBeenCalled();
            expect(gateway.updateRoomTime).not.toHaveBeenCalled();
        });
    });

    describe('handleUserEndTurn', () => {
        it("should handle time out if it is client's turn", () => {
            const accessCode = 3333;
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            const mockClient: Partial<Socket> = {
                id: 'player1',
            };

            const isClientTurnSpy = jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
            const handleTimeOutSpy = jest.spyOn(gateway, 'handleTimeOut').mockImplementation(() => {});

            gateway.handleUserEndTurn(mockClient as Socket, accessCode);

            expect(isClientTurnSpy).toHaveBeenCalledWith(mockClient, accessCode);
            expect(handleTimeOutSpy).toHaveBeenCalledWith(accessCode);
        });

        it("should do nothing if it is not client's turn", () => {
            const accessCode = 4444;
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            const mockClient: Partial<Socket> = {
                id: 'player1',
            };

            const isClientTurnSpy = jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);
            const handleTimeOutSpy = jest.spyOn(gateway, 'handleTimeOut').mockImplementation(() => {});

            gateway.handleUserEndTurn(mockClient as Socket, accessCode);

            expect(isClientTurnSpy).toHaveBeenCalledWith(mockClient, accessCode);
            expect(handleTimeOutSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleUserMoved', () => {
        it("should emit roomUserMoved if it is client's turn", () => {
            const accessCode = 5555;
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            const mockClient: Partial<Socket> = {
                id: 'player1',
            };

            const moveData = {
                fromTile: { x: 1, y: 2 },
                toTile: { x: 3, y: 4 },
                accessCode: 5555,
            };

            const isClientTurnSpy = jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);

            gateway.handleUserMoved(mockClient as Socket, moveData);

            expect(isClientTurnSpy).toHaveBeenCalledWith(mockClient, moveData.accessCode);
            expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
            expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('roomUserMoved', {
                playerId: mockClient.id,
                fromTile: moveData.fromTile,
                toTile: moveData.toTile,
            });
        });

        it("should do nothing if it is not client's turn", () => {
            const accessCode = 6666;
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            const mockClient: Partial<Socket> = {
                id: 'player1',
            };

            const moveData = {
                fromTile: { x: 1, y: 2 },
                toTile: { x: 3, y: 4 },
                accessCode: 6666,
            };

            const isClientTurnSpy = jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);

            gateway.handleUserMoved(mockClient as Socket, moveData);

            expect(isClientTurnSpy).toHaveBeenCalledWith(mockClient, moveData.accessCode);
            expect(gateway.server.to).not.toHaveBeenCalled();
        });
    });

    describe('handleUserAttacked', () => {
        it('should emit opponentAttacked and successfulAttack if attack succeeded and player not dead', () => {
            const accessCode = 7777;
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
            gameSocketRoomService.gameTimerRooms.set(accessCode, mockGameTimer);
            jest.spyOn(gameSocketRoomService.gameBattleRooms, 'get').mockReturnValue(battleRoom);
            jest.spyOn(gateway, 'endBattleTurn').mockImplementation(() => {});

            const mockClient: Partial<Socket> = {
                id: 'player1',
            };

            const attackData = {
                attackResult: 1,
                accessCode: 7777,
            };

            const isValidRoomSpy = jest.spyOn(gateway, 'isValidRoom').mockReturnValue(true);
            playGameBoardBattleService.userSuccededAttack.mockReturnValue(false);

            gateway.handleUserAttacked(mockClient as Socket, attackData);

            expect(isValidRoomSpy).toHaveBeenCalledWith(attackData.accessCode);
            expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
            expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('opponentAttacked', attackData.attackResult);
            expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('successfulAttack');
            expect(playGameBoardBattleService.userSuccededAttack).toHaveBeenCalledWith(accessCode);
            expect(gateway.endBattleTurn).toHaveBeenCalledWith(accessCode);
        });

        it('should handle battle ended by death if attack resulted in player death', () => {
            const accessCode = 8888;
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);
            gameSocketRoomService.gameTimerRooms.set(accessCode, mockGameTimer);
            jest.spyOn(gateway, 'handleBattleEndedByDeath').mockImplementation(() => {});

            const mockClient: Partial<Socket> = {
                id: 'player1',
            };

            const attackData = {
                attackResult: 1,
                accessCode: 8888,
            };

            const isValidRoomSpy = jest.spyOn(gateway, 'isValidRoom').mockReturnValue(true);
            playGameBoardBattleService.userSuccededAttack.mockReturnValue(true);

            gateway.handleUserAttacked(mockClient as Socket, attackData);

            expect(isValidRoomSpy).toHaveBeenCalledWith(attackData.accessCode);
            expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
            expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('opponentAttacked', attackData.attackResult);
            expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('successfulAttack');
            expect(playGameBoardBattleService.userSuccededAttack).toHaveBeenCalledWith(accessCode);
            expect(gateway.handleBattleEndedByDeath).toHaveBeenCalledWith(accessCode, mockClient.id);
        });

        describe('PlayGameBoardGateway @SubscribeMessage Handlers', () => {
            let mockClient: Partial<Socket>;
            const accessCode = 1234;

            beforeEach(() => {
                mockClient = { id: 'player1', emit: jest.fn() };
                jest.spyOn(gateway.server, 'to').mockReturnThis();
            });

            afterEach(() => {
                jest.clearAllMocks();
            });

            describe('handleUserStartedMoving', () => {
                it("should pause timer if it is client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
                    gateway.handleUserStartedMoving(mockClient as Socket, accessCode);

                    expect(playGameBoardTimeService.pauseTimer).toHaveBeenCalledWith(accessCode);
                });

                it("should do nothing if it is not client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);
                    jest.spyOn(playGameBoardTimeService, 'pauseTimer').mockImplementation(() => {});

                    gateway.handleUserStartedMoving(mockClient as Socket, accessCode);

                    expect(playGameBoardTimeService.pauseTimer).not.toHaveBeenCalled();
                });
            });

            describe('handleUserFinishedMoving', () => {
                it("should resume timer if it is client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
                    gateway.handleUserFinishedMoving(mockClient as Socket, accessCode);

                    expect(playGameBoardTimeService.resumeTimer).toHaveBeenCalledWith(accessCode);
                });

                it("should do nothing if it is not client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);
                    gateway.handleUserFinishedMoving(mockClient as Socket, accessCode);

                    expect(playGameBoardTimeService.resumeTimer).not.toHaveBeenCalled();
                });
            });

            describe('handleUserMoved', () => {
                it("should emit roomUserMoved if it is client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);

                    const data = { fromTile: { x: 1, y: 1 }, toTile: { x: 2, y: 2 }, accessCode };
                    gateway.handleUserMoved(mockClient as Socket, data);

                    expect(gateway.server.to).toHaveBeenCalledWith(data.accessCode.toString());
                    expect(gateway.server.to(data.accessCode.toString()).emit).toHaveBeenCalledWith('roomUserMoved', {
                        playerId: mockClient.id,
                        fromTile: data.fromTile,
                        toTile: data.toTile,
                    });
                });

                it("should do nothing if it is not client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);

                    const data = { fromTile: { x: 1, y: 1 }, toTile: { x: 2, y: 2 }, accessCode };
                    gateway.handleUserMoved(mockClient as Socket, data);

                    expect(gateway.server.to).not.toHaveBeenCalled();
                });
            });

            describe('handleUserRespawned', () => {
                it('should emit roomUserRespawned', () => {
                    const data = { fromTile: { x: 1, y: 1 }, toTile: { x: 2, y: 2 }, accessCode };
                    gateway.handleUserRespawned(mockClient as Socket, data);

                    expect(gateway.server.to).toHaveBeenCalledWith(data.accessCode.toString());
                    expect(gateway.server.to(data.accessCode.toString()).emit).toHaveBeenCalledWith('roomUserRespawned', {
                        playerId: mockClient.id,
                        fromTile: data.fromTile,
                        toTile: data.toTile,
                    });
                });
            });

            describe('handleUserDidDoorAction', () => {
                it("should emit roomUserDidDoorAction if it is client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);

                    const data = { tileCoordinate: { x: 5, y: 5 }, accessCode };
                    gateway.handleUserDidDoorAction(mockClient as Socket, data);

                    expect(gateway.server.to).toHaveBeenCalledWith(data.accessCode.toString());
                    expect(gateway.server.to(data.accessCode.toString()).emit).toHaveBeenCalledWith('roomUserDidDoorAction', data.tileCoordinate);
                });

                it("should do nothing if it is not client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);

                    const data = { tileCoordinate: { x: 5, y: 5 }, accessCode };
                    gateway.handleUserDidDoorAction(mockClient as Socket, data);

                    expect(gateway.server.to).not.toHaveBeenCalled();
                });
            });

            describe('handleUserDidBattleAction', () => {
                it("should start battle and emit roomUserDidBattleAction if it is client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
                    jest.spyOn(gateway, 'handleStartBattle').mockImplementation(() => {});

                    const data = { enemyPlayerId: 'enemy1', accessCode };
                    gateway.handleUserDidBattleAction(mockClient as Socket, data);

                    expect(gateway.handleStartBattle).toHaveBeenCalledWith(data.accessCode, mockClient.id, data.enemyPlayerId);
                    expect(gateway.server.to).toHaveBeenCalledWith(data.accessCode.toString());
                    expect(gateway.server.to(data.accessCode.toString()).emit).toHaveBeenCalledWith('roomUserDidBattleAction', {
                        playerId: mockClient.id,
                        enemyPlayerId: data.enemyPlayerId,
                    });
                });

                it("should do nothing if it is not client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);
                    jest.spyOn(gateway, 'handleStartBattle').mockImplementation(() => {});

                    const data = { enemyPlayerId: 'enemy1', accessCode };
                    gateway.handleUserDidBattleAction(mockClient as Socket, data);

                    expect(gateway.handleStartBattle).not.toHaveBeenCalled();
                    expect(gateway.server.to).not.toHaveBeenCalled();
                });
            });

            describe('handleUserAttacked', () => {
                it('should emit opponentAttacked and successfulAttack if attack succeeded without death', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(true);
                    playGameBoardBattleService.userSuccededAttack.mockReturnValue(false);
                    gameSocketRoomService.gameBattleRooms.get = jest.fn().mockReturnValue(battleRoom);
                    jest.spyOn(gateway, 'endBattleTurn').mockImplementation(() => {});

                    const data = { attackResult: 1, accessCode };
                    gateway.handleUserAttacked(mockClient as Socket, data);

                    expect(gateway.server.to).toHaveBeenCalledWith(data.accessCode.toString());
                    expect(gateway.server.to(data.accessCode.toString()).emit).toHaveBeenCalledWith('opponentAttacked', data.attackResult);
                    expect(gateway.server.to(data.accessCode.toString()).emit).toHaveBeenCalledWith('successfulAttack');
                    expect(gateway.endBattleTurn).toHaveBeenCalledWith(data.accessCode);
                });

                it('should handle battle ended by death if player dies', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(true);
                    playGameBoardBattleService.userSuccededAttack.mockReturnValue(true);

                    const data = { attackResult: 1, accessCode };
                    jest.spyOn(gateway, 'handleBattleEndedByDeath').mockImplementation(() => {});

                    gateway.handleUserAttacked(mockClient as Socket, data);

                    expect(gateway.server.to(data.accessCode.toString()).emit).toHaveBeenCalledWith('opponentAttacked', data.attackResult);
                    expect(gateway.server.to(data.accessCode.toString()).emit).toHaveBeenCalledWith('successfulAttack');
                    expect(gateway.handleBattleEndedByDeath).toHaveBeenCalledWith(data.accessCode, mockClient.id);
                });

                it('should handle invalid room', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(false);
                    jest.spyOn(gateway, 'endBattleTurn').mockImplementation(() => {});

                    const data = { attackResult: 1, accessCode };

                    gateway.handleUserAttacked(mockClient as Socket, data);
                    expect(gateway.endBattleTurn).not.toHaveBeenCalled();
                });
            });

            describe('handleUserTriedEscape', () => {
                it('should emit opponentTriedEscape and handle battle end by escape if evade succeeded', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(true);
                    playGameBoardBattleService.userUsedEvade.mockReturnValue(true);
                    gameSocketRoomService.gameBattleRooms.get = jest.fn().mockReturnValue(battleRoom);
                    jest.spyOn(gateway, 'handleBattleEndedByEscape').mockImplementation(() => {});

                    gateway.handleUserTriedEscape(mockClient as Socket, accessCode);

                    expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
                    expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('opponentTriedEscape');
                    expect(gateway.handleBattleEndedByEscape).toHaveBeenCalledWith(accessCode);
                });

                it('should emit opponentTriedEscape and end battle turn if evade failed', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(true);
                    playGameBoardBattleService.userUsedEvade.mockReturnValue(false);
                    gameSocketRoomService.gameBattleRooms.get = jest.fn().mockReturnValue(battleRoom);
                    jest.spyOn(gateway, 'endBattleTurn').mockImplementation(() => {});

                    gateway.handleUserTriedEscape(mockClient as Socket, accessCode);

                    expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
                    expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('opponentTriedEscape');
                    expect(gateway.endBattleTurn).toHaveBeenCalledWith(accessCode);
                });

                it('should handle invalid room', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(false);
                    jest.spyOn(gateway, 'endBattleTurn').mockImplementation(() => {});

                    gateway.handleUserTriedEscape(mockClient as Socket, accessCode);
                    expect(gateway.endBattleTurn).not.toHaveBeenCalled();
                });
            });

            describe('handleUserWon', () => {
                it('should pause timer and emit gameBoardPlayerWon', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(true);

                    gateway.handleUserWon(mockClient as Socket, accessCode);

                    expect(playGameBoardTimeService.pauseTimer).toHaveBeenCalledWith(accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
                    expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('gameBoardPlayerWon', mockClient.id);
                });

                it('should handle invalid room', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(false);

                    gateway.handleUserWon(mockClient as Socket, accessCode);
                    expect(playGameBoardTimeService.pauseTimer).not.toHaveBeenCalled();
                });
            });

            describe('isClientTurn', () => {
                it("should return true if it is the client's turn and game timer is active", () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gameSocketRoomService.gameTimerRooms.set(accessCode, mockGameTimer);
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(true);

                    expect(gateway.isClientTurn(mockClient as Socket, accessCode)).toBe(true);
                });

                it("should log error and return false if it is not client's turn", () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gameSocketRoomService.gameTimerRooms.set(accessCode, mockGameTimer);
                    mockRoom.currentPlayerTurn = 'player2';
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(true);

                    expect(gateway.isClientTurn(mockClient as Socket, accessCode)).toBe(false);
                });

                it('should return false if game timer is not active', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gameSocketRoomService.gameTimerRooms.set(accessCode, mockGameTimer);
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(true);

                    expect(gateway.isClientTurn(mockClient as Socket, accessCode)).toBe(false);
                });

                it('should return false if room is invalid', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(false);
                    expect(gateway.isClientTurn(mockClient as Socket, accessCode)).toBe(false);
                });
            });

            describe('isValidRoom', () => {
                it('should return true if room exists', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

                    expect(gateway.isValidRoom(accessCode)).toBe(true);
                });

                it('should log error and return false if room does not exist', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(undefined);
                    expect(gateway.isValidRoom(accessCode)).toBe(false);
                });
            });

            describe('startRoomGame', () => {
                it('should initialize room game board and emit gameStarted', () => {
                    gateway.startRoomGame(accessCode);

                    expect(playGameBoardSocketService.initRoomGameBoard).toHaveBeenCalledWith(accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
                    expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('gameStarted');
                });
            });

            describe('updateRoomTime', () => {
                it('should emit setTime with the current game timer time', () => {
                    gameSocketRoomService.gameTimerRooms.get = jest.fn().mockReturnValue(mockGameTimer);

                    gateway.updateRoomTime(accessCode);

                    expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
                    expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('setTime', mockGameTimer.time);
                });
            });

            describe('endRoomTurn', () => {
                it('should emit endTurn', () => {
                    gateway.endRoomTurn(accessCode);

                    expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
                    expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('endTurn');
                });
            });

            describe('startRoomTurn', () => {
                it('should emit startTurn with the playerId', () => {
                    gateway.startRoomTurn(accessCode, mockRoom.currentPlayerTurn);

                    expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
                    expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('startTurn', mockRoom.currentPlayerTurn);
                });
            });

            describe('startBattleTurn', () => {
                it('should emit startBattleTurn with the playerId', () => {
                    gateway.startBattleTurn(accessCode, battleRoom.firstPlayerId);

                    expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
                    expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('startBattleTurn', battleRoom.firstPlayerId);
                });
            });

            describe('handleStartBattle', () => {
                it('should pause timer, create battle timer, and emit startBattleTurn if room is valid', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(true);
                    playGameBoardBattleService.getPlayerBattleTurn.mockReturnValue(battleRoom.firstPlayerId);

                    gateway.handleStartBattle(accessCode, battleRoom.firstPlayerId, battleRoom.secondPlayerId);

                    expect(playGameBoardTimeService.pauseTimer).toHaveBeenCalledWith(accessCode);
                    expect(playGameBoardBattleService.createBattleTimer).toHaveBeenCalledWith(
                        accessCode,
                        battleRoom.firstPlayerId,
                        battleRoom.secondPlayerId,
                    );
                    expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
                    expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('startBattleTurn', battleRoom.firstPlayerId);
                });

                it('should do nothing if room is invalid', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(false);

                    gateway.handleStartBattle(accessCode, battleRoom.firstPlayerId, battleRoom.secondPlayerId);

                    expect(playGameBoardTimeService.pauseTimer).not.toHaveBeenCalled();
                    expect(playGameBoardBattleService.createBattleTimer).not.toHaveBeenCalled();
                    expect(gateway.server.to).not.toHaveBeenCalled();
                });
            });

            describe('handleBattleSecondPassed', () => {
                it('should emit setTime with the current battle room time', () => {
                    gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

                    gateway.handleBattleSecondPassed(accessCode);

                    expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
                    expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('setTime', battleRoom.time);
                });
            });

            describe('handleBattleTimeOut', () => {
                it('should emit automaticAttack if room is valid', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(true);

                    gateway.handleBattleTimeOut(accessCode);

                    expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
                    expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('automaticAttack');
                });

                it('should do nothing if room is invalid', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(false);

                    gateway.handleBattleTimeOut(accessCode);

                    expect(gateway.server.to).not.toHaveBeenCalled();
                });
            });

            describe('endBattleTurn', () => {
                it('should end battle turn, emit setTime, and start battle turn if room is valid', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(true);
                    playGameBoardBattleService.getPlayerBattleTurn.mockReturnValue(battleRoom.firstPlayerId);
                    gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

                    gateway.endBattleTurn(accessCode);

                    expect(playGameBoardBattleService.endBattleTurn).toHaveBeenCalledWith(accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(accessCode.toString());
                    expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('setTime', expect.any(Number));
                    expect(gateway.server.to(accessCode.toString()).emit).toHaveBeenCalledWith('startBattleTurn', battleRoom.firstPlayerId);
                });

                it('should do nothing if room is invalid', () => {
                    jest.spyOn(gateway, 'isValidRoom').mockReturnValue(false);

                    gateway.endBattleTurn(accessCode);

                    expect(playGameBoardBattleService.endBattleTurn).not.toHaveBeenCalled();
                    expect(gateway.server.to).not.toHaveBeenCalled();
                });
            });
        });
    });
});
