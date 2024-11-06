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
    });
});
