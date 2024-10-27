import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter } from 'events';
import { Server } from 'socket.io';
import { GameGateway } from './game.gateway';

// interface GameRoom {
//     id: string;
//     accessCode: number;
//     players: { name: string; socketId: string }[];
//     organizer: string;
// }

const createMockServer = () => {
    const server = new EventEmitter() as unknown as Server;
    server.to = jest.fn().mockReturnValue(server);
    server.emit = jest.fn();
    return server;
};

describe('GameGateway', () => {
    let gateway: GameGateway;
    // let mockServer: Socket;

    beforeEach(async () => {
        // mockServer = jasmine.createSpyObj<Socket>('Server', ['to', 'emit']);

        const module: TestingModule = await Test.createTestingModule({
            providers: [GameGateway],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        gateway.server = createMockServer();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    // describe('handleConnection', () => {
    //     it('should log when a client connects', () => {
    //         const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    //         const client: Socket = { id: 'client1' } as unknown;

    //         gateway.handleConnection(client);

    //         expect(consoleSpy).toHaveBeenCalledWith(`Client connected: ${client.id}`);
    //         consoleSpy.mockRestore();
    //     });
    // });

    // describe('handleDisconnect', () => {
    //     it('should call handlePlayerLeave if player is in a room', () => {
    //         const client: Socket = { id: 'client1' } as unknown;
    //         gateway.playerRooms.set(client.id, 'room1');
    //         const handlePlayerLeaveSpy = jest.spyOn(gateway, 'handlePlayerLeave');

    //         gateway.handleDisconnect(client);

    //         expect(handlePlayerLeaveSpy).toHaveBeenCalledWith(client, 'room1');
    //     });
    // });

    // describe('handleGetRoomState', () => {
    //     it('should join the client to the room and emit room state', () => {
    //         const client: Socket = { id: 'client1', join: jest.fn(), emit: jest.fn() } as unknown;
    //         const roomId = 'room1';
    //         const room: GameRoom = { id: roomId, accessCode: 1234, players: [], organizer: 'organizerId' };
    //         gateway.rooms.set(roomId, room);
    //         gateway.playerRooms.set(client.id, roomId);

    //         gateway.handleGetRoomState(client, roomId);

    //         expect(client.join).toHaveBeenCalledWith(roomId);
    //         expect(client.emit).toHaveBeenCalledWith('roomState', {
    //             roomId: room.id,
    //             accessCode: room.accessCode,
    //             players: room.players,
    //         });
    //     });

    //     it('should not emit room state if room does not exist', () => {
    //         const client: Socket = { id: 'client1', join: jest.fn(), emit: jest.fn() } as unknown;
    //         const roomId = 'room1';

    //         gateway.handleGetRoomState(client, roomId);

    //         expect(client.join).not.toHaveBeenCalled();
    //         expect(client.emit).not.toHaveBeenCalled();
    //     });
    // });

    // describe('handleCreateGame', () => {
    //     it('should create a new game room and emit room state', () => {
    //         const client: Socket = { id: 'client1', join: jest.fn() } as unknown;
    //         const playerOrganizer = { name: 'Player1', socketId: client.id };
    //         const payload = { gameId: 'game1', playerOrganizer };

    //         gateway.handleCreateGame(client, payload);

    //         expect(gateway.rooms.has('game1')).toBe(true);
    //         expect(mockServer.to).toHaveBeenCalledWith('game1');
    //         expect(mockServer.emit).toHaveBeenCalledWith('roomState', {
    //             roomId: 'game1',
    //             accessCode: expect.any(Number),
    //             players: [playerOrganizer],
    //         });
    //     });
    // });

    // describe('handleJoinGame', () => {
    //     it('should join the game if access code is valid', () => {
    //         const client: Socket = { id: 'client1', join: jest.fn(), emit: jest.fn() } as unknown;
    //         const accessCode = 1234;
    //         const room: GameRoom = { id: 'room1', accessCode, players: [], organizer: '' };
    //         gateway.rooms.set(room.id, room);

    //         gateway.handleJoinGame(client, accessCode);

    //         expect(client.join).toHaveBeenCalledWith(room.id);
    //         expect(client.emit).toHaveBeenCalledWith('joinGameResponse', {
    //             valid: true,
    //             message: 'Joined successfully',
    //             roomId: room.id,
    //             accessCode: room.accessCode,
    //         });
    //     });

    //     it('should not join the game if access code is invalid', () => {
    //         const client: Socket = { id: 'client1', emit: jest.fn() } as unknown;
    //         const accessCode = 9999; // Invalid code

    //         gateway.handleJoinGame(client, accessCode);

    //         expect(client.emit).toHaveBeenCalledWith('joinGameResponse', {
    //             valid: false,
    //             message: 'Room not found',
    //         });
    //     });
    // });

    // describe('handleAddPlayerToRoom', () => {
    //     it('should add a player to the room and emit room state', () => {
    //         const client: Socket = { id: 'client1' } as unknown;
    //         const player = { name: 'Player2', socketId: client.id };
    //         const gameId = 'game1';
    //         const room: GameRoom = { id: gameId, accessCode: 1234, players: [], organizer: 'organizerId' };
    //         gateway.rooms.set(gameId, room);

    //         gateway.handleAddPlayerToRoom(client, { gameId, player });

    //         expect(room.players.length).toBe(1);
    //         expect(room.players[0]).toEqual(player);
    //         expect(mockServer.to).toHaveBeenCalledWith(gameId);
    //         expect(mockServer.emit).toHaveBeenCalledWith('roomState', {
    //             roomId: gameId,
    //             accessCode: room.accessCode,
    //             players: room.players,
    //         });
    //     });
    // });

    // describe('handlePlayerLeave', () => {
    //     it('should close the room if the organizer leaves', () => {
    //         const client: Socket = { id: 'organizerId' } as unknown;
    //         const roomId = 'game1';
    //         const room: GameRoom = { id: roomId, accessCode: 1234, players: [], organizer: client.id };
    //         gateway.rooms.set(roomId, room);

    //         gateway.handlePlayerLeave(client, roomId);

    //         expect(gateway.rooms.has(roomId)).toBe(false);
    //         expect(mockServer.to).toHaveBeenCalledWith(roomId);
    //         expect(mockServer.emit).toHaveBeenCalledWith('roomClosed');
    //     });

    //     it('should remove the player from the room if they are not the organizer', () => {
    //         const client: Socket = { id: 'playerId' } as unknown;
    //         const roomId = 'game1';
    //         const player = { name: 'Player1', socketId: 'playerId' };
    //         const room: GameRoom = { id: roomId, accessCode: 1234, players: [player], organizer: 'organizerId' };
    //         gateway.rooms.set(roomId, room);
    //         gateway.playerRooms.set(client.id, roomId);

    //         gateway.handlePlayerLeave(client, roomId);

    //         expect(room.players.length).toBe(0);
    //         expect(gateway.playerRooms.has(client.id)).toBe(false);
    //         expect(mockServer.to).toHaveBeenCalledWith(roomId);
    //         expect(mockServer.emit).toHaveBeenCalledWith('roomState', {
    //             roomId: room.id,
    //             accessCode: room.accessCode,
    //             players: room.players,
    //         });
    //     });
    // });

    // describe('generateAccessCode', () => {
    //     it('should generate a valid access code', () => {
    //         const accessCode = gateway.generateAccessCode();
    //         expect(accessCode).toBeGreaterThanOrEqual(1000);
    //         expect(accessCode).toBeLessThanOrEqual(9999);
    //     });
    // });
});
