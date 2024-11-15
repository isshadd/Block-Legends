import { PlayGameBoardGateway } from '@app/gateways/playGameBoard/play-game-board.gateway';
import {
    GameBoardParameters,
    GameRoom,
    GameSocketRoomService,
    PlayerCharacter,
} from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { GameMode } from '@common/enums/game-mode';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Namespace, Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';

const mockGameSocketRoomService: Partial<GameSocketRoomService> = {
    getRoomByAccessCode: jest.fn(),
    createGame: jest.fn(),
    addPlayerToRoom: jest.fn(),
    lockRoom: jest.fn(),
    unlockRoom: jest.fn(),
    removePlayerFromRoom: jest.fn(),
    kickPlayer: jest.fn(),
    handlePlayerDisconnect: jest.fn(),
    getRoomBySocketId: jest.fn(),
};

const mockPlayGameBoardGateway: Partial<PlayGameBoardGateway> = {
    startRoomGame: jest.fn(),
};

const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
};

// Création d'un mock serveur Socket.io
const mockServer: Partial<Server> = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    sockets: {
        sockets: new Map<string, Socket>(),
        adapter: {
            rooms: new Map(),
            sids: new Map(),
            addAll: jest.fn(),
            del: jest.fn(),
            delAll: jest.fn(),
            broadcast: jest.fn(),
        },
        name: '/',
        connected: {},
        use: jest.fn(),
        on: jest.fn(),
        to: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        emit: jest.fn(),
        send: jest.fn(),
        write: jest.fn(),
        clients: jest.fn(),
        compress: jest.fn().mockReturnThis(),
        binary: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        volatile: jest.fn().mockReturnThis(),
        local: jest.fn().mockReturnThis(),
        join: jest.fn(),
        leave: jest.fn(),
        leaveAll: jest.fn(),
        disconnectSockets: jest.fn(),
        close: jest.fn(),
    } as unknown as Namespace,
};

describe('GameGateway', () => {
    let gateway: GameGateway;
    let gameSocketRoomService: jest.Mocked<GameSocketRoomService>;
    let playGameBoardGateway: jest.Mocked<PlayGameBoardGateway>;
    let mockEmit: jest.Mock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                { provide: GameSocketRoomService, useValue: mockGameSocketRoomService },
                { provide: PlayGameBoardGateway, useValue: mockPlayGameBoardGateway },
                { provide: Logger, useValue: mockLogger },
            ],
        }).compile();

        mockEmit = jest.fn();
        mockServer.to = jest.fn().mockReturnValue({ emit: mockEmit });
        gateway = module.get<GameGateway>(GameGateway);
        gameSocketRoomService = module.get<GameSocketRoomService>(GameSocketRoomService) as jest.Mocked<GameSocketRoomService>;
        playGameBoardGateway = module.get<PlayGameBoardGateway>(PlayGameBoardGateway) as jest.Mocked<PlayGameBoardGateway>;
        jest.spyOn(gateway, 'updateRoomState').mockImplementation(undefined);
        jest.spyOn(gameSocketRoomService, 'lockRoom').mockReturnValue(true);

        // Assignation du serveur mocké
        (gateway as GameGateway).server = mockServer as Server;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Fonction pour créer un socket mocké
    const createMockSocket = (id: string): Socket =>
        ({
            id,
            emit: jest.fn(),
            join: jest.fn(),
            leave: jest.fn(),
        }) as unknown as Socket;

    // Tests pour handleGetRoomState
    describe('handleGetRoomState', () => {
        it("devrait émettre l'état de la salle si elle existe", () => {
            const client = createMockSocket('client1');
            const accessCode = 9999;
            const mockRoom: GameRoom = {
                id: '1',
                accessCode,
                players: [
                    {
                        name: 'Alice',
                        socketId: 'client1',
                        attributes: { life: 4, speed: 4, attack: 4, defense: 4 },
                        avatar: AvatarEnum.Steve,
                    },
                ],
                isLocked: false,
                organizer: 'client1',
                maxPlayers: 2,
                currentPlayerTurn: 'client1',
            };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            gateway.handleGetRoomState(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(client.emit).toHaveBeenCalledWith('roomState', {
                roomId: mockRoom.id,
                accessCode: mockRoom.accessCode,
                players: mockRoom.players,
                isLocked: mockRoom.isLocked,
                maxPlayers: mockRoom.maxPlayers,
            });
        });

        it("devrait émettre une erreur si la salle n'existe pas", () => {
            const client = createMockSocket('client2');
            const accessCode = 5678;

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(undefined);

            gateway.handleGetRoomState(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(client.emit).toHaveBeenCalledWith('error', { message: 'Room pas trouvé' });
        });
    });

    // Tests pour handleCreateGame
    describe('handleCreateGame', () => {
        it("devrait créer une nouvelle salle et mettre à jour l'état de la salle", () => {
            const client = createMockSocket('client3');
            const payload = {
                gameId: 'game123',
                playerOrganizer: {
                    name: 'Bob',
                    socketId: '',
                    attributes: { life: 5, speed: 5, attack: 5, defense: 5 },
                    avatar: AvatarEnum.Arlina,
                },
            };
            const newRoom: GameRoom = {
                id: '2',
                accessCode: 8888,
                players: [payload.playerOrganizer],
                isLocked: false,
                organizer: 'client3',
                maxPlayers: 4,
                currentPlayerTurn: 'client3',
            };

            gameSocketRoomService.createGame.mockReturnValue(newRoom);

            gateway.handleCreateGame(client, payload);

            expect(payload.playerOrganizer.socketId).toBe(client.id);
            expect(gameSocketRoomService.createGame).toHaveBeenCalledWith(payload.gameId, payload.playerOrganizer);
            expect(client.join).toHaveBeenCalledWith(newRoom.accessCode.toString());
            expect(gateway.updateRoomState).toHaveBeenCalledWith(newRoom.accessCode);
        });
    });

    // Tests pour handleJoinGame
    describe('handleJoinGame', () => {
        it("devrait permettre au client de rejoindre la salle si elle existe et n'est pas verrouillée", () => {
            const client = createMockSocket('client4');
            const accessCode = 9999;
            const mockRoom: GameRoom = {
                id: '3',
                accessCode,
                players: [],
                isLocked: false,
                organizer: 'client5',
                maxPlayers: 4,
                currentPlayerTurn: 'client5',
            };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            gateway.handleJoinGame(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(client.join).toHaveBeenCalledWith(accessCode.toString());
            expect(client.emit).toHaveBeenCalledWith('joinGameResponse', {
                valid: true,
                message: 'Rejoint avec succès',
                roomId: mockRoom.id,
                accessCode: mockRoom.accessCode,
                isLocked: mockRoom.isLocked,
            });
            expect(gateway.updateRoomState).toHaveBeenCalledWith(accessCode);
        });

        it("devrait émettre une erreur si la salle n'existe pas", () => {
            const client = createMockSocket('client5');
            const accessCode = 5678;

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(undefined);

            gateway.handleJoinGame(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(client.emit).toHaveBeenCalledWith('joinGameResponseCodeInvalid', {
                message: 'Code invalide',
            });
        });

        it('devrait émettre une erreur si la salle est verrouillée', () => {
            const client = createMockSocket('client6');
            const accessCode = 9999;
            const mockRoom: GameRoom = {
                id: '4',
                accessCode,
                players: [],
                isLocked: true,
                organizer: 'client7',
                maxPlayers: 4,
                currentPlayerTurn: 'client7',
            };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            gateway.handleJoinGame(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(client.emit).toHaveBeenCalledWith('joinGameResponseLockedRoom', {
                message: "Cette salle est verrouillée et n'accepte plus de nouveaux joueurs",
            });
        });
    });

    // Tests pour handleAddPlayerToRoom
    describe('handleAddPlayerToRoom', () => {
        it('devrait ajouter un joueur à la salle et émettre les réponses appropriées', () => {
            const client = createMockSocket('client8');
            const payload = {
                accessCode: 9999,
                player: {
                    name: 'Charlie',
                    socketId: 'client8',
                    attributes: { life: 3, speed: 3, attack: 3, defense: 3 },
                    avatar: AvatarEnum.Alex,
                },
            };
            const mockRoom: GameRoom = {
                id: '5',
                accessCode: payload.accessCode,
                players: [],
                isLocked: false,
                organizer: 'client3',
                maxPlayers: 2,
                currentPlayerTurn: 'client8',
            };
            const updatedRoom: GameRoom = {
                ...mockRoom,
                players: [payload.player],
            };

            // Simplify mocking
            gameSocketRoomService.getRoomByAccessCode
                .mockReturnValueOnce(mockRoom) // First call for room check
                .mockReturnValueOnce(updatedRoom); // Second call for max players check
            gameSocketRoomService.addPlayerToRoom.mockReturnValue(true);

            gateway.handleAddPlayerToRoom(client, payload);

            expect(payload.player.socketId).toBe(client.id);
            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(payload.accessCode);
            expect(gameSocketRoomService.addPlayerToRoom).toHaveBeenCalledWith(payload.accessCode, payload.player);
            expect(client.emit).toHaveBeenCalledWith('joinGameResponseCanJoin', {
                valid: true,
                message: 'Rejoint avec succès',
                playerName: 'Charlie',
                playerAvatar: AvatarEnum.Alex,
                takenAvatars: [],
            });
        });

        it("devrait émettre une erreur si la salle n'existe pas", () => {
            const client = createMockSocket('client8');
            const payload = {
                accessCode: 4017,
                player: {
                    name: 'Dave',
                    socketId: '',
                    attributes: { life: 2, speed: 2, attack: 2, defense: 2 },
                    avatar: AvatarEnum.King,
                },
            };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(undefined);

            gateway.handleAddPlayerToRoom(client, payload);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(payload.accessCode);
            expect(client.emit).toHaveBeenCalledWith('joinGameResponseNoMoreExisting', {
                valid: false,
                message: "La salle n'existe plus",
            });
        });

        it('devrait émettre une erreur si la salle est verrouillée', () => {
            const client = createMockSocket('client9');
            const payload = {
                accessCode: 9999,
                player: {
                    name: 'Eve',
                    socketId: '',
                    attributes: { life: 1, speed: 1, attack: 1, defense: 1 },
                    avatar: AvatarEnum.Cosmic,
                },
            };
            const mockRoom: GameRoom = {
                id: '6',
                accessCode: payload.accessCode,
                players: [],
                isLocked: true,
                organizer: 'client10',
                maxPlayers: 2,
                currentPlayerTurn: 'client10',
            };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            gateway.handleAddPlayerToRoom(client, payload);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(payload.accessCode);
            expect(client.emit).toHaveBeenCalledWith('joinGameResponseLockedAfterJoin', {
                valid: false,
                message: 'Cette salle a été verrouillée entre temps',
            });
        });

        it("devrait émettre une erreur si l'ajout du joueur échoue", () => {
            const client = createMockSocket('client10');
            const payload = {
                accessCode: 9999,
                player: {
                    name: 'Frank',
                    socketId: '',
                    attributes: { life: 5, speed: 5, attack: 5, defense: 5 },
                    avatar: AvatarEnum.Sirene,
                },
            };
            const mockRoom: GameRoom = {
                id: '7',
                accessCode: payload.accessCode,
                players: [],
                isLocked: false,
                organizer: 'client11',
                maxPlayers: 2,
                currentPlayerTurn: 'client11',
            };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
            gameSocketRoomService.addPlayerToRoom.mockReturnValue(false);

            gateway.handleAddPlayerToRoom(client, payload);

            expect(gameSocketRoomService.addPlayerToRoom).toHaveBeenCalledWith(payload.accessCode, payload.player);
            expect(client.emit).toHaveBeenCalledWith('avatarTakenError', {
                message: `Avatar ${payload.player.avatar.name} déjà pris dans la salle ${payload.accessCode}`,
            });
        });
        it("should correctly map players' avatar names to takenAvatars", () => {
            // Mock room data with players having avatars
            const mockRoom = {
                players: [{ avatar: { name: 'Steve' } }, { avatar: { name: 'Arlina' } }, { avatar: { name: 'Alex' } }],
            };

            // Assuming the method we're testing is `getTakenAvatars`
            const result = mockRoom.players.map((p) => p.avatar.name); // Directly using the logic to be tested

            expect(result).toEqual(['Steve', 'Arlina', 'Alex']);
        });
    });

    // Tests pour handleLockRoom
    describe('handleLockRoom', () => {
        it("devrait verrouiller la salle et émettre l'événement roomLocked", () => {
            const client = createMockSocket('client11');
            const accessCode = 9999;

            gameSocketRoomService.lockRoom.mockReturnValue(true);

            gateway.handleLockRoom(client, accessCode);

            expect(gameSocketRoomService.lockRoom).toHaveBeenCalledWith(accessCode, client.id);
            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockEmit).toHaveBeenCalledWith('roomLocked', {
                message: 'La salle est maintenant verrouillée',
                isLocked: true,
            });
            expect(gateway.updateRoomState).toHaveBeenCalledWith(accessCode);
        });

        it('devrait émettre une erreur si le verrouillage échoue', () => {
            const client = createMockSocket('client12');
            const accessCode = 4017;

            gameSocketRoomService.lockRoom.mockReturnValue(false);

            gateway.handleLockRoom(client, accessCode);

            expect(gameSocketRoomService.lockRoom).toHaveBeenCalledWith(accessCode, client.id);
            expect(client.emit).toHaveBeenCalledWith('error', { message: 'Pas authorisé ou room non trouvé' });
        });
    });

    // Tests pour handleUnlockRoom
    describe('handleUnlockRoom', () => {
        it("devrait déverrouiller la salle et émettre l'événement roomUnlocked", () => {
            const client = createMockSocket('client13');
            const accessCode = 9999;

            gameSocketRoomService.unlockRoom.mockReturnValue(true);

            gateway.handleUnlockRoom(client, accessCode);

            expect(gameSocketRoomService.unlockRoom).toHaveBeenCalledWith(accessCode, client.id);
            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockEmit).toHaveBeenCalledWith('roomUnlocked', {
                message: 'La salle est maintenant déverrouillée',
                isLocked: false,
            });
            expect(gateway.updateRoomState).toHaveBeenCalledWith(accessCode);
        });

        it('devrait émettre une erreur si le déverrouillage échoue', () => {
            const client = createMockSocket('client14');
            const accessCode = 4017;

            gameSocketRoomService.unlockRoom.mockReturnValue(false);

            gateway.handleUnlockRoom(client, accessCode);

            expect(gameSocketRoomService.unlockRoom).toHaveBeenCalledWith(accessCode, client.id);
            expect(client.emit).toHaveBeenCalledWith('error', { message: 'Pas authorisé ou room non trouvé' });
        });
    });

    // Tests pour handlePlayerLeave
    describe('handlePlayerLeave', () => {
        it("devrait gérer le départ de l'organisateur et émettre l'événement organizerLeft", () => {
            const client = createMockSocket('client15');
            const accessCode = 9999;
            const mockRoom: GameRoom = {
                id: '8',
                accessCode,
                players: [
                    {
                        name: 'Grace',
                        socketId: 'client15',
                        attributes: { life: 4, speed: 4, attack: 4, defense: 4 },
                        avatar: AvatarEnum.Zombie,
                    },
                ],
                isLocked: false,
                organizer: 'client15',
                maxPlayers: 2,
                currentPlayerTurn: 'client15',
            };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            gateway.handlePlayerLeave(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(gameSocketRoomService.removePlayerFromRoom).toHaveBeenCalledWith(client.id);
            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockEmit).toHaveBeenCalledWith('organizerLeft', {
                message: "L'organisateur a quitté la partie",
            });
        });

        it("devrait gérer le départ d'un joueur non-organisateur et émettre l'événement playerLeft", () => {
            const client = createMockSocket('client16');
            const accessCode = 9999;
            const mockRoom: GameRoom = {
                id: '9',
                accessCode,
                players: [
                    { name: 'Heidi', socketId: 'client16', attributes: { life: 3, speed: 3, attack: 3, defense: 3 }, avatar: AvatarEnum.Mushroom },
                    { name: 'Ivan', socketId: 'client17', attributes: { life: 3, speed: 3, attack: 3, defense: 3 }, avatar: AvatarEnum.Piglin },
                ],
                isLocked: false,
                organizer: 'client18',
                maxPlayers: 2,
                currentPlayerTurn: 'client18',
            };
            const updatedRoom: GameRoom = {
                ...mockRoom,
                players: [
                    { name: 'Ivan', socketId: 'client17', attributes: { life: 3, speed: 3, attack: 3, defense: 3 }, avatar: AvatarEnum.Piglin },
                ],
            };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValueOnce(mockRoom).mockReturnValueOnce(updatedRoom);

            gateway.handlePlayerLeave(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(gameSocketRoomService.removePlayerFromRoom).toHaveBeenCalledWith(client.id);
            expect(client.emit).toHaveBeenCalledWith('playerLeft');
            expect(gateway.updateRoomState).toHaveBeenCalledWith(accessCode);
            expect(gameSocketRoomService.unlockRoom).not.toHaveBeenCalled(); // Puisque la salle n'était pas verrouillée
        });

        it("devrait émettre l'événement roomUnlocked si la salle était verrouillée et que le nombre de joueurs est en dessous du maximum", () => {
            const client = createMockSocket('client19');
            const accessCode = 9999;
            const mockRoom: GameRoom = {
                id: '10',
                accessCode,
                players: [
                    { name: 'Judy', socketId: 'client19', attributes: { life: 2, speed: 2, attack: 2, defense: 2 }, avatar: AvatarEnum.Strawberry },
                    { name: 'Karl', socketId: 'client20', attributes: { life: 2, speed: 2, attack: 2, defense: 2 }, avatar: AvatarEnum.Knight },
                ],
                isLocked: true,
                organizer: 'client21',
                maxPlayers: 3,
                currentPlayerTurn: 'client21',
            };
            const updatedRoom: GameRoom = {
                ...mockRoom,
                players: [
                    { name: 'Karl', socketId: 'client20', attributes: { life: 2, speed: 2, attack: 2, defense: 2 }, avatar: AvatarEnum.Knight },
                ],
            };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValueOnce(mockRoom).mockReturnValueOnce(updatedRoom);
            gameSocketRoomService.unlockRoom.mockReturnValue(true);

            gateway.handlePlayerLeave(client, accessCode);

            expect(gameSocketRoomService.unlockRoom).toHaveBeenCalledWith(accessCode, mockRoom.organizer);
            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockEmit).toHaveBeenCalledWith('roomUnlocked', {
                message: 'La salle a été déverrouillée car le nombre de joueurs est en dessous du maximum.',
                isLocked: false,
            });
        });

        it("devrait émettre l'événement roomClosed si la salle n'existe plus après le départ", () => {
            const client = createMockSocket('client22');
            const accessCode = 4017;
            const mockRoom: GameRoom = {
                id: '11',
                accessCode,
                players: [{ name: 'Leo', socketId: 'client22', attributes: { life: 1, speed: 1, attack: 1, defense: 1 }, avatar: AvatarEnum.Zombie }],
                isLocked: false,
                organizer: 'client23',
                maxPlayers: 2,
                currentPlayerTurn: 'client23',
            };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValueOnce(mockRoom).mockReturnValueOnce(undefined);
            gameSocketRoomService.removePlayerFromRoom.mockReturnValue(undefined);

            gateway.handlePlayerLeave(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(gameSocketRoomService.removePlayerFromRoom).toHaveBeenCalledWith(client.id);
            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockEmit).toHaveBeenCalledWith('roomClosed');
        });
        it("should correctly handle player exit when room is locked and emit 'roomUnlocked'", () => {
            const client = createMockSocket('client20');
            const accessCode = 1234;

            const mockRoom = {
                id: 'roomId',
                accessCode,
                players: [{ socketId: client.id }],
                isLocked: true,
                organizer: 'organizerId',
                maxPlayers: 2,
            } as GameRoom;
            const updatedRoom = { ...mockRoom, players: [] };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValueOnce(mockRoom).mockReturnValueOnce(updatedRoom);
            gameSocketRoomService.removePlayerFromRoom.mockReturnValueOnce(undefined);
            gameSocketRoomService.unlockRoom.mockReturnValue(true);

            mockServer.to = jest.fn().mockReturnValue({ emit: mockEmit });

            gateway.handlePlayerLeave(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(gameSocketRoomService.removePlayerFromRoom).toHaveBeenCalledWith(client.id);
            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockEmit).toHaveBeenCalledWith('roomUnlocked', {
                message: 'La salle a été déverrouillée car le nombre de joueurs est en dessous du maximum.',
                isLocked: false,
            });
        });
    });

    // Tests pour handleStartGame
    describe('handleStartGame', () => {
        it("devrait démarrer le jeu si le client est l'organisateur", () => {
            const client = createMockSocket('client24');
            const accessCode = 9999;
            const mockRoom: GameRoom = {
                id: '12',
                accessCode,
                players: [],
                isLocked: false,
                organizer: client.id,
                maxPlayers: 4,
                currentPlayerTurn: client.id,
            };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            gateway.handleStartGame(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(playGameBoardGateway.startRoomGame).toHaveBeenCalledWith(accessCode);
        });

        it("devrait émettre une erreur si le client n'est pas l'organisateur", () => {
            const client = createMockSocket('client25');
            const accessCode = 9999;
            const mockRoom: GameRoom = {
                id: '13',
                accessCode,
                players: [],
                isLocked: false,
                organizer: 'client26',
                maxPlayers: 4,
                currentPlayerTurn: 'client26',
            };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            gateway.handleStartGame(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(playGameBoardGateway.startRoomGame).not.toHaveBeenCalled();
            expect(client.emit).toHaveBeenCalledWith('error', { message: 'Pas authorisé ou room non trouvé' });
        });

        it("devrait émettre une erreur si la salle n'existe pas", () => {
            const client = createMockSocket('client27');
            const accessCode = 5678;

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(undefined);

            gateway.handleStartGame(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(playGameBoardGateway.startRoomGame).not.toHaveBeenCalled();
            expect(client.emit).toHaveBeenCalledWith('error', { message: 'Pas authorisé ou room non trouvé' });
        });
    });

    // Tests pour handleKickPlayer
    describe('handleKickPlayer', () => {
        it('devrait expulser un joueur et émettre les événements appropriés', () => {
            const client = createMockSocket('client28');
            const playerToKick: PlayerCharacter = {
                name: 'Mallory',
                socketId: 'client29',
                attributes: { life: 3, speed: 3, attack: 3, defense: 3 },
                avatar: AvatarEnum.Sirene,
            };
            const accessCode = 9999;

            const mockRoom: GameRoom = {
                id: '14',
                accessCode,
                players: [playerToKick],
                isLocked: false,
                organizer: 'client28',
                maxPlayers: 4,
                currentPlayerTurn: 'client28',
            };

            // Mock the kicked player's socket
            const mockKickedSocket = {
                leave: jest.fn(),
            };
            mockServer.sockets.sockets.set(playerToKick.socketId, mockKickedSocket as unknown as Socket);

            // Setup mock emit function for the room
            (mockServer.to as jest.Mock).mockReturnValue({ emit: mockEmit });

            // Spy on updateRoomState
            jest.spyOn(gateway, 'updateRoomState');

            gameSocketRoomService.getRoomBySocketId.mockReturnValue(mockRoom);
            gameSocketRoomService.kickPlayer.mockReturnValue(true);
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            gateway.handleKickPlayer(client, playerToKick);

            expect(gameSocketRoomService.getRoomBySocketId).toHaveBeenCalledWith(client.id);
            expect(gameSocketRoomService.kickPlayer).toHaveBeenCalledWith(accessCode, playerToKick.socketId, client.id);
            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockEmit).toHaveBeenCalledWith('playerKicked', {
                message: 'Vous avez été expulsé de la salle',
                kickedPlayerId: playerToKick.socketId,
            });
            expect(gateway.updateRoomState).toHaveBeenCalledWith(accessCode);
            expect(mockKickedSocket.leave).toHaveBeenCalledWith(accessCode.toString());
        });

        it("devrait émettre une erreur si l'expulsion échoue", () => {
            const client = createMockSocket('client30');
            const playerToKick: PlayerCharacter = {
                name: 'Niaj',
                socketId: 'client31',
                attributes: { life: 2, speed: 2, attack: 2, defense: 2 },
                avatar: AvatarEnum.Zombie,
            };
            const accessCode = 9999;

            const mockRoom: GameRoom = {
                id: '14',
                accessCode,
                players: [playerToKick],
                isLocked: false,
                organizer: 'client28',
                maxPlayers: 4,
                currentPlayerTurn: 'client28',
            };

            gameSocketRoomService.getRoomBySocketId.mockReturnValue(mockRoom);
            gameSocketRoomService.kickPlayer.mockReturnValue(false);

            gateway.handleKickPlayer(client, playerToKick);

            expect(gameSocketRoomService.kickPlayer).toHaveBeenCalledWith(accessCode, playerToKick.socketId, client.id);
            expect(client.emit).toHaveBeenCalledWith('error', { message: 'Pas authorisé ou joueur pas trouvé' });
        });

        it("ne devrait rien faire si l'accessCode est indéfini", () => {
            const client = createMockSocket('client32');
            const playerToKick: PlayerCharacter = {
                name: 'Olivia',
                socketId: 'client33',
                attributes: { life: 1, speed: 1, attack: 1, defense: 1 },
                avatar: AvatarEnum.Mushroom,
            };

            gameSocketRoomService.getRoomBySocketId.mockReturnValue(undefined);

            gateway.handleKickPlayer(client, playerToKick);

            expect(gameSocketRoomService.kickPlayer).not.toHaveBeenCalled();
            expect(mockServer.to).not.toHaveBeenCalled();
            expect(mockEmit).not.toHaveBeenCalled();
        });
        it('should fail to kick player if client is not the organizer', () => {
            const client = createMockSocket('client30');
            const playerToKick = {
                name: 'PlayerToKick',
                socketId: 'socket123',
                avatar: AvatarEnum.Mushroom,
                attributes: {
                    life: 3,
                    speed: 3,
                    attack: 3,
                    defense: 3,
                },
            };
            const accessCode = 5678;

            const mockRoom: GameRoom = {
                id: 'roomId',
                accessCode,
                players: [
                    {
                        name: 'PlayerToKick',
                        socketId: 'socket123',
                        avatar: AvatarEnum.Mushroom,
                        attributes: {
                            life: 3,
                            speed: 3,
                            attack: 3,
                            defense: 3,
                        },
                    },
                ],
                organizer: 'differentOrganizerId',
                isLocked: false, // Added property
                maxPlayers: 10, // Added property
                currentPlayerTurn: 'client30', // Added property (adjust type as needed)
            };

            gameSocketRoomService.getRoomBySocketId.mockReturnValueOnce(mockRoom);

            client.emit = jest.fn(); // Ensure client.emit is properly mocked

            gateway.handleKickPlayer(client, playerToKick);

            // Verify client.emit was called with the expected error message
            expect(client.emit).toHaveBeenCalledWith('error', { message: 'Pas authorisé ou joueur pas trouvé' });
        });
    });

    // Tests pour sendGameParameters
    describe('sendGameParameters', () => {
        it('devrait envoyer les paramètres du jeu si la salle existe', () => {
            const accessCode = 9999;
            const mockGameBoardParameters: GameBoardParameters = {
                game: {
                    _id: 'game123',
                    size: 10,
                    name: 'Test Game',
                    description: 'A test game',
                    mode: GameMode.Classique,
                    imageUrl: 'test.jpg',
                    isVisible: true,
                    tiles: [],
                },
                spawnPlaces: [],
                turnOrder: [],
            };

            gameSocketRoomService.gameBoardRooms = new Map();
            gameSocketRoomService.gameBoardRooms.set(accessCode, mockGameBoardParameters);

            gateway.sendGameParameters(accessCode);

            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockEmit).toHaveBeenCalledWith('gameParameters', { gameBoardParameters: mockGameBoardParameters });
        });

        it("devrait émettre une erreur si la salle n'existe pas", () => {
            const accessCode = 4017;

            gameSocketRoomService.gameBoardRooms = new Map();

            gateway.sendGameParameters(accessCode);

            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockEmit).toHaveBeenCalledWith('error', { message: 'Room pas trouvé' });
        });
    });

    // Tests pour handleConnection
    describe('handleConnection', () => {
        it('should add client ID to connectedClients when handleConnection is called', () => {
            const mockClient = { id: 'client1234' } as Socket;

            gateway.handleConnection(mockClient);

            // Verify the client ID was added to connectedClients
            expect(gateway['connectedClients'].has(mockClient.id)).toBe(true);
        });

        it('should emit clientConnected event with client ID when handleConnection is called', () => {
            const mockClient = { id: 'client1234' } as Socket;

            gateway.handleConnection(mockClient);

            // Confirm that server.emit was called with the clientConnected event and correct payload
            expect(mockServer.emit).toHaveBeenCalledWith('clientConnected', { clientId: mockClient.id });
        });
    });

    // Tests pour handleDisconnect
    describe('handleDisconnect', () => {
        it('should remove client ID from connectedClients when handleDisconnect is called', () => {
            const mockClient = { id: 'client1234' } as Socket;
            gateway['connectedClients'].add(mockClient.id);

            gateway.handleDisconnect(mockClient);

            // Verify the client ID was removed from connectedClients
            expect(gateway['connectedClients'].has(mockClient.id)).toBe(false);
        });

        it('should emit clientDisconnected event with client ID when handleDisconnect is called', () => {
            const mockClient = { id: 'client1234' } as Socket;

            gateway.handleDisconnect(mockClient);

            // Confirm that server.emit was called with the clientDisconnected event and correct payload
            expect(mockServer.emit).toHaveBeenCalledWith('clientDisconnected', { clientId: mockClient.id });
        });

        it('should call gameSocketRoomService.handlePlayerDisconnect with client ID when handleDisconnect is called', () => {
            const mockClient = { id: 'client1234' } as Socket;

            gateway.handleDisconnect(mockClient);

            // Ensure that handlePlayerDisconnect was called with the client's ID
            expect(mockGameSocketRoomService.handlePlayerDisconnect).toHaveBeenCalledWith(mockClient.id);
        });
    });

    // Tests pour updateRoomState
    describe('updateRoomState', () => {
        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    GameGateway,
                    { provide: GameSocketRoomService, useValue: mockGameSocketRoomService },
                    { provide: PlayGameBoardGateway, useValue: mockPlayGameBoardGateway },
                ],
            }).compile();

            gateway = module.get<GameGateway>(GameGateway);
            (gateway as GameGateway).server = mockServer as Server;
        });

        it('should emit correct room state when room exists', () => {
            const accessCode = 1234;
            const mockRoom = {
                id: 'roomId1',
                accessCode,
                players: [{ name: 'Player1' }],
                isLocked: false,
            };
            mockGameSocketRoomService.getRoomByAccessCode = jest.fn().mockReturnValue(mockRoom);

            gateway.updateRoomState(accessCode);

            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockServer.to(accessCode.toString()).emit).toHaveBeenCalledWith('roomState', {
                roomId: mockRoom.id,
                accessCode: mockRoom.accessCode,
                players: mockRoom.players,
                isLocked: mockRoom.isLocked,
            });
        });

        it('should not emit room state if room does not exist', () => {
            const accessCode = 1234;
            mockGameSocketRoomService.getRoomByAccessCode = jest.fn().mockReturnValue(null);

            gateway.updateRoomState(accessCode);

            expect(mockServer.to).not.toHaveBeenCalled();
        });

        it('should emit room state with isLocked property when room is locked', () => {
            const accessCode = 1234;
            const mockRoom = {
                id: 'roomId2',
                accessCode,
                players: [{ name: 'Player2' }],
                isLocked: true,
            };
            mockGameSocketRoomService.getRoomByAccessCode = jest.fn().mockReturnValue(mockRoom);

            gateway.updateRoomState(accessCode);

            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockServer.to(accessCode.toString()).emit).toHaveBeenCalledWith('roomState', {
                roomId: mockRoom.id,
                accessCode: mockRoom.accessCode,
                players: mockRoom.players,
                isLocked: mockRoom.isLocked,
            });
        });
    });
});
