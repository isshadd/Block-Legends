import { Game } from '@app/model/database/game';
import { GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { PlayGameBoardBattleService } from '@app/services/gateway-services/play-game-board-battle-time/play-game-board-battle.service';
import { PlayGameBoardSocketService } from '@app/services/gateway-services/play-game-board-socket/play-game-board-socket.service';
import { PlayGameBoardTimeService } from '@app/services/gateway-services/play-game-board-time/play-game-board-time.service';
import {
    PlayerNumberStatisticType,
    PlayGameStatisticsService,
} from '@app/services/gateway-services/play-game-statistics/play-game-statistics.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { MOUVEMENT_INTERVAL } from '@common/constants/game_constants';
import { GameMode } from '@common/enums/game-mode';
import { GameTimerState } from '@common/enums/game.timer.state';
import { SocketEvents } from '@common/enums/gateway-events/socket-events';
import { ItemType } from '@common/enums/item-type';
import { MapSize } from '@common/enums/map-size';
import { GameBoardParameters } from '@common/interfaces/game-board-parameters';
import { GameRoom } from '@common/interfaces/game-room';
import { GameStatistics } from '@common/interfaces/game-statistics';
import { GameBattle } from '@common/interfaces/game.battle';
import { GameTimer } from '@common/interfaces/game.timer';
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
    let playGameStatisticsService: jest.Mocked<PlayGameStatisticsService>;
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
                isVirtual: false,
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
                isVirtual: false,
            } as PlayerCharacter,
            {
                socketId: 'virtualPlayer',
                attributes: {
                    speed: 15,
                    life: 100,
                    attack: 0,
                    defense: 0,
                },
                avatar: undefined,
                name: 'virtualPlayer',
                isVirtual: true,
            } as PlayerCharacter,
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
            getRandomClientInRoom: jest.fn(),
            getRandomDelay: jest.fn(),
            changeTurn: jest.fn(),
            getPlayerBySocketId: jest.fn(),
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
            getVirtualPlayerBattleData: jest.fn(),
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
            gameBoardRooms: new Map<number, GameBoardParameters>(),
            gameTimerRooms: new Map<number, any>(),
            gameBattleRooms: new Map<number, any>(),
            setCurrentPlayerTurn: jest.fn(),
            setSpawnCounter: jest.fn(),
            signalPlayerLeftRoom$: {
                subscribe: jest.fn(),
            },
        } as any;

        playGameStatisticsService = {
            addDifferentTerrainTileVisited: jest.fn(),
            addPlayerDifferentItemGrabbed: jest.fn(),
            increaseGameTotalDoorsInteracted: jest.fn(),
            increasePlayerStatistic: jest.fn(),
            endGameStatistics: jest.fn(),
            increaseGameTotalPlayerTurns: jest.fn(),
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
                { provide: PlayGameStatisticsService, useValue: playGameStatisticsService },
                {
                    provide: 'WEB_SOCKET_SERVER',
                    useValue: mockServer,
                },
            ],
        }).compile();

        gateway = module.get<PlayGameBoardGateway>(PlayGameBoardGateway);
        gameSocketRoomService.getRoomBySocketId.mockReturnValue(mockRoom);
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
            const mockUpdateRoomTime = jest.spyOn(gateway, 'updateRoomTime').mockImplementation(jest.fn());
            const mockHandleTimeOut = jest.spyOn(gateway, 'handleTimeOut').mockImplementation(jest.fn());
            const mockHandlePlayerLeftRoom = jest.spyOn(gateway, 'handlePlayerLeftRoom').mockImplementation(jest.fn());
            const mockHandleBattleTimeOut = jest.spyOn(gateway, 'handleBattleTimeOut').mockImplementation(jest.fn());
            const mockHandleBattleSecondPassed = jest.spyOn(gateway, 'handleBattleSecondPassed').mockImplementation(jest.fn());

            const playerSocketId = 'player1';

            const timePassedCallback = (playGameBoardTimeService.signalRoomTimePassed$.subscribe as jest.Mock).mock.calls[0][0];
            const timeOutCallback = (playGameBoardTimeService.signalRoomTimeOut$.subscribe as jest.Mock).mock.calls[0][0];
            const playerLeftCallback = (gameSocketRoomService.signalPlayerLeftRoom$.subscribe as jest.Mock).mock.calls[0][0];
            const battleTimeOutCallback = (playGameBoardBattleService.signalRoomTimeOut$.subscribe as jest.Mock).mock.calls[0][0];
            const battleSecondPassedCallback = (playGameBoardBattleService.signalRoomTimePassed$.subscribe as jest.Mock).mock.calls[0][0];

            timePassedCallback(mockRoom.accessCode);
            expect(mockUpdateRoomTime).toHaveBeenCalledWith(mockRoom.accessCode);

            timeOutCallback(mockRoom.accessCode);
            expect(mockHandleTimeOut).toHaveBeenCalledWith(mockRoom.accessCode);

            playerLeftCallback(mockRoom.accessCode, playerSocketId);
            expect(mockHandlePlayerLeftRoom).toHaveBeenCalled();

            battleTimeOutCallback(mockRoom.accessCode);
            expect(mockHandleBattleTimeOut).toHaveBeenCalledWith(mockRoom.accessCode);

            battleSecondPassedCallback(mockRoom.accessCode);
            expect(mockHandleBattleSecondPassed).toHaveBeenCalledWith(mockRoom.accessCode);
        });
    });

    describe('handleInitGameBoard', () => {
        it('should initialize game board and set timers when room exists', () => {
            gameSocketRoomService.gameBoardRooms.set(mockRoom.accessCode, mockGameBoardRoom);
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            jest.spyOn(gateway, 'updateRoomTime').mockImplementation(jest.fn());

            const mockClient: Partial<Socket> = {
                emit: jest.fn(),
            };

            gateway.handleInitGameBoard(mockClient as Socket);

            expect(mockClient.emit).toHaveBeenCalledWith('initGameBoardParameters', mockGameBoardRoom);
            expect(playGameBoardTimeService.setTimerPreparingTurn).toHaveBeenCalledWith(mockRoom.accessCode);
            expect(playGameBoardTimeService.resumeTimer).toHaveBeenCalledWith(mockRoom.accessCode);
            expect(gateway.updateRoomTime).toHaveBeenCalledWith(mockRoom.accessCode);
        });

        it('should emit error when room does not exist', () => {
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(undefined);
            jest.spyOn(gateway, 'updateRoomTime').mockImplementation(jest.fn());

            const mockClient: Partial<Socket> = {
                emit: jest.fn(),
            };

            gateway.handleInitGameBoard(mockClient as Socket);

            expect(mockClient.emit).toHaveBeenCalledWith('error', { message: 'Room pas trouvé' });
            expect(playGameBoardTimeService.setTimerPreparingTurn).not.toHaveBeenCalled();
            expect(gateway.updateRoomTime).not.toHaveBeenCalled();
        });
    });

    describe('handleUserEndTurn', () => {
        it("should handle time out if it is client's turn", () => {
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            const mockClient: Partial<Socket> = {
                id: 'player1',
            };

            const isClientTurnSpy = jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
            const handleTimeOutSpy = jest.spyOn(gateway, 'handleTimeOut').mockImplementation(jest.fn());

            gateway.handleUserEndTurn(mockClient as Socket, mockClient.id);

            expect(isClientTurnSpy).toHaveBeenCalledWith(mockClient.id);
            expect(handleTimeOutSpy).toHaveBeenCalledWith(mockRoom.accessCode);
        });

        it("should do nothing if it is not client's turn", () => {
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            const mockClient: Partial<Socket> = {
                id: 'player1',
            };

            const isClientTurnSpy = jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);
            const handleTimeOutSpy = jest.spyOn(gateway, 'handleTimeOut').mockImplementation(jest.fn());

            gateway.handleUserEndTurn(mockClient as Socket, mockClient.id);

            expect(isClientTurnSpy).toHaveBeenCalledWith(mockClient.id);
            expect(handleTimeOutSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleUserMoved', () => {
        it("should emit roomUserMoved if it is client's turn", () => {
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            const mockClient: Partial<Socket> = {
                id: 'player1',
            };

            const moveData = {
                fromTile: { x: 1, y: 2 },
                toTile: { x: 3, y: 4 },
                playerTurnId: mockClient.id,
                isTeleport: false,
            };

            const isClientTurnSpy = jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);

            gateway.handleUserMoved(mockClient as Socket, moveData);

            expect(isClientTurnSpy).toHaveBeenCalledWith(mockClient.id);
            expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('roomUserMoved', {
                playerId: mockClient.id,
                fromTile: moveData.fromTile,
                toTile: moveData.toTile,
                isTeleport: false,
            });
        });

        it("should do nothing if it is not client's turn", () => {
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            const mockClient: Partial<Socket> = {
                id: 'player1',
            };

            const moveData = {
                fromTile: { x: 1, y: 2 },
                toTile: { x: 3, y: 4 },
                playerTurnId: mockClient.id,
                isTeleport: false,
            };

            const isClientTurnSpy = jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);

            gateway.handleUserMoved(mockClient as Socket, moveData);

            expect(isClientTurnSpy).toHaveBeenCalledWith(mockClient.id);
            expect(gateway.server.to).not.toHaveBeenCalled();
        });
    });

    describe('handleVirtualPlayerChoosedDestination', () => {
        it('should emit virtualPlayerMoved to a random client in the room after a delay', () => {
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(mockRoom);
            playGameBoardSocketService.getRandomClientInRoom.mockReturnValue('randomClientId');
            const mockClient: Partial<Socket> = {
                id: 'player1',
            };
            const data = { coordinates: { x: 1, y: 1 }, virtualPlayerId: 'virtualPlayer' };
            jest.useFakeTimers();
            jest.spyOn(global, 'setTimeout');
            gateway.handleVirtualPlayerChoosedDestination(mockClient as Socket, data);

            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), MOUVEMENT_INTERVAL);
            jest.runAllTimers();

            expect(gateway.server.to).toHaveBeenCalledWith('randomClientId');
            expect(gateway.server.to('randomClientId').emit).toHaveBeenCalledWith(SocketEvents.VIRTUAL_PLAYER_MOVED, {
                destination: data.coordinates,
                virtualPlayerId: data.virtualPlayerId,
            });
        });

        it('should do nothing if room is not found', () => {
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(undefined);
            const mockClient: Partial<Socket> = {
                id: 'player1',
            };
            const data = { coordinates: { x: 1, y: 1 }, virtualPlayerId: 'virtualPlayer' };
            gateway.handleVirtualPlayerChoosedDestination(mockClient as Socket, data);

            expect(gateway.server.to).not.toHaveBeenCalled();
        });
    });

    describe('handleUserGrabbedItem', () => {
        it('should add item to player statistics and emit roomUserGrabbedItem if room exists', () => {
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(mockRoom);
            const mockClient: Partial<Socket> = {
                id: 'player1',
            };
            const data = { itemType: ItemType.Sword, tileCoordinates: { x: 1, y: 1 }, playerTurnId: mockClient.id };

            gateway.handleUserGrabbedItem(mockClient as Socket, data);

            expect(playGameStatisticsService.addPlayerDifferentItemGrabbed).toHaveBeenCalledWith(
                mockRoom.accessCode,
                data.playerTurnId,
                data.itemType,
            );
            expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.ROOM_USER_GRABBED_ITEM, {
                playerId: data.playerTurnId,
                itemType: data.itemType,
                tileCoordinate: data.tileCoordinates,
            });
        });

        it('should do nothing if room does not exist', () => {
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(undefined);
            const mockClient: Partial<Socket> = {
                id: 'player1',
            };
            const data = { itemType: ItemType.Sword, tileCoordinates: { x: 1, y: 1 }, playerTurnId: mockClient.id };

            gateway.handleUserGrabbedItem(mockClient as Socket, data);

            expect(playGameStatisticsService.addPlayerDifferentItemGrabbed).not.toHaveBeenCalled();
            expect(gateway.server.to).not.toHaveBeenCalled();
        });
    });

    describe('handleVirtualPlayerContinueTurn', () => {
        it("should continue virtual player's turn if it is client's turn", () => {
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(mockRoom);
            jest.spyOn(gateway, 'continueVirtualPlayerTurn').mockImplementation(jest.fn());
            jest.useFakeTimers();
            jest.spyOn(global, 'setTimeout');

            const mockClient: Partial<Socket> = {
                id: 'virtualPlayer',
            };

            jest.spyOn(global, 'setTimeout');
            gateway.handleVirtualPlayerContinueTurn(mockClient as Socket, mockClient.id);

            expect(gateway.isClientTurn).toHaveBeenCalledWith(mockClient.id);
            expect(setTimeout).toHaveBeenCalled;
            jest.runAllTimers();
            expect(gateway.continueVirtualPlayerTurn).toHaveBeenCalledWith(mockRoom.accessCode, mockClient.id);
        });

        it("should do nothing if it is not client's turn", () => {
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);
            jest.spyOn(gateway, 'continueVirtualPlayerTurn').mockImplementation(jest.fn());

            const mockClient: Partial<Socket> = {
                id: 'virtualPlayer',
            };

            gateway.handleVirtualPlayerContinueTurn(mockClient as Socket, mockClient.id);

            expect(gateway.isClientTurn).toHaveBeenCalledWith(mockClient.id);
            expect(gateway.continueVirtualPlayerTurn).not.toHaveBeenCalled();
        });

        it('should do nothing if room is not found', () => {
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(undefined);
            jest.spyOn(gateway, 'continueVirtualPlayerTurn').mockImplementation(jest.fn());

            const mockClient: Partial<Socket> = {
                id: 'virtualPlayer',
            };

            gateway.handleVirtualPlayerContinueTurn(mockClient as Socket, mockClient.id);

            expect(gateway.isClientTurn).toHaveBeenCalledWith(mockClient.id);
            expect(gateway.continueVirtualPlayerTurn).not.toHaveBeenCalled();
        });
    });

    describe('handleUserThrewItem', () => {
        it('should emit roomUserThrewItem if room exists', () => {
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(mockRoom);
            const mockClient: Partial<Socket> = {
                id: 'player1',
            };
            const data = { itemType: ItemType.Sword, tileCoordinates: { x: 1, y: 1 }, playerTurnId: mockClient.id };

            gateway.handleUserThrewItem(mockClient as Socket, data);

            expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.ROOM_USER_THREW_ITEM, {
                playerId: data.playerTurnId,
                itemType: data.itemType,
                tileCoordinate: data.tileCoordinates,
            });
        });

        it('should do nothing if room does not exist', () => {
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(undefined);
            const mockClient: Partial<Socket> = {
                id: 'player1',
            };
            const data = { itemType: ItemType.Sword, tileCoordinates: { x: 1, y: 1 }, playerTurnId: mockClient.id };

            gateway.handleUserThrewItem(mockClient as Socket, data);

            expect(gateway.server.to).not.toHaveBeenCalled();
        });
    });

    describe('handleUserAttacked', () => {
        it('should emit opponentAttacked and successfulAttack if attack succeeded and player not dead', () => {
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
            gameSocketRoomService.gameTimerRooms.set(mockRoom.accessCode, mockGameTimer);
            jest.spyOn(gameSocketRoomService.gameBattleRooms, 'get').mockReturnValue(battleRoom);
            jest.spyOn(gateway, 'endBattleTurn').mockImplementation(jest.fn());

            const mockClient: Partial<Socket> = {
                id: 'player1',
            };
            const attackResult = 1;

            playGameBoardBattleService.userSucceededAttack.mockReturnValue(false);

            gateway.handleUserAttacked(mockClient as Socket, { playerTurnId: mockClient.id, attackResult, playerHasTotem: false });

            expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('opponentAttacked', attackResult);
            expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('successfulAttack');
            expect(playGameBoardBattleService.userSucceededAttack).toHaveBeenCalledWith(mockRoom.accessCode, false);
            expect(gateway.endBattleTurn).toHaveBeenCalledWith(mockRoom.accessCode);
        });

        it('should handle battle ended by death if attack resulted in player death', () => {
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
            gameSocketRoomService.gameBattleRooms.set(mockRoom.accessCode, battleRoom);
            gameSocketRoomService.gameTimerRooms.set(mockRoom.accessCode, mockGameTimer);
            jest.spyOn(gateway, 'handleBattleEndedByDeath').mockImplementation(jest.fn());

            const mockClient: Partial<Socket> = {
                id: 'player1',
            };

            const attackResult = 1;

            playGameBoardBattleService.userSucceededAttack.mockReturnValue(true);

            gateway.handleUserAttacked(mockClient as Socket, { playerTurnId: mockClient.id, attackResult, playerHasTotem: false });

            expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('opponentAttacked', attackResult);
            expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('successfulAttack');
            expect(playGameBoardBattleService.userSucceededAttack).toHaveBeenCalledWith(mockRoom.accessCode, false);
            expect(gateway.handleBattleEndedByDeath).toHaveBeenCalledWith(mockRoom.accessCode, mockClient.id);
        });

        describe('PlayGameBoardGateway @SubscribeMessage Handlers', () => {
            let mockClient: Partial<Socket>;

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
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gateway.handleUserStartedMoving(mockClient as Socket, mockClient.id);

                    expect(playGameBoardTimeService.pauseTimer).toHaveBeenCalledWith(mockRoom.accessCode);
                });

                it("should do nothing if it is not client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);
                    jest.spyOn(playGameBoardTimeService, 'pauseTimer').mockImplementation(jest.fn());

                    gateway.handleUserStartedMoving(mockClient as Socket, mockClient.id);

                    expect(playGameBoardTimeService.pauseTimer).not.toHaveBeenCalled();
                });
            });

            describe('handleUserFinishedMoving', () => {
                it("should resume timer if it is client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gateway.handleUserFinishedMoving(mockClient as Socket, mockClient.id);

                    expect(playGameBoardTimeService.resumeTimer).toHaveBeenCalledWith(mockRoom.accessCode);
                });

                it("should do nothing if it is not client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);
                    gateway.handleUserFinishedMoving(mockClient as Socket, mockClient.id);

                    expect(playGameBoardTimeService.resumeTimer).not.toHaveBeenCalled();
                });
            });

            describe('handleUserMoved', () => {
                it("should emit roomUserMoved if it is client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

                    const data = { fromTile: { x: 1, y: 1 }, toTile: { x: 2, y: 2 }, playerTurnId: mockClient.id, isTeleport: false };
                    gateway.handleUserMoved(mockClient as Socket, data);

                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('roomUserMoved', {
                        playerId: mockClient.id,
                        fromTile: data.fromTile,
                        toTile: data.toTile,
                        isTeleport: false,
                    });
                });

                it("should do nothing if it is not client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

                    const data = { fromTile: { x: 1, y: 1 }, toTile: { x: 2, y: 2 }, playerTurnId: mockClient.id, isTeleport: false };
                    gateway.handleUserMoved(mockClient as Socket, data);

                    expect(gateway.server.to).not.toHaveBeenCalled();
                });
            });

            describe('handleUserRespawned', () => {
                it('should emit roomUserRespawned', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    const data = { fromTile: { x: 1, y: 1 }, toTile: { x: 2, y: 2 }, playerTurnId: mockClient.id };
                    gateway.handleUserRespawned(mockClient as Socket, data);

                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('roomUserRespawned', {
                        playerId: mockClient.id,
                        fromTile: data.fromTile,
                        toTile: data.toTile,
                    });
                });
            });

            describe('handleUserDidDoorAction', () => {
                it("should emit roomUserDidDoorAction if it is client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

                    const tileCoordinate = { x: 5, y: 5 };
                    gateway.handleUserDidDoorAction(mockClient as Socket, { tileCoordinate, playerTurnId: mockClient.id });

                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('roomUserDidDoorAction', {
                        playerId: mockClient.id,
                        tileCoordinate,
                    });
                });

                it("should do nothing if it is not client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

                    const tileCoordinate = { x: 5, y: 5 };
                    gateway.handleUserDidDoorAction(mockClient as Socket, { tileCoordinate, playerTurnId: mockClient.id });

                    expect(gateway.server.to).not.toHaveBeenCalled();
                });
            });

            describe('handleUserDidBattleAction', () => {
                it("should start battle and emit roomUserDidBattleAction if it is client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
                    jest.spyOn(gateway, 'handleStartBattle').mockImplementation(jest.fn());
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

                    const enemyPlayerId = 'enemy1';
                    gateway.handleUserDidBattleAction(mockClient as Socket, { playerTurnId: mockClient.id, enemyPlayerId });

                    expect(gateway.handleStartBattle).toHaveBeenCalledWith(mockRoom.accessCode, mockClient.id, enemyPlayerId);
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('roomUserDidBattleAction', {
                        playerId: mockClient.id,
                        enemyPlayerId,
                    });
                });

                it("should do nothing if it is not client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);
                    jest.spyOn(gateway, 'handleStartBattle').mockImplementation(jest.fn());
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

                    const enemyPlayerId = 'enemy1';
                    gateway.handleUserDidBattleAction(mockClient as Socket, { playerTurnId: mockClient.id, enemyPlayerId });

                    expect(gateway.handleStartBattle).not.toHaveBeenCalled();
                    expect(gateway.server.to).not.toHaveBeenCalled();
                });
            });

            describe('handleUserAttacked', () => {
                it('should emit opponentAttacked and successfulAttack if attack succeeded without death', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardBattleService.userSucceededAttack.mockReturnValue(false);
                    gameSocketRoomService.gameBattleRooms.get = jest.fn().mockReturnValue(battleRoom);
                    jest.spyOn(gateway, 'endBattleTurn').mockImplementation(jest.fn());

                    const attackResult = 1;
                    gateway.handleUserAttacked(mockClient as Socket, { playerTurnId: mockClient.id, attackResult, playerHasTotem: false });

                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('opponentAttacked', attackResult);
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('successfulAttack');
                    expect(gateway.endBattleTurn).toHaveBeenCalledWith(mockRoom.accessCode);
                });

                it('should handle battle ended by death if player dies', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardBattleService.userSucceededAttack.mockReturnValue(true);

                    const attackResult = 1;
                    jest.spyOn(gateway, 'handleBattleEndedByDeath').mockImplementation(jest.fn());

                    gateway.handleUserAttacked(mockClient as Socket, { playerTurnId: mockClient.id, attackResult, playerHasTotem: false });

                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('opponentAttacked', attackResult);
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('successfulAttack');
                    expect(gateway.handleBattleEndedByDeath).toHaveBeenCalledWith(mockRoom.accessCode, mockClient.id);
                });

                it('should handle invalid room', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    jest.spyOn(gateway, 'endBattleTurn').mockImplementation(jest.fn());
                    gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

                    const attackResult = 1;

                    gateway.handleUserAttacked(mockClient as Socket, { playerTurnId: mockClient.id, attackResult, playerHasTotem: false });
                    expect(gateway.endBattleTurn).not.toHaveBeenCalled();
                });
            });

            describe('handleUserTriedEscape', () => {
                it('should emit opponentTriedEscape and handle battle end by escape if evade succeeded', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardBattleService.userUsedEvade.mockReturnValue(true);
                    gameSocketRoomService.gameBattleRooms.get = jest.fn().mockReturnValue(battleRoom);
                    jest.spyOn(gateway, 'handleBattleEndedByEscape').mockImplementation(jest.fn());

                    gateway.handleUserTriedEscape(mockClient as Socket, mockClient.id);

                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('opponentTriedEscape');
                    expect(gateway.handleBattleEndedByEscape).toHaveBeenCalledWith(mockRoom.accessCode);
                });

                it('should emit opponentTriedEscape and end battle turn if evade failed', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardBattleService.userUsedEvade.mockReturnValue(false);
                    gameSocketRoomService.gameBattleRooms.get = jest.fn().mockReturnValue(battleRoom);
                    jest.spyOn(gateway, 'endBattleTurn').mockImplementation(jest.fn());

                    gateway.handleUserTriedEscape(mockClient as Socket, mockClient.id);

                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('opponentTriedEscape');
                    expect(gateway.endBattleTurn).toHaveBeenCalledWith(mockRoom.accessCode);
                });

                it('should handle invalid room', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    jest.spyOn(gateway, 'endBattleTurn').mockImplementation(jest.fn());
                    gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

                    gateway.handleUserTriedEscape(mockClient as Socket, mockClient.id);
                    expect(gateway.endBattleTurn).not.toHaveBeenCalled();
                });
            });

            describe('handleUserWon', () => {
                it('should pause timer and emit gameBoardPlayerWon', () => {
                    const gameStatistics: GameStatistics = {} as GameStatistics;
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameStatisticsService.endGameStatistics.mockReturnValue(gameStatistics);

                    gateway.handleUserWon(mockClient as Socket, mockClient.id);

                    expect(playGameBoardTimeService.pauseTimer).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(playGameStatisticsService.endGameStatistics).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('gameBoardPlayerWon', {
                        playerTurnId: mockClient.id,
                        gameStatistics,
                    });
                });

                it('should handle invalid room', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

                    gateway.handleUserWon(mockClient as Socket, mockClient.id);
                    expect(playGameBoardTimeService.pauseTimer).not.toHaveBeenCalled();
                });
            });

            describe('isClientTurn', () => {
                it("should return true if it is the client's turn and game timer is active", () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gameSocketRoomService.gameTimerRooms.set(mockRoom.accessCode, mockGameTimer);

                    expect(gateway.isClientTurn(mockClient.id)).toBe(true);
                });

                it("should log error and return false if it is not client's turn", () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gameSocketRoomService.gameTimerRooms.set(mockRoom.accessCode, mockGameTimer);
                    mockRoom.currentPlayerTurn = 'player2';

                    expect(gateway.isClientTurn(mockClient.id)).toBe(false);
                });

                it('should return false if game timer is not active', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gameSocketRoomService.gameTimerRooms.set(mockRoom.accessCode, mockGameTimer);

                    expect(gateway.isClientTurn(mockClient.id)).toBe(false);
                });

                it('should return false if room is invalid', () => {
                    gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);
                    expect(gateway.isClientTurn(mockClient.id)).toBe(false);
                });
            });

            describe('startRoomGame', () => {
                it('should initialize room game board and emit gameStarted', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gateway.startRoomGame(mockRoom.accessCode);

                    expect(playGameBoardSocketService.initRoomGameBoard).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('gameStarted');
                });
            });

            describe('updateRoomTime', () => {
                it('should emit setTime with the current game timer time', () => {
                    gameSocketRoomService.gameTimerRooms.get = jest.fn().mockReturnValue(mockGameTimer);
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

                    gateway.updateRoomTime(mockRoom.accessCode);

                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('setTime', mockGameTimer.time);
                });
            });

            describe('endRoomTurn', () => {
                it('should emit endTurn', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gateway.endRoomTurn(mockRoom.accessCode);

                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('endTurn');
                });
            });

            describe('startRoomTurn', () => {
                it('should emit startTurn and increase game total player turns', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[0]);

                    gateway.startRoomTurn(mockRoom.accessCode, mockRoom.currentPlayerTurn);

                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(
                        SocketEvents.START_TURN,
                        mockRoom.currentPlayerTurn,
                    );
                    expect(playGameStatisticsService.increaseGameTotalPlayerTurns).toHaveBeenCalledWith(mockRoom.accessCode);
                });

                it('should start virtual player turn after a delay if player is virtual', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[2]);
                    jest.useFakeTimers();
                    jest.spyOn(global, 'setTimeout');

                    gateway.startRoomTurn(mockRoom.accessCode, mockRoom.players[2].socketId);

                    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), playGameBoardSocketService.getRandomDelay());
                    jest.runAllTimers();
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(
                        SocketEvents.START_TURN,
                        mockRoom.players[2].socketId,
                    );
                    expect(playGameStatisticsService.increaseGameTotalPlayerTurns).toHaveBeenCalledWith(mockRoom.accessCode);
                });

                it('should not start virtual player turn if player is not virtual', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[0]);
                    jest.useFakeTimers();
                    jest.spyOn(global, 'setTimeout');

                    gateway.startRoomTurn(mockRoom.accessCode, mockRoom.players[0].socketId);

                    expect(setTimeout).not.toHaveBeenCalled();
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(
                        SocketEvents.START_TURN,
                        mockRoom.players[0].socketId,
                    );
                    expect(playGameStatisticsService.increaseGameTotalPlayerTurns).toHaveBeenCalledWith(mockRoom.accessCode);
                });
            });

            describe('continueVirtualPlayerTurn', () => {
                it('should emit continueVirtualPlayerTurn to a random client in the room', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardSocketService.getRandomClientInRoom.mockReturnValue('randomClientId');

                    gateway.continueVirtualPlayerTurn(mockRoom.accessCode, mockRoom.players[2].socketId);

                    expect(gateway.server.to).toHaveBeenCalledWith('randomClientId');
                    expect(gateway.server.to('randomClientId').emit).toHaveBeenCalledWith(
                        SocketEvents.CONTINUE_VIRTUAL_PLAYER_TURN,
                        mockRoom.players[2].socketId,
                    );
                });
            });

            describe('startBattleTurn', () => {
                it('should emit startBattleTurn and start virtual player battle turn if player is virtual', () => {
                    const data = {
                        playerId: 'virtualPlayer',
                        enemyId: 'enemyPlayer',
                        virtualPlayerRemainingHealth: 100,
                        enemyRemainingHealth: 100,
                        virtualPlayerRemainingEvasions: 2,
                    };
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[2]);
                    playGameBoardBattleService.getVirtualPlayerBattleData.mockReturnValue(data);
                    playGameBoardSocketService.getRandomClientInRoom.mockReturnValue('randomClientId');
                    playGameBoardSocketService.getRandomDelay.mockReturnValue(1000);

                    jest.useFakeTimers();
                    jest.spyOn(global, 'setTimeout');

                    gateway.startBattleTurn(mockRoom.accessCode, mockRoom.players[2].socketId);

                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(
                        SocketEvents.START_BATTLE_TURN,
                        mockRoom.players[2].socketId,
                    );

                    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
                    jest.runAllTimers();

                    expect(gateway.server.to).toHaveBeenCalledWith('randomClientId');
                    expect(gateway.server.to('randomClientId').emit).toHaveBeenCalledWith(SocketEvents.START_VIRTUAL_PLAYER_BATTLE_TURN, data);
                });

                it('should emit startBattleTurn and not start virtual player battle turn if player is not virtual', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[0]);

                    jest.useFakeTimers();
                    jest.spyOn(global, 'setTimeout');

                    gateway.startBattleTurn(mockRoom.accessCode, mockRoom.players[0].socketId);

                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(
                        SocketEvents.START_BATTLE_TURN,
                        mockRoom.players[0].socketId,
                    );

                    expect(setTimeout).not.toHaveBeenCalled();
                });
            });

            describe('handleStartBattle', () => {
                it('should pause timer, create battle timer, and emit startBattleTurn if room is valid', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardBattleService.getPlayerBattleTurn.mockReturnValue(battleRoom.firstPlayerId);
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[0]);

                    gateway.handleStartBattle(mockRoom.accessCode, battleRoom.firstPlayerId, battleRoom.secondPlayerId);

                    expect(playGameBoardTimeService.pauseTimer).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(playGameBoardBattleService.createBattleTimer).toHaveBeenCalledWith(
                        mockRoom.accessCode,
                        battleRoom.firstPlayerId,
                        battleRoom.secondPlayerId,
                    );
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('startBattleTurn', battleRoom.firstPlayerId);
                });
            });

            describe('handleBattleSecondPassed', () => {
                it('should emit setTime with the current battle room time', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gameSocketRoomService.gameBattleRooms.set(mockRoom.accessCode, battleRoom);

                    gateway.handleBattleSecondPassed(mockRoom.accessCode);

                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('setTime', battleRoom.time);
                });
            });

            describe('handleBattleTimeOut', () => {
                it('should emit automaticAttack if room is valid', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

                    gateway.handleBattleTimeOut(mockRoom.accessCode);

                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('automaticAttack');
                });
            });

            describe('endBattleTurn', () => {
                it('should end battle turn, emit setTime, and start battle turn if room is valid', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardBattleService.getPlayerBattleTurn.mockReturnValue(battleRoom.firstPlayerId);
                    gameSocketRoomService.gameBattleRooms.set(mockRoom.accessCode, battleRoom);
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[0]);

                    gateway.endBattleTurn(mockRoom.accessCode);

                    expect(playGameBoardBattleService.endBattleTurn).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('setTime', expect.any(Number));
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('startBattleTurn', battleRoom.firstPlayerId);
                });
            });

            describe('handleBattleEndedByEscape', () => {
                beforeEach(() => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gameSocketRoomService.gameBattleRooms.set(mockRoom.accessCode, battleRoom);
                });

                it('should emit battleEndedByEscape and continue virtual player turn if first player is virtual', () => {
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[2]);
                    jest.spyOn(gateway, 'handleEndBattle').mockImplementation(jest.fn());
                    jest.spyOn(gateway, 'continueVirtualPlayerTurn').mockImplementation(jest.fn());
                    jest.useFakeTimers();
                    jest.spyOn(global, 'setTimeout');

                    gateway.handleBattleEndedByEscape(mockRoom.accessCode);

                    expect(gateway.handleEndBattle).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(
                        SocketEvents.BATTLE_ENDED_BY_ESCAPE,
                        battleRoom.firstPlayerId,
                    );
                    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), playGameBoardSocketService.getRandomDelay());
                    jest.runAllTimers();
                    expect(gateway.continueVirtualPlayerTurn).toHaveBeenCalledWith(mockRoom.accessCode, battleRoom.firstPlayerId);
                });

                it('should emit battleEndedByEscape and not continue virtual player turn if first player is not virtual', () => {
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[0]);
                    jest.spyOn(gateway, 'handleEndBattle').mockImplementation(jest.fn());
                    jest.spyOn(gateway, 'continueVirtualPlayerTurn').mockImplementation(jest.fn());
                    jest.useFakeTimers();
                    jest.spyOn(global, 'setTimeout');

                    gateway.handleBattleEndedByEscape(mockRoom.accessCode);

                    expect(gateway.handleEndBattle).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(
                        SocketEvents.BATTLE_ENDED_BY_ESCAPE,
                        battleRoom.firstPlayerId,
                    );
                    expect(setTimeout).not.toHaveBeenCalled();
                    expect(gateway.continueVirtualPlayerTurn).not.toHaveBeenCalled();
                });
            });

            describe('handleBattleEndedByDeath', () => {
                beforeEach(() => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gameSocketRoomService.gameBattleRooms.set(mockRoom.accessCode, battleRoom);
                });

                it('should emit FIRST_PLAYER_WON_BATTLE and update statistics if first player wins', () => {
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValueOnce(mockRoom.players[0]).mockReturnValueOnce(mockRoom.players[1]);
                    jest.spyOn(gateway, 'handleEndBattle').mockImplementation(jest.fn());

                    gateway.handleBattleEndedByDeath(mockRoom.accessCode, battleRoom.firstPlayerId);

                    expect(gateway.handleEndBattle).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.FIRST_PLAYER_WON_BATTLE, {
                        firstPlayer: battleRoom.firstPlayerId,
                        loserPlayer: battleRoom.secondPlayerId,
                    });
                    expect(playGameStatisticsService.increasePlayerStatistic).toHaveBeenCalledWith(
                        mockRoom.accessCode,
                        battleRoom.firstPlayerId,
                        PlayerNumberStatisticType.FightWins,
                    );
                    expect(playGameStatisticsService.increasePlayerStatistic).toHaveBeenCalledWith(
                        mockRoom.accessCode,
                        battleRoom.secondPlayerId,
                        PlayerNumberStatisticType.FightLoses,
                    );
                });

                it('should emit VIRTUAL_PLAYER_WON_BATTLE and continue virtual player turn if first player is virtual', () => {
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValueOnce(mockRoom.players[2]).mockReturnValueOnce(mockRoom.players[1]);
                    playGameBoardSocketService.getRandomClientInRoom.mockReturnValue('randomClientId');
                    jest.spyOn(gateway, 'handleEndBattle').mockImplementation(jest.fn());
                    jest.spyOn(gateway, 'continueVirtualPlayerTurn').mockImplementation(jest.fn());
                    jest.useFakeTimers();
                    jest.spyOn(global, 'setTimeout');

                    gateway.handleBattleEndedByDeath(mockRoom.accessCode, battleRoom.firstPlayerId);

                    expect(gateway.handleEndBattle).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.FIRST_PLAYER_WON_BATTLE, {
                        firstPlayer: battleRoom.firstPlayerId,
                        loserPlayer: battleRoom.secondPlayerId,
                    });
                    expect(gateway.server.to).toHaveBeenCalledWith('randomClientId');
                    expect(gateway.server.to('randomClientId').emit).toHaveBeenCalledWith(
                        SocketEvents.VIRTUAL_PLAYER_WON_BATTLE,
                        battleRoom.firstPlayerId,
                    );
                    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), playGameBoardSocketService.getRandomDelay());
                    jest.runAllTimers();
                    expect(gateway.continueVirtualPlayerTurn).toHaveBeenCalledWith(mockRoom.accessCode, battleRoom.firstPlayerId);
                });

                it('should emit SECOND_PLAYER_WON_BATTLE and update statistics if second player wins', () => {
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValueOnce(mockRoom.players[0]).mockReturnValueOnce(mockRoom.players[1]);
                    jest.spyOn(gateway, 'handleEndBattle').mockImplementation(jest.fn());
                    jest.spyOn(gateway, 'handleTimeOut').mockImplementation(jest.fn());
                    gateway.handleBattleEndedByDeath(mockRoom.accessCode, battleRoom.secondPlayerId);

                    expect(gateway.handleEndBattle).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.SECOND_PLAYER_WON_BATTLE, {
                        winnerPlayer: battleRoom.secondPlayerId,
                        loserPlayer: battleRoom.firstPlayerId,
                    });
                    expect(playGameStatisticsService.increasePlayerStatistic).toHaveBeenCalledWith(
                        mockRoom.accessCode,
                        battleRoom.secondPlayerId,
                        PlayerNumberStatisticType.FightWins,
                    );
                    expect(playGameStatisticsService.increasePlayerStatistic).toHaveBeenCalledWith(
                        mockRoom.accessCode,
                        battleRoom.firstPlayerId,
                        PlayerNumberStatisticType.FightLoses,
                    );
                });

                it('should emit VIRTUAL_PLAYER_WON_BATTLE if second player is virtual', () => {
                    mockRoom.players[0].isVirtual = true;
                    mockRoom.players[1].isVirtual = true;
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValueOnce(mockRoom.players[0]).mockReturnValueOnce(mockRoom.players[1]);
                    playGameBoardSocketService.getRandomClientInRoom.mockReturnValue('randomClientId');
                    jest.spyOn(gateway, 'handleEndBattle').mockImplementation(jest.fn());
                    jest.spyOn(gateway, 'handleTimeOut').mockImplementation(jest.fn());
                    gateway.handleBattleEndedByDeath(mockRoom.accessCode, battleRoom.secondPlayerId);

                    expect(gateway.handleEndBattle).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.SECOND_PLAYER_WON_BATTLE, {
                        winnerPlayer: battleRoom.secondPlayerId,
                        loserPlayer: battleRoom.firstPlayerId,
                    });
                    expect(gateway.server.to).toHaveBeenCalledWith('randomClientId');
                    expect(gateway.server.to('randomClientId').emit).toHaveBeenCalled();
                });

                it('should emit VIRTUAL_PLAYER_LOST_BATTLE if first player is virtual', () => {
                    mockRoom.players[0].isVirtual = true;
                    mockRoom.players[1].isVirtual = true;
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValueOnce(mockRoom.players[1]).mockReturnValueOnce(mockRoom.players[0]);
                    playGameBoardSocketService.getRandomClientInRoom.mockReturnValue('randomClientId');
                    jest.spyOn(gateway, 'handleEndBattle').mockImplementation(jest.fn());
                    jest.spyOn(gateway, 'handleTimeOut').mockImplementation(jest.fn());
                    gateway.handleBattleEndedByDeath(mockRoom.accessCode, battleRoom.secondPlayerId);

                    expect(gateway.handleEndBattle).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.SECOND_PLAYER_WON_BATTLE, {
                        winnerPlayer: battleRoom.secondPlayerId,
                        loserPlayer: battleRoom.firstPlayerId,
                    });
                    expect(gateway.server.to).toHaveBeenCalledWith('randomClientId');
                    expect(gateway.server.to('randomClientId').emit).toHaveBeenCalled();
                });

                it('should call handleTimeOut if second player wins', () => {
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValueOnce(mockRoom.players[0]).mockReturnValueOnce(mockRoom.players[1]);
                    jest.spyOn(gateway, 'handleEndBattle').mockImplementation(jest.fn());
                    jest.spyOn(gateway, 'handleTimeOut').mockImplementation(jest.fn());

                    gateway.handleBattleEndedByDeath(mockRoom.accessCode, battleRoom.secondPlayerId);

                    expect(gateway.handleEndBattle).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.SECOND_PLAYER_WON_BATTLE, {
                        winnerPlayer: battleRoom.secondPlayerId,
                        loserPlayer: battleRoom.firstPlayerId,
                    });
                    expect(gateway.handleTimeOut).toHaveBeenCalledWith(mockRoom.accessCode);
                });
            });

            describe('handleEndBattle', () => {
                it('should mark the battle as finished and resume the timer', () => {
                    gateway.handleEndBattle(mockRoom.accessCode);

                    expect(playGameBoardBattleService.battleRoomFinished).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(playGameBoardTimeService.resumeTimer).toHaveBeenCalledWith(mockRoom.accessCode);
                });
            });

            describe('handleTimeOut', () => {
                beforeEach(() => {
                    gameSocketRoomService.gameTimerRooms.set(mockRoom.accessCode, mockGameTimer);
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                });

                it('should end the turn and set timer for preparing if game timer is in ActiveTurn state', () => {
                    jest.spyOn(gateway, 'updateRoomTime').mockImplementation(jest.fn());
                    jest.spyOn(gateway, 'endRoomTurn').mockImplementation(jest.fn());

                    gateway.handleTimeOut(mockRoom.accessCode);

                    expect(gateway.endRoomTurn).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(playGameBoardSocketService.changeTurn).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(playGameBoardTimeService.setTimerPreparingTurn).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.updateRoomTime).toHaveBeenCalledWith(mockRoom.accessCode);
                });

                it('should start the next turn if game timer is in PreparingTurn state', () => {
                    mockGameTimer.state = GameTimerState.PreparingTurn;
                    gameSocketRoomService.gameTimerRooms.set(mockRoom.accessCode, mockGameTimer);
                    jest.spyOn(gateway, 'updateRoomTime').mockImplementation(jest.fn());
                    jest.spyOn(gateway, 'startRoomTurn').mockImplementation(jest.fn());
                    jest.spyOn(gateway, 'updateRoomTime').mockImplementation(jest.fn());

                    gateway.handleTimeOut(mockRoom.accessCode);

                    expect(gateway.startRoomTurn).toHaveBeenCalledWith(mockRoom.accessCode, battleRoom.secondPlayerId);
                    expect(playGameBoardTimeService.setTimerActiveTurn).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.updateRoomTime).toHaveBeenCalledWith(mockRoom.accessCode);
                });

                it('should do nothing if room is invalid', () => {
                    jest.spyOn(gateway, 'endRoomTurn').mockImplementation(jest.fn());
                    jest.spyOn(gateway, 'updateRoomTime').mockImplementation(jest.fn());
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(undefined);

                    gateway.handleTimeOut(mockRoom.accessCode);

                    expect(gateway.endRoomTurn).not.toHaveBeenCalled();
                    expect(playGameBoardSocketService.changeTurn).not.toHaveBeenCalled();
                    expect(playGameBoardTimeService.setTimerPreparingTurn).not.toHaveBeenCalled();
                    expect(gateway.updateRoomTime).not.toHaveBeenCalled();
                });
            });

            describe('handlePlayerLeftRoom', () => {
                beforeEach(() => {
                    gameSocketRoomService.gameBoardRooms.set(mockRoom.accessCode, mockGameBoardRoom);
                    gameSocketRoomService.gameTimerRooms.set(mockRoom.accessCode, mockGameTimer);
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                });

                it('should handle player leaving during a battle and call handleBattleEndedByDeath if leaving player is firstPlayer', () => {
                    jest.spyOn(gateway, 'handleBattleEndedByDeath').mockImplementation(jest.fn());
                    gameSocketRoomService.gameBattleRooms.set(mockRoom.accessCode, battleRoom);

                    gateway.handlePlayerLeftRoom(mockRoom.accessCode, battleRoom.firstPlayerId);

                    expect(gateway.handleBattleEndedByDeath).toHaveBeenCalledWith(mockRoom.accessCode, battleRoom.secondPlayerId);
                });

                it('should handle player leaving during a battle and call handleBattleEndedByDeath if leaving player is secondPlayer', () => {
                    gameSocketRoomService.gameBattleRooms.set(mockRoom.accessCode, battleRoom);
                    jest.spyOn(gateway, 'handleBattleEndedByDeath').mockImplementation(jest.fn());

                    gateway.handlePlayerLeftRoom(mockRoom.accessCode, battleRoom.secondPlayerId);

                    expect(gateway.handleBattleEndedByDeath).toHaveBeenCalledWith(mockRoom.accessCode, battleRoom.firstPlayerId);
                });

                it('should update spawnPlaces, turnOrder, and emit lastPlayerStanding if only one player remains', () => {
                    mockGameBoardRoom.turnOrder = [battleRoom.firstPlayerId];
                    gameSocketRoomService.gameBoardRooms.set(mockRoom.accessCode, mockGameBoardRoom);
                    gameSocketRoomService.gameTimerRooms.set(mockRoom.accessCode, mockGameTimer);
                    gateway.handlePlayerLeftRoom(mockRoom.accessCode, battleRoom.secondPlayerId);

                    expect(playGameBoardTimeService.pauseTimer).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('lastPlayerStanding');
                });

                it('should timeOut if game timer is in ActiveTurn state', () => {
                    mockGameTimer.state = GameTimerState.ActiveTurn;
                    gameSocketRoomService.gameBoardRooms.set(mockRoom.accessCode, mockGameBoardRoom);
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gameSocketRoomService.gameTimerRooms.set(mockRoom.accessCode, mockGameTimer);
                    gameSocketRoomService.gameTimerRooms.get = jest.fn().mockReturnValue(mockGameTimer);
                    jest.spyOn(gateway, 'handleTimeOut').mockImplementation(jest.fn());

                    gateway.handlePlayerLeftRoom(mockRoom.accessCode, mockRoom.currentPlayerTurn);

                    expect(gateway.handleTimeOut).toHaveBeenCalledWith(mockRoom.accessCode);
                });

                it('should emit gameBoardPlayerLeft and update turn order if multiple players remain', () => {
                    gateway.handlePlayerLeftRoom(mockRoom.accessCode, battleRoom.firstPlayerId);

                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(
                        'gameBoardPlayerLeft',
                        battleRoom.firstPlayerId,
                    );
                });
            });
        });
    });
});
