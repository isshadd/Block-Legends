import { GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { PlayGameStatisticsService } from '@app/services/gateway-services/play-game-statistics/play-game-statistics.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { GameRoom } from '@common/interfaces/game-room';
import { GameBattle } from '@common/interfaces/game.battle';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayGameBoardBattleService } from './play-game-board-battle.service';

jest.useFakeTimers();

describe('PlayGameBoardBattleService', () => {
    let service: PlayGameBoardBattleService;
    let gameSocketRoomService: jest.Mocked<GameSocketRoomService>;
    let playGameStatisticsService: jest.Mocked<PlayGameStatisticsService>;

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
            } as PlayerCharacter,
            {
                socketId: 'player2',
                attributes: {
                    speed: 5,
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

    beforeEach(async () => {
        const mockGameSocketRoomService = {
            gameBattleRooms: new Map<number, GameBattle>(),
            getRoomByAccessCode: jest.fn(),
        };

        const mockPlayGameStatisticsService = {
            increasePlayerStatistic: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayGameBoardBattleService,
                { provide: GameSocketRoomService, useValue: mockGameSocketRoomService },
                { provide: PlayGameStatisticsService, useValue: mockPlayGameStatisticsService },
            ],
        }).compile();

        service = module.get<PlayGameBoardBattleService>(PlayGameBoardBattleService);
        gameSocketRoomService = module.get<GameSocketRoomService>(GameSocketRoomService) as jest.Mocked<GameSocketRoomService>;
        playGameStatisticsService = module.get<PlayGameStatisticsService>(PlayGameStatisticsService) as jest.Mocked<PlayGameStatisticsService>;
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createBattleTimer', () => {
        it('should create a battle timer with correct initial values', () => {
            const accessCode = 123;
            const firstPlayerId = 'player1';
            const secondPlayerId = 'player2';

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            service.createBattleTimer(accessCode, firstPlayerId, secondPlayerId);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            const battleRoom = gameSocketRoomService.gameBattleRooms.get(accessCode);
            expect(battleRoom).toBeDefined();
            expect(battleRoom.time).toBe(service.activeTurnTime);
            expect(battleRoom.firstPlayerId).toBe(firstPlayerId);
            expect(battleRoom.secondPlayerId).toBe(secondPlayerId);
            expect(battleRoom.isFirstPlayerTurn).toBe(true);
            expect(battleRoom.firstPlayerRemainingEvades).toBe(service.startingEvadeAttempts);
            expect(battleRoom.secondPlayerRemainingEvades).toBe(service.startingEvadeAttempts);
            expect(battleRoom.firstPlayerRemainingLife).toBe(100);
            expect(battleRoom.secondPlayerRemainingLife).toBe(100);
        });

        it('should set isFirstPlayerTurn to false if second player has higher speed', () => {
            const accessCode = 123;
            const firstPlayerId = 'player1';
            const secondPlayerId = 'player2';
            mockRoom.players[1].attributes.speed = 15;

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            service.createBattleTimer(accessCode, firstPlayerId, secondPlayerId);

            const battleRoom = gameSocketRoomService.gameBattleRooms.get(accessCode);
            expect(battleRoom.isFirstPlayerTurn).toBe(false);
        });

        it('should not create a battle timer if room does not exist', () => {
            const accessCode = 789;
            const firstPlayerId = 'player1';
            const secondPlayerId = 'player2';

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(undefined);

            service.createBattleTimer(accessCode, firstPlayerId, secondPlayerId);

            expect(gameSocketRoomService.gameBattleRooms.has(accessCode)).toBe(false);
        });

        it('should not create a battle timer if one of the players is missing', () => {
            const accessCode = 101112;
            const firstPlayerId = 'player1';
            const secondPlayerId = 'player2';

            mockRoom.players = mockRoom.players.filter((player) => player.socketId !== secondPlayerId);

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            service.createBattleTimer(accessCode, firstPlayerId, secondPlayerId);

            expect(gameSocketRoomService.gameBattleRooms.has(accessCode)).toBe(false);
        });
    });

    describe('secondPassed', () => {
        it('should decrement time and emit signalRoomTimePassed when time > 0', () => {
            const accessCode = 1;
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

            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            const signalRoomTimePassedSpy = jest.fn();
            service.signalRoomTimePassed$.subscribe(signalRoomTimePassedSpy);
            jest.spyOn(service.signalRoomTimeOut, 'next');
            jest.spyOn(service.signalRoomTimePassed, 'next');
            service.secondPassed();

            expect(battleRoom.time).toBe(2);
            expect(signalRoomTimePassedSpy).toHaveBeenCalledWith(accessCode);
            expect(service.signalRoomTimeOut.next).not.toHaveBeenCalled();
        });

        it('should emit signalRoomTimeOut when time reaches 0', () => {
            const accessCode = 2;
            const battleRoom = {
                time: 0,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
                isFirstPlayerTurn: true,
                firstPlayerRemainingEvades: 2,
                secondPlayerRemainingEvades: 2,
                firstPlayerRemainingLife: 100,
                secondPlayerRemainingLife: 100,
            };

            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            const signalRoomTimeOutSpy = jest.fn();
            service.signalRoomTimeOut$.subscribe(signalRoomTimeOutSpy);
            jest.spyOn(service.signalRoomTimeOut, 'next');
            jest.spyOn(service.signalRoomTimePassed, 'next');

            service.secondPassed();

            expect(battleRoom.time).toBe(0);
            expect(signalRoomTimeOutSpy).toHaveBeenCalledWith(accessCode);
        });
    });

    describe('endBattleTurn', () => {
        it('should toggle the turn and reset time to ACTIVE_TURN_TIME', () => {
            const accessCode = 3;
            const battleRoom = {
                time: 2,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
                isFirstPlayerTurn: true,
                firstPlayerRemainingEvades: 1,
                secondPlayerRemainingEvades: 1,
                firstPlayerRemainingLife: 100,
                secondPlayerRemainingLife: 100,
            };

            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            service.endBattleTurn(accessCode);

            expect(battleRoom.isFirstPlayerTurn).toBe(false);
            expect(battleRoom.time).toBe(service.activeTurnTime);
        });

        it('should set time to NO_EVADE_ACTIVE_TURN_TIME if first player has no evades left', () => {
            const accessCode = 4;
            const battleRoom = {
                time: 2,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
                isFirstPlayerTurn: true,
                firstPlayerRemainingEvades: 1,
                secondPlayerRemainingEvades: 0,
                firstPlayerRemainingLife: 100,
                secondPlayerRemainingLife: 100,
            };

            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            service.endBattleTurn(accessCode);

            expect(battleRoom.isFirstPlayerTurn).toBe(false);
            expect(battleRoom.time).toBe(service.noEvadeActiveTurnTime);
        });

        it('should set time to NO_EVADE_ACTIVE_TURN_TIME if second player has no evades left', () => {
            const accessCode = 5;
            const battleRoom = {
                time: 2,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
                isFirstPlayerTurn: false,
                firstPlayerRemainingEvades: 0,
                secondPlayerRemainingEvades: 1,
                firstPlayerRemainingLife: 100,
                secondPlayerRemainingLife: 100,
            };

            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            service.endBattleTurn(accessCode);

            expect(battleRoom.isFirstPlayerTurn).toBe(true);
            expect(battleRoom.time).toBe(service.noEvadeActiveTurnTime);
        });

        it('should do nothing if battle room does not exist', () => {
            const accessCode = 999;

            expect(() => service.endBattleTurn(accessCode)).not.toThrow();
        });
    });

    describe('getPlayerBattleTurn', () => {
        it('should return firstPlayerId when isFirstPlayerTurn is true', () => {
            const accessCode = 6;
            const battleRoom = {
                time: 2,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
                isFirstPlayerTurn: true,
                firstPlayerRemainingEvades: 0,
                secondPlayerRemainingEvades: 1,
                firstPlayerRemainingLife: 100,
                secondPlayerRemainingLife: 100,
            };

            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            const currentPlayer = service.getPlayerBattleTurn(accessCode);
            expect(currentPlayer).toBe('player1');
        });

        it('should return secondPlayerId when isFirstPlayerTurn is false', () => {
            const accessCode = 7;
            const battleRoom = {
                time: 2,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
                isFirstPlayerTurn: false,
                firstPlayerRemainingEvades: 0,
                secondPlayerRemainingEvades: 1,
                firstPlayerRemainingLife: 100,
                secondPlayerRemainingLife: 100,
            };

            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            const currentPlayer = service.getPlayerBattleTurn(accessCode);
            expect(currentPlayer).toBe('player2');
        });

        it('should return empty string if battle room does not exist', () => {
            const accessCode = 888;

            const currentPlayer = service.getPlayerBattleTurn(accessCode);
            expect(currentPlayer).toBe('');
        });
    });

    describe('userUsedEvade', () => {
        it('should decrement firstPlayerRemainingEvades and return boolean based on random', () => {
            const accessCode = 8;
            const playerId = 'player1';
            const battleRoom = {
                time: 2,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
                isFirstPlayerTurn: false,
                firstPlayerRemainingEvades: 2,
                secondPlayerRemainingEvades: 2,
                firstPlayerRemainingLife: 100,
                secondPlayerRemainingLife: 100,
            };

            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            jest.spyOn(Math, 'random').mockReturnValue(0.3);

            const result = service.userUsedEvade(accessCode, playerId);
            expect(battleRoom.firstPlayerRemainingEvades).toBe(1);
            expect(result).toBe(true);

            (Math.random as jest.Mock).mockRestore();
        });

        it('should return false if player has no evades left', () => {
            const accessCode = 9;
            const playerId = 'player1';
            const battleRoom = {
                time: 2,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
                isFirstPlayerTurn: false,
                firstPlayerRemainingEvades: 0,
                secondPlayerRemainingEvades: 0,
                firstPlayerRemainingLife: 100,
                secondPlayerRemainingLife: 100,
            };

            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            const result = service.userUsedEvade(accessCode, playerId);
            expect(battleRoom.firstPlayerRemainingEvades).toBe(0);
            expect(result).toBe(false);

            expect(battleRoom.secondPlayerRemainingEvades).toBe(0);
            expect(result).toBe(false);
        });

        it('should decrement secondPlayerRemainingEvades and return boolean based on random', () => {
            const accessCode = 10;
            const playerId = 'player2';
            const battleRoom = {
                time: 2,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
                isFirstPlayerTurn: false,
                firstPlayerRemainingEvades: 2,
                secondPlayerRemainingEvades: 2,
                firstPlayerRemainingLife: 100,
                secondPlayerRemainingLife: 100,
            };

            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            jest.spyOn(Math, 'random').mockReturnValue(0.5);

            const result = service.userUsedEvade(accessCode, playerId);
            expect(battleRoom.secondPlayerRemainingEvades).toBe(1);
            expect(result).toBe(false);

            (Math.random as jest.Mock).mockRestore();
        });

        it('should return false if playerId does not match any player', () => {
            const accessCode = 11;
            const playerId = 'unknownPlayer';
            const battleRoom = {
                time: 2,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
                isFirstPlayerTurn: false,
                firstPlayerRemainingEvades: 0,
                secondPlayerRemainingEvades: 1,
                firstPlayerRemainingLife: 100,
                secondPlayerRemainingLife: 100,
            };

            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            const result = service.userUsedEvade(accessCode, playerId);
            expect(result).toBe(false);
        });

        it('should return false if battle room does not exist', () => {
            const accessCode = 777;
            const playerId = 'player1';

            const result = service.userUsedEvade(accessCode, playerId);
            expect(result).toBe(false);
        });
    });

    describe('userSuccededAttack', () => {
        it('should decrement secondPlayerRemainingLife and return true if life <= 0', () => {
            const accessCode = 12;
            const battleRoom = {
                time: 2,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
                isFirstPlayerTurn: true,
                firstPlayerRemainingEvades: 0,
                secondPlayerRemainingEvades: 1,
                firstPlayerRemainingLife: 100,
                secondPlayerRemainingLife: 1,
            };

            playGameStatisticsService.increasePlayerStatistic.mockImplementation(jest.fn());
            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            const result = service.userSucceededAttack(accessCode, false);
            expect(playGameStatisticsService.increasePlayerStatistic).toHaveBeenCalled();
            expect(battleRoom.secondPlayerRemainingLife).toBe(0);
            expect(result).toBe(true);
        });

        it('should decrement firstPlayerRemainingLife and return true if life <= 0', () => {
            const accessCode = 13;
            const battleRoom = {
                time: 2,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
                isFirstPlayerTurn: false,
                firstPlayerRemainingEvades: 0,
                secondPlayerRemainingEvades: 1,
                firstPlayerRemainingLife: 1,
                secondPlayerRemainingLife: 100,
            };

            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            const result = service.userSucceededAttack(accessCode, false);
            expect(battleRoom.firstPlayerRemainingLife).toBe(0);
            expect(result).toBe(true);
        });

        it('should decrement life and return undefined if life > 0', () => {
            const accessCode = 14;
            const battleRoom = {
                time: 2,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
                isFirstPlayerTurn: true,
                firstPlayerRemainingEvades: 0,
                secondPlayerRemainingEvades: 1,
                firstPlayerRemainingLife: 100,
                secondPlayerRemainingLife: 50,
            };

            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            const result = service.userSucceededAttack(accessCode, false);
            expect(battleRoom.secondPlayerRemainingLife).toBe(49);
            expect(result).toBeUndefined();
        });

        it('should return false if battle room does not exist', () => {
            const accessCode = 9999;

            const result = service.userSucceededAttack(accessCode, false);
            expect(result).toBe(false);
        });
    });

    describe('battleRoomFinished', () => {
        it('should delete the battle room from gameBattleRooms', () => {
            const accessCode = 15;
            const battleRoom = {
                time: 2,
                firstPlayerId: 'player1',
                secondPlayerId: 'player2',
                isFirstPlayerTurn: true,
                firstPlayerRemainingEvades: 0,
                secondPlayerRemainingEvades: 1,
                firstPlayerRemainingLife: 100,
                secondPlayerRemainingLife: 50,
            };

            gameSocketRoomService.gameBattleRooms.set(accessCode, battleRoom);

            service.battleRoomFinished(accessCode);

            expect(gameSocketRoomService.gameBattleRooms.has(accessCode)).toBe(false);
        });

        it('should do nothing if battle room does not exist', () => {
            const accessCode = 16;

            expect(() => service.battleRoomFinished(accessCode)).not.toThrow();
        });
    });

    describe('startTimer', () => {
        it('should call secondPassed every second', () => {
            const secondPassedSpy = jest.spyOn(service, 'secondPassed');

            jest.advanceTimersByTime(3000);

            expect(secondPassedSpy).toHaveBeenCalledTimes(3);
        });
    });
});
