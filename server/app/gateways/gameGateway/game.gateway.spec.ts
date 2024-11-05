import { PlayGameBoardGateway } from '@app/gateways/playGameBoard/play-game-board.gateway';
import {
    GameBoardParameters,
    GameRoom,
    GameSocketRoomService,
    PlayerCharacter,
} from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { GameMode } from '@common/enums/game-mode';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
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
    } as any,
};

describe('GameGateway', () => {
    let gateway: GameGateway;
    let gameSocketRoomService: jest.Mocked<GameSocketRoomService>;
    let playGameBoardGateway: jest.Mocked<PlayGameBoardGateway>;
    let server: Server;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                { provide: GameSocketRoomService, useValue: mockGameSocketRoomService },
                { provide: PlayGameBoardGateway, useValue: mockPlayGameBoardGateway },
                { provide: Logger, useValue: mockLogger },
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        gameSocketRoomService = module.get<GameSocketRoomService>(GameSocketRoomService) as jest.Mocked<GameSocketRoomService>;
        playGameBoardGateway = module.get<PlayGameBoardGateway>(PlayGameBoardGateway) as jest.Mocked<PlayGameBoardGateway>;
        jest.spyOn(gateway, 'updateRoomState').mockImplementation(() => {});
        jest.spyOn(gameSocketRoomService, 'lockRoom').mockImplementation((accessCode: number, clientId: string) => {
            return true;
        });

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

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);
            gameSocketRoomService.addPlayerToRoom.mockReturnValue(true);
            gameSocketRoomService.getRoomByAccessCode.mockReturnValueOnce(mockRoom).mockReturnValueOnce(updatedRoom);
            gameSocketRoomService.lockRoom(mockRoom.accessCode, mockRoom.organizer);
            gameSocketRoomService.lockRoom.mockReturnValue(true);

            gateway.handleAddPlayerToRoom(client, payload);

            expect(payload.player.socketId).toBe(client.id);
            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(payload.accessCode);
            expect(gameSocketRoomService.addPlayerToRoom).toHaveBeenCalledWith(payload.accessCode, payload.player);
            expect(client.emit).toHaveBeenCalledWith('joinGameResponseCanJoin', {
                valid: true,
                message: 'Rejoint avec succès',
            });
            expect(gateway.updateRoomState).toHaveBeenCalledWith(payload.accessCode);
            expect(gameSocketRoomService.lockRoom).toHaveBeenCalledWith(payload.accessCode, mockRoom.organizer);
            expect(mockServer.to).toHaveBeenCalledWith(payload.accessCode.toString());
            expect(mockServer.emit).toHaveBeenCalledWith('roomLocked', {
                message: 'La salle est verrouillée car le nombre maximal de joueurs a été atteint.',
                isLocked: true,
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
            expect(client.emit).toHaveBeenCalledWith('joinGameResponseCanJoin', {
                valid: false,
                message: "Cette salle est verrouillée et n'accepte plus de nouveaux joueurs",
            });
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
            expect(mockServer.emit).toHaveBeenCalledWith('roomLocked', {
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
            expect(mockServer.emit).toHaveBeenCalledWith('roomUnlocked', {
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
                players: [{ name: 'Grace', socketId: 'client15', attributes: { life: 4, speed: 4, attack: 4, defense: 4 } }],
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
            expect(mockServer.emit).toHaveBeenCalledWith('organizerLeft', {
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
                    { name: 'Heidi', socketId: 'client16', attributes: { life: 3, speed: 3, attack: 3, defense: 3 } },
                    { name: 'Ivan', socketId: 'client17', attributes: { life: 3, speed: 3, attack: 3, defense: 3 } },
                ],
                isLocked: false,
                organizer: 'client18',
                maxPlayers: 2,
                currentPlayerTurn: 'client18',
            };
            const updatedRoom: GameRoom = {
                ...mockRoom,
                players: [{ name: 'Ivan', socketId: 'client17', attributes: { life: 3, speed: 3, attack: 3, defense: 3 } }],
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
                    { name: 'Judy', socketId: 'client19', attributes: { life: 2, speed: 2, attack: 2, defense: 2 } },
                    { name: 'Karl', socketId: 'client20', attributes: { life: 2, speed: 2, attack: 2, defense: 2 } },
                ],
                isLocked: true,
                organizer: 'client21',
                maxPlayers: 3,
                currentPlayerTurn: 'client21',
            };
            const updatedRoom: GameRoom = {
                ...mockRoom,
                players: [{ name: 'Karl', socketId: 'client20', attributes: { life: 2, speed: 2, attack: 2, defense: 2 } }],
            };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValueOnce(mockRoom).mockReturnValueOnce(updatedRoom);
            gameSocketRoomService.unlockRoom.mockReturnValue(true);

            gateway.handlePlayerLeave(client, accessCode);

            expect(gameSocketRoomService.unlockRoom).toHaveBeenCalledWith(accessCode, mockRoom.organizer);
            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockServer.emit).toHaveBeenCalledWith('roomUnlocked', {
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
                players: [{ name: 'Leo', socketId: 'client22', attributes: { life: 1, speed: 1, attack: 1, defense: 1 } }],
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
            expect(mockServer.emit).toHaveBeenCalledWith('roomClosed');
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
            gameSocketRoomService.kickPlayer.mockReturnValue(true);
            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            gateway.handleKickPlayer(client, playerToKick);

            expect(gameSocketRoomService.getRoomBySocketId).toHaveBeenCalledWith(client.id);
            expect(gameSocketRoomService.kickPlayer).toHaveBeenCalledWith(accessCode, playerToKick.socketId, client.id);
            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockServer.emit).toHaveBeenCalledWith('playerKicked', {
                message: 'Vous avez été expulsé de la salle',
                kickedPlayerId: playerToKick.socketId,
            });
            expect(gateway.updateRoomState).toHaveBeenCalledWith(accessCode);
            // Assurez-vous que le joueur expulsé quitte la salle
            expect(mockServer.sockets.sockets.get(playerToKick.socketId)?.leave).toHaveBeenCalledWith(accessCode.toString());
        });

        it("devrait émettre une erreur si l'expulsion échoue", () => {
            const client = createMockSocket('client30');
            const playerToKick: PlayerCharacter = {
                name: 'Niaj',
                socketId: 'client31',
                attributes: { life: 2, speed: 2, attack: 2, defense: 2 },
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
            };

            gameSocketRoomService.getRoomBySocketId.mockReturnValue(undefined);

            gateway.handleKickPlayer(client, playerToKick);

            expect(gameSocketRoomService.kickPlayer).not.toHaveBeenCalled();
            expect(mockServer.to).not.toHaveBeenCalled();
            expect(mockServer.emit).not.toHaveBeenCalled();
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
            expect(mockServer.emit).toHaveBeenCalledWith('gameParameters', { gameBoardParameters: mockGameBoardParameters });
        });

        it("devrait émettre une erreur si la salle n'existe pas", () => {
            const accessCode = 4017;

            gameSocketRoomService.gameBoardRooms = new Map();

            gateway.sendGameParameters(accessCode);

            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockServer.emit).toHaveBeenCalledWith('error', { message: 'Room pas trouvé' });
        });
    });

    // Tests pour handleConnection
    describe('handleConnection', () => {
        it('devrait enregistrer la connexion du client', () => {
            const client = createMockSocket('client34');

            gateway.handleConnection(client);

            expect(mockLogger.log).toHaveBeenCalledWith(`Client connecté: ${client.id}`);
        });
    });

    // Tests pour handleDisconnect
    describe('handleDisconnect', () => {
        it('devrait enregistrer la déconnexion du client et gérer la déconnexion', () => {
            const client = createMockSocket('client35');

            gateway.handleDisconnect(client);

            expect(mockLogger.log).toHaveBeenCalledWith(`Client déconnecté: ${client.id}`);
            expect(gameSocketRoomService.handlePlayerDisconnect).toHaveBeenCalledWith(client.id);
        });
    });

    // Tests pour updateRoomState
    describe('updateRoomState', () => {
        it("devrait émettre l'état de la salle si elle existe", () => {
            const accessCode = 9999;
            const mockRoom: GameRoom = {
                id: '15',
                accessCode,
                players: [],
                isLocked: false,
                organizer: 'client36',
                maxPlayers: 4,
                currentPlayerTurn: 'client36',
            };

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(mockRoom);

            gateway.updateRoomState(accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(mockServer.to).toHaveBeenCalledWith(accessCode.toString());
            expect(mockServer.emit).toHaveBeenCalledWith('roomState', {
                roomId: mockRoom.id,
                accessCode: mockRoom.accessCode,
                players: mockRoom.players,
                isLocked: mockRoom.isLocked,
            });
        });

        it("ne devrait rien émettre si la salle n'existe pas", () => {
            const accessCode = 4017;

            gameSocketRoomService.getRoomByAccessCode.mockReturnValue(undefined);

            gateway.updateRoomState(accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(mockServer.to).not.toHaveBeenCalledWith(accessCode.toString());
            expect(mockServer.emit).not.toHaveBeenCalled();
        });
    });
});
