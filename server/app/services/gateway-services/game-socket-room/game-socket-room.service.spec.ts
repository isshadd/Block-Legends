import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameRoom, GameSocketRoomService, PlayerCharacter } from './game-socket-room.service';

describe('GameSocketRoomService', () => {
    let service: GameSocketRoomService;
    let gameService: jest.Mocked<GameService>;
    let logger: jest.Mocked<Logger>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameSocketRoomService,
                {
                    provide: GameService,
                    useValue: {
                        getGame: jest.fn(),
                    },
                },
                {
                    provide: Logger,
                    useClass: Logger, // Utilisation de la classe Logger réelle avec des méthodes mockées
                },
            ],
        }).compile();

        service = module.get<GameSocketRoomService>(GameSocketRoomService);
        gameService = module.get<GameService>(GameService) as jest.Mocked<GameService>;
        logger = module.get<Logger>(Logger) as jest.Mocked<Logger>;

        // Mock des méthodes du Logger
        jest.spyOn(logger, 'log').mockImplementation(() => {});
        jest.spyOn(logger, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Fonction utilitaire pour créer un PlayerCharacter
    const createPlayer = (socketId: string, name: string = 'Player'): PlayerCharacter => ({
        name,
        socketId,
        attributes: {
            life: 5,
            speed: 5,
            attack: 5,
            defense: 5,
        },
    });

    describe('setSpawnCounter', () => {
        it('should return MIN_PLAYERS for SMALL map size', () => {
            expect(service.setSpawnCounter(MapSize.SMALL)).toBe(2);
        });

        it('should return MED_PLAYERS for MEDIUM map size', () => {
            expect(service.setSpawnCounter(MapSize.MEDIUM)).toBe(4);
        });

        it('should return MAX_PLAYERS for LARGE map size', () => {
            expect(service.setSpawnCounter(MapSize.LARGE)).toBe(6);
        });
    });

    describe('generateAccessCode', () => {
        it('should generate a unique access code within range', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.5); // Access code = 1000 + 0.5 * 9000 = 5500
            const accessCode = service.generateAccessCode();
            expect(accessCode).toBe(5500);
            expect(service['rooms'].has(accessCode)).toBe(false);
            (Math.random as jest.Mock).mockRestore();
        });

        it('should regenerate access code if it already exists', () => {
            // Simuler que l'access code 5500 est déjà pris
            service['rooms'].set(5500, createRoom('1', 5500, 'organizer1'));

            // Mock Math.random pour générer 5500 puis 5501
            const mockRandom = jest
                .spyOn(Math, 'random')
                .mockReturnValueOnce((5500 - 1000) / 9000) // Génère 5500
                .mockReturnValueOnce((5501 - 1000) / 9000); // Génère 5501

            const accessCode = service.generateAccessCode();
            expect(accessCode).toBe(5501);
            expect(service['rooms'].has(accessCode)).toBe(false);

            mockRandom.mockRestore();
        });
    });

    describe('createGame', () => {
        it('should create a new game room with unique access code', async () => {
            const gameId = 'game1';
            const organizer: PlayerCharacter = createPlayer('organizer1', 'Organizer');

            // Mock generateAccessCode to return 5500
            jest.spyOn(service, 'generateAccessCode').mockReturnValue(5500);

            // Mock GameService.getGame to return a game
            const mockGame: Game = {
                _id: gameId,
                size: MapSize.MEDIUM,
                name: 'Test Game',
                description: 'A test game',
                mode: GameMode.Classique,
                imageUrl: 'image.png',
                isVisible: true,
                tiles: [],
            };
            gameService.getGame.mockResolvedValue(mockGame);

            // Call createGame
            const room = service.createGame(gameId, organizer);

            // Assertions
            expect(service.generateAccessCode).toHaveBeenCalled();
            expect(service['rooms'].has(5500)).toBe(true);
            expect(service['playerRooms'].get('organizer1')).toBe(5500);
            expect(service['gameTimerRooms'].has(5500)).toBe(true);
            expect(logger.log).toHaveBeenCalledWith(expect.stringContaining(`Jeu crée avec ID: ${gameId}`));
            expect(logger.log).toHaveBeenCalledWith(expect.stringContaining(`maxPlayers mis à jour à 4 pour la salle 5500`));

            // Vérifier que initRoomGameBoard a été appelé deux fois
            expect(service.initRoomGameBoard).toHaveBeenCalledTimes(2);
        });

        it('should handle duplicate access codes by regenerating', () => {
            const gameId = 'game2';
            const organizer: PlayerCharacter = createPlayer('organizer2', 'Organizer2');

            // Simuler que l'access code 5500 est déjà pris
            service['rooms'].set(5500, createRoom(gameId, 5500, 'organizer2'));

            // Mock generateAccessCode to return 5500 first (taken), then 5501
            const mockRandom = jest.spyOn(service, 'generateAccessCode').mockReturnValueOnce(5500).mockReturnValueOnce(5501);

            // Mock GameService.getGame
            const mockGame: Game = {
                _id: gameId,
                size: MapSize.LARGE,
                name: 'Test Game 2',
                description: 'Another test game',
                mode: GameMode.Classique,
                imageUrl: 'image2.png',
                isVisible: true,
                tiles: [],
            };
            gameService.getGame.mockResolvedValue(mockGame);

            // Call createGame
            const room = service.createGame(gameId, organizer);

            // Assertions
            expect(service.generateAccessCode).toHaveBeenCalledTimes(2);
            expect(service['rooms'].has(5501)).toBe(true);
            expect(service['playerRooms'].get('organizer2')).toBe(5501);
            expect(logger.log).toHaveBeenCalledWith(expect.stringContaining(`Jeu crée avec ID: ${gameId}`));
            expect(logger.log).toHaveBeenCalledWith(expect.stringContaining(`maxPlayers mis à jour à 6 pour la salle 5501`));

            mockRandom.mockRestore();
        });
    });

    describe('getRoomByAccessCode', () => {
        it('should return the room if it exists', () => {
            const room = createRoom('game3', 6000, 'organizer3');
            service['rooms'].set(6000, room);

            const fetchedRoom = service.getRoomByAccessCode(6000);
            expect(fetchedRoom).toEqual(room);
        });

        it('should return undefined if the room does not exist', () => {
            const fetchedRoom = service.getRoomByAccessCode(7000);
            expect(fetchedRoom).toBeUndefined();
        });
    });

    describe('getRoomBySocketId', () => {
        it('should return the room if socketId is associated with a room', () => {
            const room = createRoom('game4', 6500, 'organizer4');
            service['rooms'].set(6500, room);
            service['playerRooms'].set('player1', 6500);

            const fetchedRoom = service.getRoomBySocketId('player1');
            expect(fetchedRoom).toEqual(room);
        });

        it('should return undefined if socketId is not associated with any room', () => {
            const fetchedRoom = service.getRoomBySocketId('nonexistent');
            expect(fetchedRoom).toBeUndefined();
        });
    });

    describe('addPlayerToRoom', () => {
        it('should add a player to the room if room exists and is not locked', () => {
            const room = createRoom('game5', 7000, 'organizer5');
            service['rooms'].set(7000, room);

            const newPlayer: PlayerCharacter = createPlayer('player2', 'Player2');

            const result = service.addPlayerToRoom(7000, newPlayer);

            expect(result).toBe(true);
            expect(room.players).toContain(newPlayer);
            expect(service['playerRooms'].get('player2')).toBe(7000);
            expect(logger.log).toHaveBeenCalledWith(`Joueur player2 ajouté au room 7000 avec le nom Player2`);
        });

        it('should not add a player if room is locked', () => {
            const room = createRoom('game6', 7500, 'organizer6');
            room.isLocked = true;
            service['rooms'].set(7500, room);

            const newPlayer: PlayerCharacter = createPlayer('player3', 'Player3');

            const result = service.addPlayerToRoom(7500, newPlayer);

            expect(result).toBe(false);
            expect(room.players).not.toContain(newPlayer);
            expect(service['playerRooms'].get('player3')).toBeUndefined();
            expect(logger.log).not.toHaveBeenCalledWith(`Joueur player3 ajouté au room 7500 avec le nom Player3`);
        });

        it('should handle duplicate player names by appending a suffix', () => {
            const room = createRoom('game7', 8000, 'organizer7');
            room.players.push(createPlayer('player4', 'Player4'));
            service['rooms'].set(8000, room);

            const newPlayer: PlayerCharacter = createPlayer('player5', 'Player4'); // Duplicate name

            const result = service.addPlayerToRoom(8000, newPlayer);

            expect(result).toBe(true);
            expect(newPlayer.name).toBe('Player4-1');
            expect(room.players).toContain(newPlayer);
            expect(service['playerRooms'].get('player5')).toBe(8000);
            expect(logger.log).toHaveBeenCalledWith(`Joueur player5 ajouté au room 8000 avec le nom Player4-1`);
        });

        it('should not add a player if room does not exist', () => {
            const newPlayer: PlayerCharacter = createPlayer('player6', 'Player6');

            const result = service.addPlayerToRoom(9000, newPlayer);

            expect(result).toBe(false);
            expect(service['playerRooms'].get('player6')).toBeUndefined();
            expect(logger.log).not.toHaveBeenCalledWith(`Joueur player6 ajouté au room 9000 avec le nom Player6`);
        });
    });

    describe('removePlayerFromRoom', () => {
        it('should remove a player from the room and delete the room if no players left', () => {
            const room = createRoom('game8', 8500, 'organizer8');
            service['rooms'].set(8500, room);
            service['playerRooms'].set('player7', 8500);

            // Spy on signalPlayerLeftRoom
            const signalSpy = jest.spyOn(service.signalPlayerLeftRoom, 'next').mockImplementation(() => {});

            service.removePlayerFromRoom('player7');

            expect(room.players).not.toContainEqual(createPlayer('player7'));
            expect(service['playerRooms'].has('player7')).toBe(false);
            expect(service['rooms'].has(8500)).toBe(false);
            expect(service['gameBoardRooms'].has(8500)).toBe(false);
            expect(service['gameTimerRooms'].has(8500)).toBe(false);
            expect(logger.log).toHaveBeenCalledWith(`Joueur player7 enlevé du room 8500`);
            expect(logger.log).toHaveBeenCalledWith(`Room 8500 suprimmé car il n'y a plus de joueurs`);
            expect(signalSpy).toHaveBeenCalledWith({ accessCode: 8500, playerSocketId: 'player7' });
        });

        it('should remove a player and reassign organizer if organizer leaves', () => {
            const room = createRoom('game9', 9000, 'organizer9');
            const player1: PlayerCharacter = createPlayer('player8', 'Player8');
            room.players.push(player1);
            service['rooms'].set(9000, room);
            service['playerRooms'].set('player9', 9000);
            service['playerRooms'].set('player8', 9000);

            // Spy on signalPlayerLeftRoom
            const signalSpy = jest.spyOn(service.signalPlayerLeftRoom, 'next').mockImplementation(() => {});

            service.removePlayerFromRoom('organizer9');

            expect(room.players).not.toContainEqual(createPlayer('organizer9'));
            expect(service['playerRooms'].has('organizer9')).toBe(false);
            expect(room.organizer).toBe('player8');
            expect(logger.log).toHaveBeenCalledWith(`Joueur organizer9 enlevé du room 9000`);
            expect(logger.log).toHaveBeenCalledWith(`L'organisateur est parti, le nouveau: player8`);
            expect(signalSpy).toHaveBeenCalledWith({ accessCode: 9000, playerSocketId: 'organizer9' });
        });

        it('should do nothing if socketId is not associated with any room', () => {
            const signalSpy = jest.spyOn(service.signalPlayerLeftRoom, 'next').mockImplementation(() => {});

            service.removePlayerFromRoom('nonexistent');

            expect(signalSpy).not.toHaveBeenCalled();
            expect(logger.log).not.toHaveBeenCalled();
        });
    });

    describe('lockRoom', () => {
        it('should lock the room if client is the organizer', () => {
            const room = createRoom('game10', 9500, 'organizer10');
            service['rooms'].set(9500, room);

            const result = service.lockRoom(9500, 'organizer10');

            expect(result).toBe(true);
            expect(room.isLocked).toBe(true);
            expect(logger.log).toHaveBeenCalledWith(`Room 9500 verrouillé par organisateur organizer10`);
        });

        it('should not lock the room if client is not the organizer', () => {
            const room = createRoom('game11', 9600, 'organizer11');
            service['rooms'].set(9600, room);

            const result = service.lockRoom(9600, 'notOrganizer');

            expect(result).toBe(false);
            expect(room.isLocked).toBe(false);
            expect(logger.log).not.toHaveBeenCalledWith(`Room 9600 verrouillé par organisateur notOrganizer`);
        });

        it('should not lock if room does not exist', () => {
            const result = service.lockRoom(9700, 'organizer12');
            expect(result).toBe(false);
            expect(logger.log).not.toHaveBeenCalled();
        });
    });

    describe('unlockRoom', () => {
        it('should unlock the room if client is the organizer and players are below max', () => {
            const room = createRoom('game12', 9800, 'organizer12');
            room.isLocked = true;
            room.maxPlayers = 4;
            room.players = [createPlayer('organizer12', 'Organizer12'), createPlayer('player10', 'Player10')];
            service['rooms'].set(9800, room);

            const result = service.unlockRoom(9800, 'organizer12');

            expect(result).toBe(true);
            expect(room.isLocked).toBe(false);
            expect(logger.log).toHaveBeenCalledWith(`Room 9800 déverrouillé par organisateur organizer12`);
        });

        it('should not unlock the room if client is not the organizer', () => {
            const room = createRoom('game13', 9900, 'organizer13');
            room.isLocked = true;
            room.maxPlayers = 4;
            room.players = [createPlayer('organizer13', 'Organizer13'), createPlayer('player11', 'Player11')];
            service['rooms'].set(9900, room);

            const result = service.unlockRoom(9900, 'notOrganizer');

            expect(result).toBe(false);
            expect(room.isLocked).toBe(true);
            expect(logger.log).not.toHaveBeenCalledWith(`Room 9900 déverrouillé par organisateur notOrganizer`);
        });

        it('should not unlock the room if players exceed or meet maxPlayers', () => {
            const room = createRoom('game14', 10000, 'organizer14');
            room.isLocked = true;
            room.maxPlayers = 2;
            room.players = [createPlayer('organizer14', 'Organizer14'), createPlayer('player12', 'Player12')];
            service['rooms'].set(10000, room);

            const result = service.unlockRoom(10000, 'organizer14');

            expect(result).toBe(false);
            expect(room.isLocked).toBe(true);
            expect(logger.log).not.toHaveBeenCalledWith(`Room 10000 déverrouillé par organisateur organizer14`);
        });

        it('should not unlock if room does not exist', () => {
            const result = service.unlockRoom(10100, 'organizer15');
            expect(result).toBe(false);
            expect(logger.log).not.toHaveBeenCalled();
        });
    });

    describe('kickPlayer', () => {
        it('should kick a player if client is the organizer', () => {
            const room = createRoom('game15', 10200, 'organizer15');
            room.players.push(createPlayer('player13', 'Player13'));
            service['rooms'].set(10200, room);
            service['playerRooms'].set('player13', 10200);

            const result = service.kickPlayer(10200, 'player13', 'organizer15');

            expect(result).toBe(true);
            expect(room.players).not.toContainEqual(createPlayer('player13', 'Player13'));
            expect(service['playerRooms'].has('player13')).toBe(false);
            expect(logger.log).toHaveBeenCalledWith(`Joueur player13 enlevé du room 10200`);
        });

        it('should not kick a player if client is not the organizer', () => {
            const room = createRoom('game16', 10300, 'organizer16');
            room.players.push(createPlayer('player14', 'Player14'));
            service['rooms'].set(10300, room);
            service['playerRooms'].set('player14', 10300);

            const result = service.kickPlayer(10300, 'player14', 'notOrganizer');

            expect(result).toBe(false);
            expect(room.players).toContainEqual(createPlayer('player14', 'Player14'));
            expect(service['playerRooms'].has('player14')).toBe(true);
            expect(logger.log).not.toHaveBeenCalledWith(`Joueur player14 enlevé du room 10300`);
        });

        it('should not kick a player if room does not exist', () => {
            const result = service.kickPlayer(10400, 'player15', 'organizer17');
            expect(result).toBe(false);
            expect(logger.log).not.toHaveBeenCalled();
        });
    });

    describe('handlePlayerDisconnect', () => {
        it('should remove the player from the room', () => {
            const room = createRoom('game17', 10500, 'organizer17');
            room.players.push(createPlayer('player16', 'Player16'));
            service['rooms'].set(10500, room);
            service['playerRooms'].set('player16', 10500);

            // Spy on removePlayerFromRoom
            const removeSpy = jest.spyOn(service, 'removePlayerFromRoom');

            service.handlePlayerDisconnect('player16');

            expect(removeSpy).toHaveBeenCalledWith('player16');
        });

        it('should do nothing if player is not in any room', () => {
            // Spy on removePlayerFromRoom
            const removeSpy = jest.spyOn(service, 'removePlayerFromRoom');

            service.handlePlayerDisconnect('nonexistent');

            expect(removeSpy).toHaveBeenCalledWith('nonexistent');
            // No changes expected
        });
    });

    describe('initRoomGameBoard and setupGameBoardRoom', () => {
        it('should initialize the game board room if room exists', async () => {
            const room = createRoom('game18', 10600, 'organizer18');
            service['rooms'].set(10600, room);

            const mockGame: Game = {
                _id: 'game18',
                size: MapSize.SMALL,
                name: 'Game18',
                description: 'Description18',
                mode: GameMode.Classique,
                imageUrl: 'image18.png',
                isVisible: true,
                tiles: [],
            };
            gameService.getGame.mockResolvedValue(mockGame);

            // Spy on setupGameBoardRoom
            const setupSpy = jest.spyOn(service, 'setupGameBoardRoom');

            await service.initRoomGameBoard(10600);

            expect(gameService.getGame).toHaveBeenCalledWith('game18');
            expect(setupSpy).toHaveBeenCalledWith(10600, mockGame);
        });

        it('should not initialize the game board room if room does not exist', () => {
            const initSpy = jest.spyOn(service, 'setupGameBoardRoom');

            service.initRoomGameBoard(10700);

            expect(initSpy).not.toHaveBeenCalled();
            expect(gameService.getGame).not.toHaveBeenCalled();
        });

        it('should setup the game board room correctly', () => {
            const room = createRoom('game19', 10800, 'organizer19');
            service['rooms'].set(10800, room);

            const game: Game = {
                _id: 'game19',
                size: MapSize.LARGE,
                name: 'Game19',
                description: 'Description19',
                mode: GameMode.Classique,
                imageUrl: 'image19.png',
                isVisible: true,
                tiles: [],
            };

            service.setupGameBoardRoom(10800, game);

            const gameBoard = service['gameBoardRooms'].get(10800);
            expect(gameBoard).toEqual({
                game,
                spawnPlaces: [],
                turnOrder: [],
            });

            const updatedRoom = service['rooms'].get(10800);
            expect(updatedRoom.maxPlayers).toBe(6); // LARGE corresponds to 6
        });
    });

    describe('setCurrentPlayerTurn', () => {
        it('should set the current player turn if room exists', () => {
            const room = createRoom('game20', 10900, 'organizer20');
            service['rooms'].set(10900, room);

            service.setCurrentPlayerTurn(10900, 'player17');

            const updatedRoom = service['rooms'].get(10900);
            expect(updatedRoom.currentPlayerTurn).toBe('player17');
        });

        it('should do nothing if room does not exist', () => {
            service.setCurrentPlayerTurn(11000, 'player18');
            // No error expected
        });
    });

    // Utilitaire pour créer une GameRoom
    function createRoom(gameId: string, accessCode: number, organizerSocketId: string): GameRoom {
        return {
            id: gameId,
            accessCode,
            players: [createPlayer(organizerSocketId, 'Organizer')],
            organizer: organizerSocketId,
            isLocked: false,
            maxPlayers: 0,
            currentPlayerTurn: organizerSocketId,
        };
    }
});
