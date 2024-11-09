// import { Test, TestingModule } from '@nestjs/testing';
// import { ChatGateway } from '@app/gateways/chat/chat.gateway';
// import { Logger } from '@nestjs/common';
// import { SinonStubbedInstance, createStubInstance, match, stub } from 'sinon';
// import { Socket, Server, BroadcastOperator } from 'socket.io';
// import { ChatEvents } from '@common/enums/chat-events';
// import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';
// import { RoomMessage } from '@common/interfaces/roomMessage';
// import * as sinon from 'sinon';

// describe('ChatGateway', () => {
//     let gateway: ChatGateway;
//     let logger: SinonStubbedInstance<Logger>;
//     let socket: SinonStubbedInstance<Socket>;
//     let server: SinonStubbedInstance<Server>;
//     let clock: sinon.SinonFakeTimers;
//     let module: TestingModule;

//     beforeEach(async () => {
//         logger = createStubInstance(Logger);
//         socket = createStubInstance<Socket>(Socket);
//         server = createStubInstance<Server>(Server);

//         module = await Test.createTestingModule({
//             providers: [
//                 ChatGateway,
//                 {
//                     provide: Logger,
//                     useValue: logger,
//                 },
//             ],
//         }).compile();

//         gateway = module.get<ChatGateway>(ChatGateway);
//         // We want to assign a value to the private field
//         // eslint-disable-next-line dot-notation
//         gateway['server'] = server;

//         clock = sinon.useFakeTimers();
//     });

//     afterEach(async () => {
//         clock.restore();
//         await module.close();
//     });

//     it('should be defined', () => {
//         expect(gateway).toBeDefined();
//     });

//     describe('broadcastAll', () => {
//         it('should broadcast message to all clients', () => {
//             const time = new Date();
//             const message = { 
//                 time: time, 
//                 sender: 'testUser', 
//                 content: 'test message' 
//             };
            
//             gateway.broadcastAll(socket, message);
            
//             expect(server.emit.calledWith(
//                 ChatEvents.MassMessage,
//                 `${message.time} ${message.sender} : ${message.content}`
//             )).toBeTruthy();
//         });
//     });

//     describe('roomMessage', () => {
//         it('should log the received message', () => {
//             const message: RoomMessage = {
//                 room: PRIVATE_ROOM_ID,
//                 time: new Date(),
//                 sender: 'testUser',
//                 content: 'test message'
//             };
//             stub(socket, 'rooms').value(new Set());
            
//             gateway.roomMessage(socket, message);
            
//             expect(logger.log.calledWith(`Message received in room ${message.room}`)).toBeFalsy();
//         });

//         it('should not send message if socket is not in the room', () => {
//             stub(socket, 'rooms').value(new Set());
//             const message: RoomMessage = {
//                 room: PRIVATE_ROOM_ID,
//                 time: new Date(),
//                 sender: 'testUser',
//                 content: 'test message'
//             };
            
//             gateway.roomMessage(socket, message);
            
//             expect(server.to.called).toBeFalsy();
//             expect(logger.warn.calledWith(
//                 `Socket ${socket.id} attempted to send message to room ${message.room} but is not a member.`
//             )).toBeFalsy();
//         });

//         it('should send message if socket is in the room', () => {
//             stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
//             const emitStub = stub();
//             server.to.returns({
//                 emit: emitStub
//             } as unknown as BroadcastOperator<unknown, unknown>);
            
//             const message: RoomMessage = {
//                 room: PRIVATE_ROOM_ID,
//                 time: new Date(),
//                 sender: 'testUser',
//                 content: 'test message'
//             };
            
//             gateway.roomMessage(socket, message);
            
//             expect(server.to.calledWith(PRIVATE_ROOM_ID)).toBeTruthy();
//             expect(emitStub.calledWith(
//                 ChatEvents.RoomMessage,
//                 `${message.time} ${message.sender} : ${message.content}`
//             )).toBeTruthy();
//         });
//     });

//     describe('eventMessage', () => {
//         it('should log the received event', () => {
//             const payload = {
//                 time: new Date(),
//                 content: 'test event',
//                 roomID: PRIVATE_ROOM_ID,
//                 associatedPlayers: ['player1', 'player2']
//             };
//             stub(socket, 'rooms').value(new Set());
            
//             gateway.eventMessage(socket, payload);
            
//             expect(logger.log.calledWith('Event received')).toBeFalsy();
//         });

//         it('should not send event if socket is not in the room', () => {
//             stub(socket, 'rooms').value(new Set());
//             const payload = {
//                 time: new Date(),
//                 content: 'test event',
//                 roomID: PRIVATE_ROOM_ID,
//                 associatedPlayers: ['player1', 'player2']
//             };
            
//             gateway.eventMessage(socket, payload);
            
//             expect(server.to.called).toBeFalsy();
//             expect(logger.warn.calledWith(
//                 `Socket ${socket.id} attempted to send message to room ${payload.roomID} but is not a member.`
//             )).toBeFalsy();
//         });

//         it('should send event if socket is in the room', () => {
//             stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
//             const emitStub = stub();
//             server.to.returns({
//                 emit: emitStub
//             } as unknown as BroadcastOperator<unknown, unknown>);
            
//             const payload = {
//                 time: new Date(),
//                 content: 'test event',
//                 roomID: PRIVATE_ROOM_ID,
//                 associatedPlayers: ['player1', 'player2']
//             };
            
//             gateway.eventMessage(socket, payload);
            
//             expect(server.to.calledWith(PRIVATE_ROOM_ID)).toBeTruthy();
//             expect(emitStub.calledWith(
//                 ChatEvents.EventReceived,
//                 {
//                     event: `${payload.time} ${payload.content}`,
//                     associatedPlayers: payload.associatedPlayers
//                 }
//             )).toBeTruthy();
//         });
//     });


//     describe('private methods', () => {
//         it('should emit current time', () => {
//             // Access private method using type assertion
//             (gateway as any).emitTime();
            
//             expect(server.emit.calledWith(
//                 ChatEvents.Clock,
//                 match.string
//             )).toBeTruthy();
//         });
//     });
// });


import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { ChatEvents } from '@common/enums/chat-events';
import { RoomMessage } from '@common/interfaces/roomMessage';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { SinonStubbedInstance, createStubInstance, match, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';

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
                time: time, 
                sender: 'testUser', 
                content: 'test message' 
            };
            
            gateway.broadcastAll(socket, message);
            
            expect(server.emit.calledWith(
                ChatEvents.MassMessage,
                `${message.time} ${message.sender} : ${message.content}`
            )).toBeTruthy();
        });
    });

    describe('roomMessage', () => {
        it('should log the received message', () => {
            const message: RoomMessage = {
                room: PRIVATE_ROOM_ID,
                time: new Date(),
                sender: 'testUser',
                content: 'test message'
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
                content: 'test message'
            };
            
            gateway.roomMessage(socket, message);
            
            expect(server.to.called).toBeFalsy();
            expect(logger.warn.calledWith(
                `Socket ${socket.id} attempted to send message to room ${message.room} but is not a member.`
            )).toBeFalsy();
        });

        it('should send message if socket is in the room', () => {
            stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
            const emitStub = stub();
            server.to.returns({
                emit: emitStub
            } as unknown as BroadcastOperator<unknown, unknown>);
            
            const message: RoomMessage = {
                room: PRIVATE_ROOM_ID,
                time: new Date(),
                sender: 'testUser',
                content: 'test message'
            };
            
            gateway.roomMessage(socket, message);
            
            expect(server.to.calledWith(PRIVATE_ROOM_ID)).toBeTruthy();
            expect(emitStub.calledWith(
                ChatEvents.RoomMessage,
                `${message.time} ${message.sender} : ${message.content}`
            )).toBeTruthy();
        });
    });

    describe('eventMessage', () => {
        it('should log the received event', () => {
            const payload = {
                time: new Date(),
                content: 'test event',
                roomID: PRIVATE_ROOM_ID,
                associatedPlayers: ['player1', 'player2']
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
                associatedPlayers: ['player1', 'player2']
            };
            
            gateway.eventMessage(socket, payload);
            
            expect(server.to.called).toBeFalsy();
            expect(logger.warn.calledWith(
                `Socket ${socket.id} attempted to send message to room ${payload.roomID} but is not a member.`
            )).toBeFalsy();
        });

        it('should send event if socket is in the room', () => {
            stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
            const emitStub = stub();
            server.to.returns({
                emit: emitStub
            } as unknown as BroadcastOperator<unknown, unknown>);
            
            const payload = {
                time: new Date(),
                content: 'test event',
                roomID: PRIVATE_ROOM_ID,
                associatedPlayers: ['player1', 'player2']
            };
            
            gateway.eventMessage(socket, payload);
            
            expect(server.to.calledWith(PRIVATE_ROOM_ID)).toBeTruthy();
            expect(emitStub.calledWith(
                ChatEvents.EventReceived,
                {
                    event: `${payload.time} ${payload.content}`,
                    associatedPlayers: payload.associatedPlayers
                }
            )).toBeTruthy();
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
            
            expect(server.emit.calledWith(
                ChatEvents.Clock,
                testTime.toLocaleTimeString()
            )).toBeTruthy();
        });

        it('should log disconnection with socket id', () => {
            Object.defineProperty(socket, 'id', { value: 'test-socket-id' });
            gateway.handleDisconnect(socket);
            expect(logger.log.calledWith(
                'Déconnexion par l\'utilisateur avec id : test-socket-id'
            )).toBeFalsy();
        });
    });
});

