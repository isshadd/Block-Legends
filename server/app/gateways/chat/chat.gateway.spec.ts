import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { Server, Socket } from 'socket.io';
import { ChatEvents } from '@common/enums/gateway-events/chat-events';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { DELAY_BEFORE_EMITTING_TIME } from '@common/constants/chat.gateway.constants';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let server: jest.Mocked<Server>;
    let socket: jest.Mocked<Socket>;

    beforeEach(async () => {
        // Create mock Server
        server = {
            emit: jest.fn(),
            to: jest.fn().mockReturnThis(),
            sockets: {
                sockets: new Map(),
            },
        } as any;

        // Create mock Socket
        socket = {
            id: 'test-socket-id',
            rooms: new Set(['test-room']),
            emit: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [ChatGateway],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        // Inject mock server
        (gateway as any).server = server;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('roomMessage', () => {
        it('should emit message to room when socket is in the room', () => {
            const message = {
                room: 'test-room',
                time: new Date(),
                sender: 'Test User',
                content: 'Hello World',
            };

            gateway.roomMessage(socket, message);

            expect(server.to).toHaveBeenCalledWith('test-room');
            expect(server.to(message.room).emit).toHaveBeenCalledWith(ChatEvents.RoomMessage, {
                ...message,
                senderId: socket.id,
            });
        });

        it('should not emit message when socket is not in the room', () => {
            const message = {
                room: 'other-room',
                time: new Date(),
                sender: 'Test User',
                content: 'Hello World',
            };

            gateway.roomMessage(socket, message);

            expect(server.to).not.toHaveBeenCalled();
        });
    });

    describe('eventMessage', () => {
        let mockPlayerSocket: jest.Mocked<Socket>;
        const testPlayer = new PlayerCharacter('test');
        testPlayer.socketId = 'player-socket-id';

        beforeEach(() => {
            mockPlayerSocket = {
                emit: jest.fn(),
            } as any;

            server.sockets.sockets.set(testPlayer.socketId, mockPlayerSocket);
        });

        it('should emit attack/fuir events to specific players', () => {
            const payload = {
                time: new Date(),
                content: 'attack',
                roomID: 'test-room',
                associatedPlayers: [testPlayer as PlayerCharacter],
            };

            gateway.eventMessage(socket, payload);

            expect(mockPlayerSocket.emit).toHaveBeenCalledWith(ChatEvents.EventReceived, {
                event: { time: payload.time, content: payload.content },
                associatedPlayers: payload.associatedPlayers,
            });
        });

        it('should emit other events to the entire room', () => {
            const payload = {
                time: new Date(),
                content: 'other-event',
                roomID: 'test-room',
                associatedPlayers: [testPlayer],
            };

            gateway.eventMessage(socket, payload);

            expect(server.to).toHaveBeenCalledWith('test-room');
            expect(server.to(payload.roomID).emit).toHaveBeenCalledWith(ChatEvents.EventReceived, {
                event: { time: payload.time, content: payload.content },
                associatedPlayers: payload.associatedPlayers,
            });
        });

        it('should not emit room events when socket is not in the room', () => {
            const payload = {
                time: new Date(),
                content: 'other-event',
                roomID: 'other-room',
                associatedPlayers: [testPlayer],
            };

            gateway.eventMessage(socket, payload);

            expect(server.to).not.toHaveBeenCalled();
        });
    });

    describe('lifecycle methods', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should initialize time emission interval on init', () => {
            const setIntervalSpy = jest.spyOn(global, 'setInterval');
            gateway.afterInit();

            expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), DELAY_BEFORE_EMITTING_TIME);

            // Trigger interval callback
            jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);

            expect(server.emit).toHaveBeenCalledWith(ChatEvents.Clock, expect.any(String));
        });

        it('should log connection handling', () => {
            const loggerSpy = jest.spyOn((gateway as any).logger, 'log');

            gateway.handleConnection(socket);

            expect(loggerSpy).toHaveBeenCalledWith(`Connexion par l'utilisateur avec id : ${socket.id}`);
        });

        it('should log disconnection handling', () => {
            const loggerSpy = jest.spyOn((gateway as any).logger, 'log');

            gateway.handleDisconnect(socket);

            expect(loggerSpy).toHaveBeenCalledWith(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
        });
    });
});
