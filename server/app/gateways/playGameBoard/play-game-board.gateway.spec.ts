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

            gateway.handleUserEndTurn(mockClient as Socket, mockClient.id);

            expect(isClientTurnSpy).toHaveBeenCalledWith(mockClient.id);
            expect(handleTimeOutSpy).toHaveBeenCalledWith(mockRoom.accessCode);
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

            gateway.handleUserEndTurn(mockClient as Socket, mockClient.id);

            expect(isClientTurnSpy).toHaveBeenCalledWith(mockClient.id);
            expect(handleTimeOutSpy).not.toHaveBeenCalled();
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
                fromTile: { x: 1, y: 2 },
                toTile: { x: 3, y: 4 },
                playerTurnId: mockClient.id,
            };
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);

            gateway.handleUserMoved(mockClient, moveData);

            gateway.handleUserMoved(mockClient as Socket, moveData);

            expect(isClientTurnSpy).toHaveBeenCalledWith(mockClient.id);
            expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('roomUserMoved', {
                playerId: mockClient.id,
                fromTile: moveData.fromTile,
                toTile: moveData.toTile,
                isTeleport: moveData.isTeleport,
            });
        });

        it('should do nothing when it is not client turn', () => {
            const mockClient = { id: 'player1' } as Socket;
            const moveData = {
                fromTile: { x: 1, y: 2 },
                toTile: { x: 3, y: 4 },
                playerTurnId: mockClient.id,
            };
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);

            gateway.handleUserMoved(mockClient, moveData);

            gateway.handleUserMoved(mockClient as Socket, moveData);

            expect(isClientTurnSpy).toHaveBeenCalledWith(mockClient.id);
            expect(gateway.server.to).not.toHaveBeenCalled();
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

            gateway.handleUserAttacked(mockClient as Socket, { playerTurnId: mockClient.id, attackResult, playerHasTotem: false });

            expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('opponentAttacked', attackResult);
            expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('successfulAttack');
            expect(playGameBoardBattleService.userSucceededAttack).toHaveBeenCalledWith(mockRoom.accessCode, false);
            expect(gateway.endBattleTurn).toHaveBeenCalledWith(mockRoom.accessCode);
        });

        it('should do nothing when room does not exist', () => {
            const mockClient = { id: 'player1' } as Socket;
            const itemData = {
                itemType: ItemType.EnchantedBook,
                tileCoordinates: { x: 1, y: 1 },
            };
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

            gateway.handleUserGrabbedItem(mockClient, itemData);

            playGameBoardBattleService.userSucceededAttack.mockReturnValue(true);

            gateway.handleUserAttacked(mockClient as Socket, { playerTurnId: mockClient.id, attackResult, playerHasTotem: false });

            expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('opponentAttacked', attackResult);
            expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('successfulAttack');
            expect(playGameBoardBattleService.userSucceededAttack).toHaveBeenCalledWith(mockRoom.accessCode, false);
            expect(gateway.handleBattleEndedByDeath).toHaveBeenCalledWith(mockRoom.accessCode, mockClient.id);
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

            describe('handleUserStartedMoving', () => {
                it("should pause timer if it is client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gateway.handleUserStartedMoving(mockClient as Socket, mockClient.id);

            gateway.handleUserThrewItem(mockClient, itemData);

            expect(mockServer.to).not.toHaveBeenCalled();
        });
    });

                    gateway.handleUserStartedMoving(mockClient as Socket, mockClient.id);

            gateway.handleUserRespawned(mockClient, respawnData);

            expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.ROOM_USER_RESPAWNED, {
                playerId: mockClient.id,
                fromTile: respawnData.fromTile,
                toTile: respawnData.toTile,
            });
        });

            describe('handleUserFinishedMoving', () => {
                it("should resume timer if it is client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gateway.handleUserFinishedMoving(mockClient as Socket, mockClient.id);

            gateway.handleUserRespawned(mockClient, respawnData);

                it("should do nothing if it is not client's turn", () => {
                    jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);
                    gateway.handleUserFinishedMoving(mockClient as Socket, mockClient.id);

    describe('handleUserDidDoorAction', () => {
        it('should emit room user did door action when it is client turn', () => {
            const mockClient = { id: 'player1' } as Socket;
            const tileCoordinate = { x: 1, y: 1 };
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);

            gateway.handleUserDidDoorAction(mockClient, tileCoordinate);

                    const data = { fromTile: { x: 1, y: 1 }, toTile: { x: 2, y: 2 }, playerTurnId: mockClient.id };
                    gateway.handleUserMoved(mockClient as Socket, data);

        it('should do nothing when it is not client turn', () => {
            const mockClient = { id: 'player1' } as Socket;
            const tileCoordinate = { x: 1, y: 1 };
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(false);

            gateway.handleUserDidDoorAction(mockClient, tileCoordinate);

                    const data = { fromTile: { x: 1, y: 1 }, toTile: { x: 2, y: 2 }, playerTurnId: mockClient.id };
                    gateway.handleUserMoved(mockClient as Socket, data);

    describe('handleUserDidBattleAction', () => {
        it('should start battle and emit room user did battle action when it is client turn', () => {
            const mockClient = { id: 'player1' } as Socket;
            const enemyPlayerId = 'player2';
            jest.spyOn(gateway, 'isClientTurn').mockReturnValue(true);
            jest.spyOn(gateway, 'handleStartBattle').mockImplementation(jest.fn());

            describe('handleUserRespawned', () => {
                it('should emit roomUserRespawned', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    const data = { fromTile: { x: 1, y: 1 }, toTile: { x: 2, y: 2 }, playerTurnId: mockClient.id };
                    gateway.handleUserRespawned(mockClient as Socket, data);

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

                    const tileCoordinate = { x: 5, y: 5 };
                    gateway.handleUserDidDoorAction(mockClient as Socket, { tileCoordinate, playerTurnId: mockClient.id });

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

                    const tileCoordinate = { x: 5, y: 5 };
                    gateway.handleUserDidDoorAction(mockClient as Socket, { tileCoordinate, playerTurnId: mockClient.id });

            gateway.handleUserAttacked(mockClient, attackData);

            expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.OPPONENT_ATTACKED, attackData.attackResult);
            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.SUCCESSFUL_ATTACK);
            expect(gateway.endBattleTurn).toHaveBeenCalledWith(mockRoom.accessCode);
        });

                    const enemyPlayerId = 'enemy1';
                    gateway.handleUserDidBattleAction(mockClient as Socket, { playerTurnId: mockClient.id, enemyPlayerId });

            playGameBoardBattleService.userSucceededAttack.mockReturnValue(true);
            jest.spyOn(gateway, 'handleBattleEndedByDeath').mockImplementation(jest.fn());

            gateway.handleUserAttacked(mockClient, attackData);

                    const enemyPlayerId = 'enemy1';
                    gateway.handleUserDidBattleAction(mockClient as Socket, { playerTurnId: mockClient.id, enemyPlayerId });

        it('should handle failed attack', () => {
            const mockClient = { id: 'player1' } as Socket;
            const attackData = {
                attackResult: 0,
                playerHasTotem: false,
            };

            jest.spyOn(gateway, 'endBattleTurn').mockImplementation(jest.fn());

                    const attackResult = 1;
                    gateway.handleUserAttacked(mockClient as Socket, { playerTurnId: mockClient.id, attackResult, playerHasTotem: false });

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

                    gateway.handleUserAttacked(mockClient as Socket, { playerTurnId: mockClient.id, attackResult, playerHasTotem: false });

    describe('handleUserTriedEscape', () => {
        it('should handle successful escape', () => {
            const mockClient = { id: 'player1' } as Socket;
            playGameBoardBattleService.userUsedEvade.mockReturnValue(true);
            jest.spyOn(gateway, 'handleBattleEndedByEscape').mockImplementation(jest.fn());

            gateway.handleUserTriedEscape(mockClient);

            expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.OPPONENT_TRIED_ESCAPE);
            expect(gateway.handleBattleEndedByEscape).toHaveBeenCalledWith(mockRoom.accessCode);
        });

                    gateway.handleUserAttacked(mockClient as Socket, { playerTurnId: mockClient.id, attackResult, playerHasTotem: false });
                    expect(gateway.endBattleTurn).not.toHaveBeenCalled();
                });
            });

            gateway.handleUserTriedEscape(mockClient);

                    gateway.handleUserTriedEscape(mockClient as Socket, mockClient.id);

        it('should do nothing when room does not exist', () => {
            const mockClient = { id: 'player1' } as Socket;
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

            gateway.handleUserTriedEscape(mockClient);

                    gateway.handleUserTriedEscape(mockClient as Socket, mockClient.id);

    describe('handleUserWon', () => {
        it('should pause timer and emit game board player won', () => {
            const mockClient = { id: 'player1' } as Socket;

            gateway.handleUserWon(mockClient);

                    gateway.handleUserTriedEscape(mockClient as Socket, mockClient.id);
                    expect(gateway.endBattleTurn).not.toHaveBeenCalled();
                });
            });

        it('should do nothing when room does not exist', () => {
            const mockClient = { id: 'player1' } as Socket;
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

                    gateway.handleUserWon(mockClient as Socket, mockClient.id);

            expect(playGameBoardTimeService.pauseTimer).not.toHaveBeenCalled();
            expect(mockServer.to).not.toHaveBeenCalled();
        });
    });

                it('should handle invalid room', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

                    gateway.handleUserWon(mockClient as Socket, mockClient.id);
                    expect(playGameBoardTimeService.pauseTimer).not.toHaveBeenCalled();
                });
            });

            const result = gateway.isClientTurn(mockClient);

                    expect(gateway.isClientTurn(mockClient.id)).toBe(true);
                });

        it('should return false when room does not exist', () => {
            const mockClient = { id: 'player1' } as Socket;
            gameSocketRoomService.getRoomBySocketId.mockReturnValue(null);

                    expect(gateway.isClientTurn(mockClient.id)).toBe(false);
                });

            expect(result).toBe(false);
        });

                    expect(gateway.isClientTurn(mockClient.id)).toBe(false);
                });

                it('should return false if room is invalid', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    expect(gateway.isClientTurn(mockClient.id)).toBe(false);
                });
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

            describe('startRoomTurn', () => {
                it('should emit startTurn with the playerId', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[0]);
                    gateway.startRoomTurn(mockRoom.accessCode, mockRoom.currentPlayerTurn);

                expect(playGameBoardSocketService.initRoomGameBoard).toHaveBeenCalledWith(mockRoom.accessCode);
                expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.GAME_STARTED);
            });
        });
        describe('updateRoomTime', () => {
            it('should emit set time with current timer value', () => {
                const mockTime = 30;
                gameSocketRoomService.gameTimerRooms.get = jest.fn().mockReturnValue({ time: mockTime });

            describe('startBattleTurn', () => {
                it('should emit startBattleTurn with the playerId', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[0]);
                    gateway.startBattleTurn(mockRoom.accessCode, battleRoom.firstPlayerId);

                expect(mockServer.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                expect(mockServer.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith(SocketEvents.SET_TIME, mockTime);
            });
        });
        describe('updateRoomTime', () => {
            it('should emit set time with current timer value', () => {
                const mockTime = 30;
                gameSocketRoomService.gameTimerRooms.get = jest.fn().mockReturnValue({ time: mockTime });

            describe('handleStartBattle', () => {
                it('should pause timer, create battle timer, and emit startBattleTurn if room is valid', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardBattleService.getPlayerBattleTurn.mockReturnValue(battleRoom.firstPlayerId);
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[0]);

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

            describe('endBattleTurn', () => {
                it('should end battle turn, emit setTime, and start battle turn if room is valid', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    playGameBoardBattleService.getPlayerBattleTurn.mockReturnValue(battleRoom.firstPlayerId);
                    gameSocketRoomService.gameBattleRooms.set(mockRoom.accessCode, battleRoom);
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[0]);

            const updatedGameBoardRoom = gameSocketRoomService.gameBoardRooms.get(mockRoom.accessCode);
            expect(updatedGameBoardRoom.spawnPlaces.length).toBe(1);
            expect(updatedGameBoardRoom.spawnPlaces[0][1]).toBe('player2');
            expect(updatedGameBoardRoom.turnOrder).toEqual(['player2']);
        });

                    expect(playGameBoardBattleService.endBattleTurn).toHaveBeenCalledWith(mockRoom.accessCode);
                    expect(gateway.server.to).toHaveBeenCalledWith(mockRoom.accessCode.toString());
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('setTime', expect.any(Number));
                    expect(gateway.server.to(mockRoom.accessCode.toString()).emit).toHaveBeenCalledWith('startBattleTurn', battleRoom.firstPlayerId);
                });
            });
            describe('handleBattleEndedByEscape', () => {
                it('should end the battle and emit battleEndedByEscape with the first player ID', () => {
                    gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
                    gameSocketRoomService.gameBattleRooms.set(mockRoom.accessCode, battleRoom);
                    gameSocketRoomService.gameTimerRooms.set(mockRoom.accessCode, mockGameTimer);
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[0]);

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

                it('should emit firstPlayerWonBattle if the first player is the winner', () => {
                    jest.spyOn(gateway, 'handleEndBattle').mockImplementation(jest.fn());
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[0]);

        it('should emit GAME_BOARD_PLAYER_LEFT when not the last player', () => {
            const modifiedGameBoardRoom = {
                ...mockGameBoardRoom,
                turnOrder: ['player1', 'player2', 'player3'],
            };
            gameSocketRoomService.gameBoardRooms.set(mockRoom.accessCode, modifiedGameBoardRoom);
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            gateway.handlePlayerLeftRoom(mockRoom.accessCode, 'player1');

                it('should emit secondPlayerWonBattle and handleTimeOut if the second player is the winner', () => {
                    jest.spyOn(gateway, 'handleEndBattle').mockImplementation(jest.fn());
                    const handleTimeOutSpy = jest.spyOn(gateway, 'handleTimeOut').mockImplementation(jest.fn());
                    playGameBoardSocketService.getPlayerBySocketId.mockReturnValue(mockRoom.players[1]);

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
