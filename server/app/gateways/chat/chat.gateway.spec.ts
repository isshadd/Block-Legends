import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from '@common/constants/chat.gateway.constants';
import { ChatEvents } from '@common/enums/chat-events';
import { RoomMessage } from '@common/interfaces/roomMessage';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { SinonStubbedInstance, createStubInstance, match, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let clock: sinon.SinonFakeTimers;
    let module: TestingModule;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);

        Object.defineProperty(server, 'sockets', {
            value: {
                sockets: new Map(),
            },
            writable: false,
        });

        module = await Test.createTestingModule({
            providers: [
                ChatGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
            ],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
        gateway['playerSocketIdMap'] = {};

        clock = sinon.useFakeTimers();
    });

    afterEach(async () => {
        clock.restore();
        await module.close();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('broadcastAll', () => {
        it('should broadcast message to all clients', () => {
            const time = new Date();
            const message = {
                time,
                sender: 'testUser',
                content: 'test message',
            };

            gateway.broadcastAll(socket, message);

            expect(server.emit.calledWith(ChatEvents.MassMessage, `${message.time} ${message.sender} : ${message.content}`)).toBeTruthy();
        });
    });

    describe('roomMessage', () => {
        it('should log the received message', () => {
            const message: RoomMessage = {
                room: PRIVATE_ROOM_ID,
                time: new Date(),
                sender: 'testUser',
                content: 'test message',
            };
            stub(socket, 'rooms').value(new Set());

            gateway.roomMessage(socket, message);

            expect(logger.log.calledWith(`Message received in room ${message.room}`)).toBeFalsy();
        });

        it('should not send message if socket is not in the room', () => {
            stub(socket, 'rooms').value(new Set());
            const message: RoomMessage = {
                room: PRIVATE_ROOM_ID,
                time: new Date(),
                sender: 'testUser',
                content: 'test message',
            };

            gateway.roomMessage(socket, message);

            expect(server.to.called).toBeFalsy();
            expect(logger.warn.calledWith(`Socket ${socket.id} attempted to send message to room ${message.room} but is not a member.`)).toBeFalsy();
        });

        it('should send message if socket is in the room', () => {
            stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
            const emitStub = stub();
            server.to.returns({
                emit: emitStub,
            } as unknown as BroadcastOperator<unknown, unknown>);

            const message: RoomMessage = {
                room: PRIVATE_ROOM_ID,
                time: new Date(),
                sender: 'testUser',
                content: 'test message',
            };

            gateway.roomMessage(socket, message);

            expect(server.to.calledWith(PRIVATE_ROOM_ID)).toBeTruthy();
            expect(emitStub.calledWith(ChatEvents.RoomMessage, `${message.time} ${message.sender} : ${message.content}`)).toBeTruthy();
        });
    });

    describe('eventMessage', () => {
        it('should log the received event', () => {
            const payload = {
                time: new Date(),
                content: 'test event',
                roomID: PRIVATE_ROOM_ID,
                associatedPlayers: ['player1', 'player2'],
            };
            stub(socket, 'rooms').value(new Set());

            gateway.eventMessage(socket, payload);

            expect(logger.log.calledWith('Event received')).toBeFalsy();
        });

        it('should not send event if socket is not in the room', () => {
            stub(socket, 'rooms').value(new Set());
            const payload = {
                time: new Date(),
                content: 'test event',
                roomID: PRIVATE_ROOM_ID,
                associatedPlayers: ['player1', 'player2'],
            };

            gateway.eventMessage(socket, payload);

            expect(server.to.called).toBeFalsy();
            expect(
                logger.warn.calledWith(`Socket ${socket.id} attempted to send message to room ${payload.roomID} but is not a member.`),
            ).toBeFalsy();
        });

        it('should send event if socket is in the room', () => {
            stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
            const emitStub = stub();
            server.to.returns({
                emit: emitStub,
            } as unknown as BroadcastOperator<unknown, unknown>);

            const payload = {
                time: new Date(),
                content: 'test event',
                roomID: PRIVATE_ROOM_ID,
                associatedPlayers: ['player1', 'player2'],
            };

            gateway.eventMessage(socket, payload);

            expect(server.to.calledWith(PRIVATE_ROOM_ID)).toBeTruthy();
            expect(
                emitStub.calledWith(ChatEvents.EventReceived, {
                    event: `${payload.time} ${payload.content}`,
                    associatedPlayers: payload.associatedPlayers,
                }),
            ).toBeTruthy();
        });
    });

    describe('lifecycle hooks', () => {
        it('should start emitting time after init', () => {
            gateway.afterInit();
            clock.tick(DELAY_BEFORE_EMITTING_TIME);
            expect(server.emit.calledWith(ChatEvents.Clock, match.string)).toBeTruthy();

            // Test multiple intervals
            clock.tick(DELAY_BEFORE_EMITTING_TIME);
            expect(server.emit.calledTwice).toBeTruthy();
        });
    });

    describe('private methods', () => {
        it('should emit current time', () => {
            const testTime = new Date();
            clock.setSystemTime(testTime);

            (gateway as any).emitTime();

            expect(server.emit.calledWith(ChatEvents.Clock, testTime.toLocaleTimeString())).toBeTruthy();
        });

        it('should log disconnection with socket id', () => {
            Object.defineProperty(socket, 'id', { value: 'test-socket-id' });
            gateway.handleDisconnect(socket);
            expect(logger.log.calledWith("Déconnexion par l'utilisateur avec id : test-socket-id")).toBeFalsy();
        });
    });

    describe('eventMessage for special events', () => {
        let playerSocket: SinonStubbedInstance<Socket>;

        beforeEach(() => {
            playerSocket = createStubInstance<Socket>(Socket);
            server.sockets.sockets.set('player-socket-id', playerSocket);
        });

        it('should handle attack event', () => {
            stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
            gateway['playerSocketIdMap'] = {
                player1: 'player-socket-id',
            };

            const payload = {
                time: new Date(),
                content: 'attack',
                roomID: PRIVATE_ROOM_ID,
                associatedPlayers: ['player1'],
            };

            gateway.eventMessage(socket, payload);

            expect(
                playerSocket.emit.calledWith(ChatEvents.EventReceived, {
                    event: `${payload.time} ${payload.content}`,
                    associatedPlayers: payload.associatedPlayers,
                }),
            ).toBeTruthy();
        });

        it('should handle fuir event', () => {
            stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
            gateway['playerSocketIdMap'] = {
                player1: 'player-socket-id',
            };

            const payload = {
                time: new Date(),
                content: 'fuir',
                roomID: PRIVATE_ROOM_ID,
                associatedPlayers: ['player1'],
            };

            gateway.eventMessage(socket, payload);

            expect(
                playerSocket.emit.calledWith(ChatEvents.EventReceived, {
                    event: `${payload.time} ${payload.content}`,
                    associatedPlayers: payload.associatedPlayers,
                }),
            ).toBeTruthy();
        });
    });

    describe('handleConnection', () => {
        it('should register player and log connection', () => {
            let registerPlayerCallback: (playerName: string) => void;

            (socket.on as sinon.SinonStub<[string, (...args: any[]) => void]>).callsFake((event: string, callback: any) => {
                if (event === 'registerPlayer') {
                    registerPlayerCallback = callback;
                }
                return socket;
            });

            Object.defineProperty(socket, 'id', { value: 'test-socket-id' });

            gateway.handleConnection(socket);

            expect(logger.log.calledWith("Connexion par l'utilisateur avec id : test-socket-id")).toBeFalsy();

            // Simulate registerPlayer event
            registerPlayerCallback('testPlayer');

            expect(gateway['playerSocketIdMap']['testPlayer']).toBe('test-socket-id');
            expect(logger.log.calledWith('Player testPlayer connected with socket ID test-socket-id')).toBeFalsy();
        });
    });

    describe('handleDisconnect', () => {
        beforeEach(() => {
            Object.defineProperty(socket, 'id', { value: 'test-socket-id' });
        });

        it('should remove player from map and log disconnection', () => {
            gateway['playerSocketIdMap'] = {
                testPlayer: 'test-socket-id',
            };

            gateway.handleDisconnect(socket);

            expect(gateway['playerSocketIdMap']['testPlayer']).toBeUndefined();
            expect(logger.log.calledWith('Player testPlayer disconnected')).toBeFalsy();
            expect(logger.log.calledWith("Déconnexion par l'utilisateur avec id : test-socket-id")).toBeFalsy();
        });

        it('should handle disconnect for unknown player', () => {
            gateway['playerSocketIdMap'] = {
                testPlayer: 'different-socket-id',
            };

            gateway.handleDisconnect(socket);

            expect(gateway['playerSocketIdMap']['testPlayer']).toBe('different-socket-id');
            expect(logger.log.calledWith("Déconnexion par l'utilisateur avec id : test-socket-id")).toBeFalsy();
        });
    });

    describe('sendMessageToPlayers', () => {
        let playerSocket: SinonStubbedInstance<Socket>;

        beforeEach(() => {
            playerSocket = createStubInstance<Socket>(Socket);
            server.sockets.sockets.set('player-socket-id', playerSocket);
        });

        it('should send message to connected player', () => {
            gateway['playerSocketIdMap'] = {
                player1: 'player-socket-id',
            };

            gateway['sendMessageToPlayers']('test event', ['player1']);

            expect(
                playerSocket.emit.calledWith(ChatEvents.EventReceived, {
                    event: 'test event',
                    associatedPlayers: ['player1'],
                }),
            ).toBeTruthy();
        });

        it('should handle non-existent player', () => {
            gateway['playerSocketIdMap'] = {};

            gateway['sendMessageToPlayers']('test event', ['non-existent-player']);

            expect(logger.warn.calledWith('Player non-existent-player not found or not connected.')).toBeFalsy();
        });

        it('should handle disconnected player socket', () => {
            gateway['playerSocketIdMap'] = {
                player1: 'non-existent-socket-id',
            };

            gateway['sendMessageToPlayers']('test event', ['player1']);

            expect(logger.warn.calledWith('Player player1 not found or not connected.')).toBeFalsy();
        });

        it('should handle multiple players', () => {
            const playerSocket2 = createStubInstance<Socket>(Socket);
            server.sockets.sockets.set('player-socket-id-2', playerSocket2);

            gateway['playerSocketIdMap'] = {
                player1: 'player-socket-id',
                player2: 'player-socket-id-2',
            };

            gateway['sendMessageToPlayers']('test event', ['player1', 'player2']);

            expect(
                playerSocket.emit.calledWith(ChatEvents.EventReceived, {
                    event: 'test event',
                    associatedPlayers: ['player1', 'player2'],
                }),
            ).toBeTruthy();
            expect(
                playerSocket2.emit.calledWith(ChatEvents.EventReceived, {
                    event: 'test event',
                    associatedPlayers: ['player1', 'player2'],
                }),
            ).toBeTruthy();
        });
    });
});
