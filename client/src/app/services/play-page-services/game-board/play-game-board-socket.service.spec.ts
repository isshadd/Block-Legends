// import { TestBed } from '@angular/core/testing';
// import { WebSocketService } from '@app/services/SocketService/websocket.service';
// import sinon from 'sinon';
// import { Socket } from 'socket.io-client';
// import { PlayPageMouseHandlerService } from '../play-page-mouse-handler.service';
// import { PlayGameBoardManagerService } from './play-game-board-manager.service';
// import { PlayGameBoardSocketService } from './play-game-board-socket.service';

// describe('PlayGameBoardSocketService', () => {
//     let service: PlayGameBoardSocketService;
//     let webSocketServiceStub: sinon.SinonStubbedInstance<WebSocketService>;
//     let playGameBoardManagerServiceStub: sinon.SinonStubbedInstance<PlayGameBoardManagerService>;
//     let playPageMouseHandlerServiceStub: sinon.SinonStubbedInstance<PlayPageMouseHandlerService>;
//     let socketStub: sinon.SinonStubbedInstance<Socket>;

//     beforeEach(() => {
//         webSocketServiceStub = sinon.createStubInstance(WebSocketService);
//         playGameBoardManagerServiceStub = sinon.createStubInstance(PlayGameBoardManagerService);
//         playPageMouseHandlerServiceStub = sinon.createStubInstance(PlayPageMouseHandlerService);
//         socketStub = sinon.createStubInstance(Socket);

//         TestBed.configureTestingModule({
//             providers: [
//                 PlayGameBoardSocketService,
//                 { provide: WebSocketService, useValue: webSocketServiceStub },
//                 { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceStub },
//                 { provide: PlayPageMouseHandlerService, useValue: playPageMouseHandlerServiceStub },
//             ],
//         });

//         service = TestBed.inject(PlayGameBoardSocketService);
//         service.socket = socketStub as unknown as Socket;
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     it('should initialize game board on init', () => {
//         const accessCode = 123;
//         webSocketServiceStub.getRoomInfo.returns({ accessCode });
//         service.init();
//         expect(socketStub.emit.calledWith('initGameBoard', accessCode)).toBeTruthy();
//     });

//     it('should emit userMoved event', () => {
//         const data = { x: 1, y: 2 };
//         const accessCode = 123;
//         webSocketServiceStub.getRoomInfo.returns({ accessCode });
//         playGameBoardManagerServiceStub.signalUserMoved$.next(data);
//         expect(socketStub.emit.calledWith('userMoved', { ...data, accessCode })).toBeTruthy();
//     });

//     it('should emit userStartedMoving event', () => {
//         const accessCode = 123;
//         webSocketServiceStub.getRoomInfo.returns({ accessCode });
//         playGameBoardManagerServiceStub.signalUserStartedMoving$.next();
//         expect(socketStub.emit.calledWith('userStartedMoving', accessCode)).toBeTruthy();
//     });

//     it('should emit userFinishedMoving event', () => {
//         const accessCode = 123;
//         webSocketServiceStub.getRoomInfo.returns({ accessCode });
//         playGameBoardManagerServiceStub.signalUserFinishedMoving$.next();
//         expect(socketStub.emit.calledWith('userFinishedMoving', accessCode)).toBeTruthy();
//     });

//     it('should emit userDidDoorAction event', () => {
//         const tileCoordinate = { x: 1, y: 2 };
//         const accessCode = 123;
//         webSocketServiceStub.getRoomInfo.returns({ accessCode });
//         playGameBoardManagerServiceStub.signalUserDidDoorAction$.next(tileCoordinate);
//         expect(socketStub.emit.calledWith('userDidDoorAction', { tileCoordinate, accessCode })).toBeTruthy();
//     });

//     it('should end turn when user turn ends', () => {
//         service.endTurn();
//         expect(socketStub.emit.calledWith('userEndTurn')).toBeTruthy();
//     });

//     it('should disconnect socket on leaveGame', () => {
//         service.leaveGame();
//         expect(socketStub.disconnect.called).toBeTruthy();
//     });

//     it('should set up socket listeners on init', () => {
//         const setupSocketListenersSpy = sinon.spy(service, 'setupSocketListeners');
//         service.init();
//         expect(setupSocketListenersSpy.called).toBeTruthy();
//     });

//     afterEach(() => {
//         sinon.restore();
//     });
// });
