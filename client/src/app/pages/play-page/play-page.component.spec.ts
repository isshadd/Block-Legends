// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { Router } from '@angular/router';
// import { ChatService } from '@app/services/chat-services/chat-service.service';
// import { GameService } from '@app/services/game-services/game.service';
// import { BattleManagerService } from '@app/services/play-page-services/game-board/battle-manager.service';
// import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
// import { PlayGameBoardSocketService } from '@app/services/play-page-services/game-board/play-game-board-socket.service';
// import { PlayPageMouseHandlerService } from '@app/services/play-page-services/play-page-mouse-handler.service';
// import { SocketStateService } from '@app/services/SocketService/socket-state.service';
// import { WebSocketService } from '@app/services/SocketService/websocket.service';
// import { PlayerCharacter } from '@common/classes/Player/player-character';
// import { Subject } from 'rxjs';
// import { PlayPageComponent } from './play-page.component';

// describe('PlayPageComponent', () => {
//     let component: PlayPageComponent;
//     let fixture: ComponentFixture<PlayPageComponent>;
//     let mockPlayGameBoardManagerService: jasmine.SpyObj<PlayGameBoardManagerService>;
//     let mockPlayPageMouseHandlerService: jasmine.SpyObj<PlayPageMouseHandlerService>;
//     let mockPlayGameBoardSocketService: jasmine.SpyObj<PlayGameBoardSocketService>;
//     let mockBattleManagerService: jasmine.SpyObj<BattleManagerService>;
//     let mockRouter: jasmine.SpyObj<Router>;
//     let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
//     let mockGameService: jasmine.SpyObj<GameService>;
//     let mockSocketStateService: jasmine.SpyObj<SocketStateService>;
//     let mockChatService: jasmine.SpyObj<ChatService>;

//     beforeEach(async () => {
//         mockPlayGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', ['findPlayerFromSocketId'], {
//             signalManagerFinishedInit$: new Subject(),
//             userCurrentActionPoints: 5,
//             areOtherPlayersInBattle: false,
//             currentPlayerIdTurn: 'player1',
//             turnOrder: ['player1', 'player2'],
//         });

//         mockPlayPageMouseHandlerService = jasmine.createSpyObj('PlayPageMouseHandlerService', [
//             'onMapTileMouseDown',
//             'onMapTileMouseEnter',
//             'onMapTileMouseLeave',
//             'discardRightClickSelectedPlayer',
//             'discardRightSelectedTile',
//             'toggleAction',
//         ]);

//         mockPlayGameBoardSocketService = jasmine.createSpyObj('PlayGameBoardSocketService', ['init', 'endTurn', 'leaveGame'], {
//             signalPlayerLeft$: new Subject<string>(),
//         });

//         mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['getTotalPlayers'], {
//             players$: new Subject(),
//         });

//         mockGameService = jasmine.createSpyObj('GameService', [], {
//             character$: new Subject(),
//         });

//         mockSocketStateService = jasmine.createSpyObj('SocketStateService', ['setActiveSocket']);
//         mockChatService = jasmine.createSpyObj('ChatService', ['clearMessages']);

//         await TestBed.configureTestingModule({
//             imports: [PlayPageComponent],
//             providers: [
//                 { provide: PlayGameBoardManagerService, useValue: mockPlayGameBoardManagerService },
//                 { provide: PlayPageMouseHandlerService, useValue: mockPlayPageMouseHandlerService },
//                 { provide: PlayGameBoardSocketService, useValue: mockPlayGameBoardSocketService },
//                 { provide: BattleManagerService, useValue: mockBattleManagerService },
//                 { provide: Router, useValue: mockRouter },
//                 { provide: WebSocketService, useValue: mockWebSocketService },
//                 { provide: GameService, useValue: mockGameService },
//                 { provide: SocketStateService, useValue: mockSocketStateService },
//                 { provide: ChatService, useValue: mockChatService },
//             ],
//         }).compileComponents();

//         fixture = TestBed.createComponent(PlayPageComponent);
//         component = fixture.componentInstance;
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should handle player leaving', () => {
//         const mockPlayer = new PlayerCharacter('player1');
//         mockPlayer.socketId = 'socket1';
//         component.players = [mockPlayer];

//         (mockPlayGameBoardSocketService.signalPlayerLeft$ as Subject<string>).next('socket1');

//         expect(mockPlayer.isAbsent).toBeTrue();
//         expect(component.players).toContain(mockPlayer);
//     });

//     it('should initialize on ngOnInit', () => {
//         const mockCharacter = new PlayerCharacter('test');
//         mockCharacter.attributes = { life: 100 } as any;

//         component.ngOnInit();
//         (mockGameService.character$ as Subject<PlayerCharacter>).next(mockCharacter);

//         expect(mockSocketStateService.setActiveSocket).toHaveBeenCalledWith(mockWebSocketService);
//         expect(component.myPlayer).toBe(mockCharacter);
//         expect(component.totalLifePoints).toBe(100);
//     });

//     it('should handle mouse events', () => {
//         const mockEvent = new MouseEvent('mousedown');
//         const mockTile = {} as any;

//         component.onMapTileMouseDown(mockEvent, mockTile);
//         component.onMapTileMouseEnter(mockTile);
//         component.onMapTileMouseLeave(mockTile);

//         expect(mockPlayPageMouseHandlerService.onMapTileMouseDown).toHaveBeenCalledWith(mockEvent, mockTile);
//         expect(mockPlayPageMouseHandlerService.onMapTileMouseEnter).toHaveBeenCalledWith(mockTile);
//         expect(mockPlayPageMouseHandlerService.onMapTileMouseLeave).toHaveBeenCalledWith(mockTile);
//     });

//     it('should handle leaving game', () => {
//         component.myPlayer = new PlayerCharacter('test');
//         component.leaveGame();

//         expect(component.myPlayer.isAbsent).toBeTrue();
//         expect(mockChatService.clearMessages).toHaveBeenCalled();
//         expect(mockPlayGameBoardSocketService.leaveGame).toHaveBeenCalled();
//     });

//     it('should cleanup on destroy', () => {
//         const nextSpy = spyOn(component['destroy$'], 'next');
//         const completeSpy = spyOn(component['destroy$'], 'complete');

//         component.ngOnDestroy();

//         expect(nextSpy).toHaveBeenCalled();
//         expect(completeSpy).toHaveBeenCalled();
//     });
// });
