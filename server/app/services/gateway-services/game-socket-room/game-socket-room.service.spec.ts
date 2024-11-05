// game-socket-room.service.spec.ts

import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { Avatar } from '@common/enums/avatar-enum';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameRoom, GameSocketRoomService, GameTimerState, PlayerCharacter } from './game-socket-room.service';

// Mock GameService
const mockGameService = {
    getGame: jest.fn(),
};

// Mock WebSocket Server
class MockServer {
    emit = jest.fn();
    to = jest.fn().mockReturnThis();
    emitTo = jest.fn();
    sockets = {
        sockets: new Map<string, unknown>(),
    };
    on = jest.fn();
}

describe('GameSocketRoomService', () => {
    let service: GameSocketRoomService;
    let gameService: typeof mockGameService;
    let server: MockServer;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameSocketRoomService,
                { provide: GameService, useValue: mockGameService },
                {
                    provide: WebSocketServer,
                    useClass: MockServer,
                },
                {
                    provide: Logger,
                    useValue: {
                        log: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<GameSocketRoomService>(GameSocketRoomService);
        gameService = module.get<typeof mockGameService>(GameService);
        server = module.get<typeof WebSocketServer>(WebSocketServer) as unknown as MockServer;

        // Reset all mocks before each test
        jest.clearAllMocks();
        service.server = server as unknown as Server;
    });

    describe('setSpawnCounter', () => {
        it('should return MIN_PLAYERS for SMALL map size', () => {
            const result = service.setSpawnCounter(MapSize.SMALL);
            expect(result).toBe(2);
        });

        it('should return MED_PLAYERS for MEDIUM map size', () => {
            const result = service.setSpawnCounter(MapSize.MEDIUM);
            expect(result).toBe(4);
        });

        it('should return MAX_PLAYERS for LARGE map size', () => {
            const result = service.setSpawnCounter(MapSize.LARGE);
            expect(result).toBe(6);
        });
    });

    describe('generateAccessCode', () => {
        it('should generate a 4-digit access code', () => {
            const accessCode = service.generateAccessCode();
            expect(accessCode).toBeGreaterThanOrEqual(1000);
            expect(accessCode).toBeLessThanOrEqual(9999);
        });

        it('should generate a unique access code', () => {
            // Mock existing rooms
            service['rooms'].set(1234, {} as GameRoom);
            service['rooms'].set(5678, {} as GameRoom);

            // Mock Math.random to control the generated code
            jest.spyOn(global.Math, 'random')
                .mockReturnValueOnce(0.234) // 1000 + 0.234*(8999) ≈ 1234 (déjà pris)
                .mockReturnValueOnce(0.567) // 1000 + 0.567*(8999) ≈ 5678 (déjà pris)
                .mockReturnValueOnce(0.23); // 1000 + 0.23*(8999) ≈ 3069 (disponible)

            const accessCode = service.generateAccessCode();
            expect(accessCode).toBe(3106); // Assurez-vous que ce code n'est pas pris

            // Restore Math.random
            (global.Math.random as jest.Mock).mockRestore();
        });
    });

    describe('createGame', () => {
        it('should create a new game room with unique access code', () => {
            gameService.getGame.mockResolvedValue({
                _id: 'game123',
                name: 'game1',
                description: 'zizi',
                size: MapSize.SMALL,
                mode: GameMode.Classique,
                imageUrl: 'url',
                isVisible: true,
                tiles: [],
            } as Game);

            const player: PlayerCharacter = {
                avatar: 'WARRIOR' as unknown as Avatar,
                name: 'Player1',
                socketId: 'socket1',
                attributes: {
                    life: 4,
                    speed: 4,
                    attack: 4,
                    defense: 4,
                },
            };

            // Mock generateAccessCode to return 1111
            jest.spyOn(service, 'generateAccessCode').mockReturnValue(1111);

            const newRoom = service.createGame('game123', player);

            expect(newRoom).toEqual({
                id: 'game123',
                accessCode: 1111,
                players: [player],
                organizer: 'socket1',
                isLocked: false,
                maxPlayers: 0, // Sera mis à jour après initRoomGameBoard
                currentPlayerTurn: 'socket1',
            });

            expect(service['rooms'].get(1111)).toEqual(newRoom);
            expect(service['playerRooms'].get('socket1')).toBe(1111);
            expect(service['gameTimerRooms'].get(1111)).toEqual({
                time: 0,
                isPaused: true,
                state: GameTimerState.PreparingTurn,
            });

            expect(gameService.getGame).toHaveBeenCalledWith('game123');
            // Après initRoomGameBoard, gameBoardRooms devrait contenir 1111
            expect(service['gameBoardRooms'].has(1111)).toBe(false);
            expect(service['rooms'].get(1111)?.maxPlayers).toBe(0);
            expect(service.logger.log).toHaveBeenCalledTimes(2);
        });
    });

    describe('addPlayerToRoom', () => {
        let room: GameRoom;
        let player1: PlayerCharacter;
        let player2: PlayerCharacter;
        let player3: PlayerCharacter;

        beforeEach(() => {
            room = {
                id: 'game123',
                accessCode: 2222,
                players: [],
                organizer: 'socket1',
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: 'socket1',
            };
            service['rooms'].set(2222, room);

            player1 = {
                avatar: 'ARCHER' as unknown as Avatar,
                name: 'Player1-2',
                socketId: 'socket4',
                attributes: {
                    life: 4,
                    speed: 4,
                    attack: 4,
                    defense: 4,
                },
            };

            player2 = {
                avatar: 'MAGE' as unknown as Avatar,
                name: 'Player2',
                socketId: 'socket2',
                attributes: {
                    life: 4,
                    speed: 4,
                    attack: 4,
                    defense: 4,
                },
            };

            player3 = {
                avatar: 'WARRIOR' as unknown as Avatar, // Même avatar que player1
                name: 'Player3',
                socketId: 'socket3',
                attributes: {
                    life: 4,
                    speed: 4,
                    attack: 4,
                    defense: 4,
                },
            };
        });

        it('should add a player to a non-locked room without avatar conflicts', () => {
            const result = service.addPlayerToRoom(2222, player1);
            expect(result).toBe(true);
            expect(room.players).toContain(player1);
            expect(service['playerRooms'].get('socket1')).toBe(undefined);
            expect(service.logger.log).toHaveBeenCalledWith('Joueur socket1 ajouté au room 2222 avec le nom Player1');
        });

        it('should not add a player if avatar is already taken', () => {
            service.addPlayerToRoom(2222, player1);
            const result = service.addPlayerToRoom(2222, player3);
            expect(result).toBeUndefined();
            expect(room.players).toContain(player1);
            expect(room.players).not.toContain(player3);
            expect(service.logger.log).toHaveBeenCalledWith('Avatar WARRIOR déjà pris dans la salle 2222');
        });

        it('should append suffix to player name if name already exists', () => {
            const duplicateNamePlayer: PlayerCharacter = {
                avatar: 'ARCHER' as unknown as Avatar,
                name: 'Player1',
                socketId: 'socket4',
                attributes: {
                    life: 4,
                    speed: 4,
                    attack: 4,
                    defense: 4,
                },
            };

            service.addPlayerToRoom(2222, player1);
            const result = service.addPlayerToRoom(2222, duplicateNamePlayer);
            expect(result).toBe(undefined);
            expect(room.players).toContainEqual({
                ...duplicateNamePlayer,
                name: 'Player1-2',
            });
            expect(service['playerRooms'].get('socket4')).toBe(2222);
            expect(service.logger.log).toHaveBeenCalledWith('Joueur socket4 ajouté au room 2222 avec le nom Player1-2');
        });

        it('should not add a player to a locked room', () => {
            room.isLocked = true;
            const result = service.addPlayerToRoom(2222, player2);
            expect(result).toBe(false);
            expect(room.players).not.toContain(player2);
            expect(service['playerRooms'].get('socket2')).toBeUndefined();
        });
    });

    describe('removePlayerFromRoom', () => {
        let room: GameRoom;
        let player1: PlayerCharacter;
        let player2: PlayerCharacter;

        beforeEach(() => {
            room = {
                id: 'game123',
                accessCode: 3333,
                players: [],
                organizer: 'socket1',
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: 'socket1',
            };
            service['rooms'].set(3333, room);

            player1 = {
                avatar: 'WARRIOR' as unknown as Avatar,
                name: 'Player1',
                socketId: 'socket1',
                attributes: {
                    life: 4,
                    speed: 4,
                    attack: 4,
                    defense: 4,
                },
            };

            player2 = {
                avatar: 'MAGE' as unknown as Avatar,
                name: 'Player2',
                socketId: 'socket2',
                attributes: {
                    life: 4,
                    speed: 4,
                    attack: 4,
                    defense: 4,
                },
            };

            room.players.push(player1, player2);
            service['playerRooms'].set('socket1', 3333);
            service['playerRooms'].set('socket2', 3333);
        });

        it('should remove a player from the room', () => {
            service.removePlayerFromRoom('socket2');
            expect(room.players).not.toContain(player2);
            expect(service['playerRooms'].has('socket2')).toBe(false);
            expect(service.logger.log).toHaveBeenCalledWith('Joueur socket2 enlevé du room 3333');
            expect(service.signalPlayerLeftRoom.next).toHaveBeenCalledWith({ accessCode: 3333, playerSocketId: 'socket2' });
        });

        it('should delete the room if no players left', () => {
            service.removePlayerFromRoom('socket1');
            service.removePlayerFromRoom('socket2');
            expect(service['rooms'].has(3333)).toBe(false);
            expect(service['gameBoardRooms'].has(3333)).toBe(false);
            expect(service['gameTimerRooms'].has(3333)).toBe(false);
            expect(service.logger.log).toHaveBeenCalledWith("Room 3333 suprimmé car il n'y a plus de joueurs");
        });

        it('should assign a new organizer if the organizer leaves', () => {
            service.removePlayerFromRoom('socket1');
            expect(room.organizer).toBe('socket2');
            expect(service.logger.log).toHaveBeenCalledWith("L'organisateur est parti, le nouveau: socket2");
        });
    });

    describe('lockRoom and unlockRoom', () => {
        let room: GameRoom;
        let organizer: PlayerCharacter;
        let player: PlayerCharacter;

        beforeEach(() => {
            room = {
                id: 'game123',
                accessCode: 4444,
                players: [],
                organizer: 'socket1',
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: 'socket1',
            };
            service['rooms'].set(4444, room);

            organizer = {
                avatar: 'WARRIOR' as unknown as Avatar,
                name: 'Organizer',
                socketId: 'socket1',
                attributes: {
                    life: 4,
                    speed: 4,
                    attack: 4,
                    defense: 4,
                },
            };

            player = {
                avatar: 'MAGE' as unknown as Avatar,
                name: 'Player',
                socketId: 'socket2',
                attributes: {
                    life: 4,
                    speed: 4,
                    attack: 4,
                    defense: 4,
                },
            };

            room.players.push(organizer, player);
            service['playerRooms'].set('socket1', 4444);
            service['playerRooms'].set('socket2', 4444);
        });

        it('should lock the room by the organizer', () => {
            const result = service.lockRoom(4444, 'socket1');
            expect(result).toBe(true);
            expect(room.isLocked).toBe(true);
            expect(service.logger.log).toHaveBeenCalledWith('Room 4444 verrouillé par organisateur socket1');
        });

        it('should not lock the room if not called by the organizer', () => {
            const result = service.lockRoom(4444, 'socket2');
            expect(result).toBe(false);
            expect(room.isLocked).toBe(false);
        });

        it('should unlock the room by the organizer if players are less than max', () => {
            room.isLocked = true;
            const result = service.unlockRoom(4444, 'socket1');
            expect(result).toBe(true);
            expect(room.isLocked).toBe(false);
            expect(service.logger.log).toHaveBeenCalledWith('Room 4444 déverrouillé par organisateur socket1');
        });

        it('should not unlock the room if players are at max', () => {
            room.isLocked = true;
            room.maxPlayers = 2; // Les joueurs sont 2, ce qui est le maximum
            const result = service.unlockRoom(4444, 'socket1');
            expect(result).toBe(false);
            expect(room.isLocked).toBe(true);
        });

        it('should not unlock the room if not called by the organizer', () => {
            room.isLocked = true;
            const result = service.unlockRoom(4444, 'socket2');
            expect(result).toBe(false);
            expect(room.isLocked).toBe(true);
        });
    });

    describe('kickPlayer', () => {
        let room: GameRoom;
        let organizer: PlayerCharacter;
        let player: PlayerCharacter;

        beforeEach(() => {
            room = {
                id: 'game123',
                accessCode: 5555,
                players: [],
                organizer: 'socket1',
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: 'socket1',
            };
            service['rooms'].set(5555, room);

            organizer = {
                avatar: 'WARRIOR' as unknown as Avatar,
                name: 'Organizer',
                socketId: 'socket1',
                attributes: {
                    life: 4,
                    speed: 4,
                    attack: 4,
                    defense: 4,
                },
            };

            player = {
                avatar: 'MAGE' as unknown as Avatar,
                name: 'Player',
                socketId: 'socket2',
                attributes: {
                    life: 4,
                    speed: 4,
                    attack: 4,
                    defense: 4,
                },
            };

            room.players.push(organizer, player);
            service['playerRooms'].set('socket1', 5555);
            service['playerRooms'].set('socket2', 5555);
        });

        it('should allow the organizer to kick a player', () => {
            const result = service.kickPlayer(5555, 'socket2', 'socket1');
            expect(result).toBe(true);
            expect(room.players).not.toContain(player);
            expect(service['playerRooms'].has('socket2')).toBe(false);
            expect(service.logger.log).toHaveBeenCalledWith('Joueur socket2 enlevé du room 5555');
        });

        it('should not allow a non-organizer to kick a player', () => {
            const result = service.kickPlayer(5555, 'socket2', 'socket2');
            expect(result).toBe(false);
            expect(room.players).toContain(player);
            expect(service.logger.log).not.toHaveBeenCalledWith('Joueur socket2 enlevé du room 5555');
        });
    });

    describe('handlePlayerDisconnect', () => {
        let room: GameRoom;
        let player1: PlayerCharacter;
        let player2: PlayerCharacter;

        beforeEach(() => {
            room = {
                id: 'game123',
                accessCode: 6666,
                players: [],
                organizer: 'socket1',
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: 'socket1',
            };
            service['rooms'].set(6666, room);

            player1 = {
                avatar: 'WARRIOR' as unknown as Avatar,
                name: 'Player1',
                socketId: 'socket1',
                attributes: {
                    life: 4,
                    speed: 4,
                    attack: 4,
                    defense: 4,
                },
            };

            player2 = {
                avatar: 'MAGE' as unknown as Avatar,
                name: 'Player2',
                socketId: 'socket2',
                attributes: {
                    life: 4,
                    speed: 4,
                    attack: 4,
                    defense: 4,
                },
            };

            room.players.push(player1, player2);
            service['playerRooms'].set('socket1', 6666);
            service['playerRooms'].set('socket2', 6666);
        });

        it('should remove the player from the room on disconnect', () => {
            service.handlePlayerDisconnect('socket2');
            expect(room.players).not.toContain(player2);
            expect(service['playerRooms'].has('socket2')).toBe(false);
            expect(service.signalPlayerLeftRoom.next).toHaveBeenCalledWith({ accessCode: 6666, playerSocketId: 'socket2' });
            expect(service.logger.log).toHaveBeenCalledWith('Joueur socket2 enlevé du room 6666');
        });

        it('should delete the room if the last player disconnects', () => {
            service.handlePlayerDisconnect('socket1');
            service.handlePlayerDisconnect('socket2');
            expect(service['rooms'].has(6666)).toBe(false);
            expect(service['gameBoardRooms'].has(6666)).toBe(false);
            expect(service['gameTimerRooms'].has(6666)).toBe(false);
            expect(service.logger.log).toHaveBeenCalledWith("Room 6666 suprimmé car il n'y a plus de joueurs");
        });

        it('should assign a new organizer if the organizer disconnects', () => {
            service.handlePlayerDisconnect('socket1');
            expect(room.organizer).toBe('socket2');
            expect(service.logger.log).toHaveBeenCalledWith("L'organisateur est parti, le nouveau: socket2");
        });
    });

    describe('getRoomByAccessCode and getRoomBySocketId', () => {
        let room: GameRoom;
        let player: PlayerCharacter;

        beforeEach(() => {
            room = {
                id: 'game123',
                accessCode: 7777,
                players: [],
                organizer: 'socket1',
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: 'socket1',
            };
            service['rooms'].set(7777, room);

            player = {
                avatar: 'WARRIOR' as unknown as Avatar,
                name: 'Player1',
                socketId: 'socket1',
                attributes: {
                    life: 4,
                    speed: 4,
                    attack: 4,
                    defense: 4,
                },
            };

            room.players.push(player);
            service['playerRooms'].set('socket1', 7777);
        });

        it('should retrieve the room by access code', () => {
            const fetchedRoom = service.getRoomByAccessCode(7777);
            expect(fetchedRoom).toEqual(room);
        });

        it('should retrieve the room by socket ID', () => {
            const fetchedRoom = service.getRoomBySocketId('socket1');
            expect(fetchedRoom).toEqual(room);
        });

        it('should return undefined if access code does not exist', () => {
            const fetchedRoom = service.getRoomByAccessCode(8888);
            expect(fetchedRoom).toBeUndefined();
        });

        it('should return undefined if socket ID does not exist', () => {
            const fetchedRoom = service.getRoomBySocketId('socket2');
            expect(fetchedRoom).toBeUndefined();
        });
    });

    describe('setCurrentPlayerTurn', () => {
        let room: GameRoom;

        beforeEach(() => {
            room = {
                id: 'game123',
                accessCode: 9999,
                players: [],
                organizer: 'socket1',
                isLocked: false,
                maxPlayers: 4,
                currentPlayerTurn: 'socket1',
            };
            service['rooms'].set(9999, room);
        });

        it('should set the current player turn', () => {
            service.setCurrentPlayerTurn(9999, 'socket2');
            expect(room.currentPlayerTurn).toBe('socket2');
            expect(service['rooms'].get(9999)?.currentPlayerTurn).toBe('socket2');
        });

        it('should do nothing if the room does not exist', () => {
            service.setCurrentPlayerTurn(8888, 'socket3');
            expect(service['rooms'].get(8888)).toBeUndefined();
        });
    });

    describe('initRoomGameBoard and setupGameBoardRoom', () => {
        let room: GameRoom;
        let game: Game;

        beforeEach(() => {
            room = {
                id: 'game123',
                accessCode: 1010,
                players: [],
                organizer: 'socket1',
                isLocked: false,
                maxPlayers: 0,
                currentPlayerTurn: 'socket1',
            };
            service['rooms'].set(1010, room);

            game = {
                _id: 'game123',
                name: 'game1',
                description: 'zizi',
                size: MapSize.SMALL,
                mode: GameMode.Classique,
                imageUrl: 'url',
                isVisible: true,
                tiles: [],
            };
        });

        it('should initialize the game board room', async () => {
            gameService.getGame.mockResolvedValue(game);
            jest.spyOn(service, 'setupGameBoardRoom');

            await service.initRoomGameBoard(1010);

            expect(gameService.getGame).toHaveBeenCalledWith('game123');
            expect(service.setupGameBoardRoom).toHaveBeenCalledWith(1010, game);
        });

        it('should setup the game board room correctly', () => {
            service.setupGameBoardRoom(1010, game);
            expect(service['gameBoardRooms'].get(1010)).toEqual({
                game,
                spawnPlaces: [],
                turnOrder: [],
            });
            expect(service['rooms'].get(1010)?.maxPlayers).toBe(2); // MapSize.SMALL => 2
            expect(service.logger.log).toHaveBeenCalledWith('maxPlayers mis à jour à 2 pour la salle 1010');
        });
    });
});
