import { PlayGameBoardGateway } from '@app/gateways/playGameBoard/play-game-board.gateway';
import { GameRoom, GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
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

describe('GameGateway', () => {
    let gateway: GameGateway;
    let gameSocketRoomService: GameSocketRoomService;
    let playGameBoardGateway: PlayGameBoardGateway;
    let server: Server;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                { provide: GameSocketRoomService, useValue: mockGameSocketRoomService },
                { provide: PlayGameBoardGateway, useValue: mockPlayGameBoardGateway },
                { provide: Logger, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } },
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        gameSocketRoomService = module.get<GameSocketRoomService>(GameSocketRoomService);
        playGameBoardGateway = module.get<PlayGameBoardGateway>(PlayGameBoardGateway);

        gateway.server = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            sockets: {
                sockets: new Map<string, Socket>(),
            },
        } as unknown as Server;
        server = gateway.server;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createMockSocket = (id: string): Socket => {
        return {
            id,
            emit: jest.fn(),
            join: jest.fn(),
            leave: jest.fn(),
        } as unknown as Socket;
    };

    describe('handleGetRoomState', () => {
        it('should emit roomState if room exists', () => {
            const client = createMockSocket('client1');
            const accessCode = 1234;
            const mockRoom: GameRoom = {
                id: '1',
                accessCode,
                players: [{ name: 'Alice', socketId: 'client1' }],
                isLocked: false,
                organizer: 'client1',
            };

            (gameSocketRoomService.getRoomByAccessCode as jest.Mock).mockReturnValue(mockRoom);

            gateway.handleGetRoomState(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(client.emit).toHaveBeenCalledWith('roomState', {
                roomId: mockRoom.id,
                accessCode: mockRoom.accessCode,
                players: mockRoom.players,
                isLocked: mockRoom.isLocked,
            });
        });

        it('should emit error if room does not exist', () => {
            const client = createMockSocket('client2');
            const accessCode = 5678;

            (gameSocketRoomService.getRoomByAccessCode as jest.Mock).mockReturnValue(undefined);

            gateway.handleGetRoomState(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(client.emit).toHaveBeenCalledWith('error', { message: 'Room pas trouvé' });
        });
    });

    describe('handleStartGame', () => {
        it('should start the game if the client is the organizer', () => {
            const client = createMockSocket('client19');
            const accessCode = 1515;
            const mockRoom: GameRoom = {
                id: '12',
                accessCode,
                players: [],
                isLocked: false,
                organizer: 'client19',
            };

            (gameSocketRoomService.getRoomByAccessCode as jest.Mock).mockReturnValue(mockRoom);

            gateway.handleStartGame(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(playGameBoardGateway.startRoomGame).toHaveBeenCalledWith(accessCode);
        });

        it('should emit error if the client is not the organizer', () => {
            const client = createMockSocket('client20');
            const accessCode = 1616;
            const mockRoom: GameRoom = {
                id: '13',
                accessCode,
                players: [],
                isLocked: false,
                organizer: 'client21',
            };

            (gameSocketRoomService.getRoomByAccessCode as jest.Mock).mockReturnValue(mockRoom);

            gateway.handleStartGame(client, accessCode);

            expect(gameSocketRoomService.getRoomByAccessCode).toHaveBeenCalledWith(accessCode);
            expect(playGameBoardGateway.startRoomGame).not.toHaveBeenCalled();
            expect(client.emit).toHaveBeenCalledWith('error', { message: 'Pas authorisé ou room non trouvé' });
        });
    });

    it('should lock the room and emit roomLocked to the room', () => {
        const client = createMockSocket('client10');
        const accessCode = 7777;
        const mockRoom: GameRoom = {
            id: '7',
            accessCode,
            players: [],
            isLocked: false,
            organizer: 'client10',
        };

        (gameSocketRoomService.lockRoom as jest.Mock).mockReturnValue(true);
        (gameSocketRoomService.getRoomByAccessCode as jest.Mock).mockReturnValue(mockRoom);

        gateway.handleLockRoom(client, accessCode);

        expect(gameSocketRoomService.lockRoom).toHaveBeenCalledWith(accessCode, client.id);
        expect(server.to).toHaveBeenCalledWith(accessCode.toString());
        expect(server.emit).toHaveBeenCalledWith('roomLocked', {
            message: 'La salle est maintenant verrouillée',
            isLocked: true,
        });
    });
});
