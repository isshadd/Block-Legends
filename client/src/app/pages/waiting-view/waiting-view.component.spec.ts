import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { GameService } from '@app/services/game-services/game.service';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { SocketStateService } from '@app/services/SocketService/socket-state.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { ProfileEnum } from '@common/enums/profile';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { WaitingViewComponent } from './waiting-view.component';

const ACCESS_CODE = 1234;
const PLAYER4 = 4;
const PLAYER6 = 6;
const CALLS = 3;

describe('WaitingViewComponent', () => {
    let component: WaitingViewComponent;
    let fixture: ComponentFixture<WaitingViewComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let socketStateServiceSpy: jasmine.SpyObj<SocketStateService>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let eventJournalServiceSpy: jasmine.SpyObj<EventJournalService>;
    let mockActivatedRoute: Partial<ActivatedRoute>;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;

    const mockSocket = {
        on: jasmine.createSpy('on'),
    };

    const mockCharacter: Partial<PlayerCharacter> = {
        isOrganizer: true,
        name: 'Player1',
        socketId: 'test-socket-id',
    };

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['generateVirtualCharacter', 'setAccessCode', 'setCharacter'], {
            accessCode$: new BehaviorSubject<number>(ACCESS_CODE),
            character$: new BehaviorSubject<PlayerCharacter>(mockCharacter as PlayerCharacter),
        });

        webSocketServiceSpy = jasmine.createSpyObj(
            'WebSocketService',
            ['init', 'createGame', 'addPlayerToRoom', 'leaveGame', 'lockRoom', 'unlockRoom', 'kickPlayer', 'startGame'],
            {
                players$: new BehaviorSubject<PlayerCharacter[]>([mockCharacter as PlayerCharacter]),
                isLocked$: new BehaviorSubject<boolean>(false),
                maxPlayers$: new BehaviorSubject<number>(PLAYER4),
                socket: mockSocket,
                avatarTakenError$: new Subject<string>(),
            },
        );

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        routerSpy.navigate.and.returnValue(Promise.resolve(true));

        socketStateServiceSpy = jasmine.createSpyObj('SocketStateService', ['setActiveSocket', 'clearSocket']);

        chatServiceSpy = jasmine.createSpyObj('ChatService', ['setCharacter', 'setAccessCode'], {
            player: mockCharacter,
        });

        eventJournalServiceSpy = jasmine.createSpyObj('EventJournalService', ['setCharacter', 'setAccessCode', 'broadcastEvent']);

        mockActivatedRoute = {
            queryParams: of({ roomId: '1234' }),
        };

        playGameBoardManagerServiceSpy = jasmine.createSpyObj('PlayGameBoardManagerService', ['init'], {
            winnerPlayer: null,
        });

        await TestBed.configureTestingModule({
            imports: [WaitingViewComponent],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: SocketStateService, useValue: socketStateServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: EventJournalService, useValue: eventJournalServiceSpy },
                { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingViewComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should initialize correctly for organizer', fakeAsync(() => {
            component.ngOnInit();
            tick();

            expect(socketStateServiceSpy.setActiveSocket).toHaveBeenCalledWith(webSocketServiceSpy);
            expect(component.gameId).toBe('1234');
            expect(component.isOrganizer).toBeTrue();
            expect(webSocketServiceSpy.init).toHaveBeenCalled();
            // expect(webSocketServiceSpy.createGame).toHaveBeenCalledWith('1234', mockCharacter);
        }));

        it('should initialize for non-organizer', fakeAsync(() => {
            const nonOrgCharacter = { ...mockCharacter, isOrganizer: false };
            (gameServiceSpy.character$ as BehaviorSubject<PlayerCharacter>).next(nonOrgCharacter as PlayerCharacter);

            component.ngOnInit();
            tick();

            expect(component.isOrganizer).toBeFalse();
            expect(webSocketServiceSpy.init).not.toHaveBeenCalled();
        }));

        it('should handle null character', fakeAsync(() => {
            (gameServiceSpy.character$ as BehaviorSubject<PlayerCharacter | null>).next(null);
            component.ngOnInit();
            tick();

            expect(component.isOrganizer).toBeFalse();
            expect(webSocketServiceSpy.init).not.toHaveBeenCalled();
        }));

        it('should handle player count updates', fakeAsync(() => {
            component.ngOnInit();
            tick();

            const players = [{ socketId: '1' } as PlayerCharacter, { socketId: '2' } as PlayerCharacter];
            (webSocketServiceSpy.players$ as BehaviorSubject<PlayerCharacter[]>).next(players);
            tick();

            expect(component.playersCounter).toBe(2);
        }));
    });

    describe('Room Management', () => {
        it('should lock room', () => {
            component.lockRoom();
            expect(webSocketServiceSpy.lockRoom).toHaveBeenCalled();
        });

        it('should unlock room', () => {
            component.unlockRoom();
            expect(webSocketServiceSpy.unlockRoom).toHaveBeenCalled();
        });

        it('should handle room ID change', () => {
            const newRoomId = 5678;
            component.changeRoomId(newRoomId);

            expect(routerSpy.navigate).toHaveBeenCalledWith([], {
                relativeTo: jasmine.any(Object),
                queryParams: { roomId: newRoomId },
                queryParamsHandling: 'merge',
                replaceUrl: true,
            });
        });

        it('should not navigate on null room ID', () => {
            component.changeRoomId(null);
            expect(routerSpy.navigate).not.toHaveBeenCalled();
        });
    });

    describe('Player Management', () => {
        it('should handle player leave', fakeAsync(() => {
            spyOn(window, 'alert');
            component.playerLeave();
            tick();

            expect(webSocketServiceSpy.leaveGame).toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
            expect(window.alert).toHaveBeenCalledWith('Le créateur a quitté la partie');
        }));

        it('should handle non-organizer player leave', fakeAsync(() => {
            spyOn(window, 'alert');
            component.playerNonOrgLeave();
            tick();

            expect(webSocketServiceSpy.leaveGame).toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
            expect(window.alert).toHaveBeenCalledWith('Vous avez quitté la partie');
        }));

        it('should kick player when organizer', () => {
            component.isOrganizer = true;
            const playerToKick = { socketId: 'kick-id' } as PlayerCharacter;

            component.kickPlayer(playerToKick);

            expect(webSocketServiceSpy.kickPlayer).toHaveBeenCalledWith(playerToKick);
        });

        it('should not kick player when not organizer', () => {
            component.isOrganizer = false;
            const playerToKick = { socketId: 'kick-id' } as PlayerCharacter;

            component.kickPlayer(playerToKick);

            expect(webSocketServiceSpy.kickPlayer).not.toHaveBeenCalled();
        });
    });

    describe('Virtual Players', () => {
        beforeEach(() => {
            component.maxPlayers = PLAYER6;
            component.playersCounter = 3;
        });

        it('should add virtual player when under max players', () => {
            const virtualPlayer = { socketId: 'virtual-id', isVirtual: true } as PlayerCharacter;
            gameServiceSpy.generateVirtualCharacter.and.returnValue(virtualPlayer);

            component.addVirtualPlayer(ProfileEnum.Agressive);

            // expect(webSocketServiceSpy.addPlayerToRoom).toHaveBeenCalledWith(ACCESS_CODE, virtualPlayer);
            expect(component.playersCounter).toBe(CALLS);
        });

        it('should not add virtual player when at max capacity', () => {
            component.playersCounter = PLAYER6;
            component.addVirtualPlayer(ProfileEnum.Agressive);

            expect(component.isMaxPlayer).toBeTrue();
            expect(webSocketServiceSpy.addPlayerToRoom).not.toHaveBeenCalled();
        });

        it('should handle avatar taken error', fakeAsync(() => {
            component.lastVirtualPlayerProfile = ProfileEnum.Agressive;
            component.virtualPlayerRetryCount = 0;
            component.maxVirtualPlayerRetries = 2;

            component.ngOnInit();
            tick();

            (webSocketServiceSpy.avatarTakenError$ as Subject<string>).next('Avatar taken');
            tick();

            expect(component.virtualPlayerRetryCount).toBe(1);
        }));
    });

    describe('Game Flow', () => {
        it('should start game', () => {
            component.playGame();
            expect(webSocketServiceSpy.startGame).toHaveBeenCalled();
        });

        it('should toggle chat view', () => {
            component.showClavardage = true;
            component.toggleView();

            expect(component.showClavardage).toBeFalse();
            // expect(eventJournalServiceSpy.broadcastEvent)
            //    .toHaveBeenCalledWith(mockCharacter.socketId, []);
        });
    });

    describe('Cleanup', () => {
        it('should cleanup on destroy', () => {
            const destroyNextSpy = spyOn(component['destroy$'], 'next');
            const destroyCompleteSpy = spyOn(component['destroy$'], 'complete');

            component.ngOnDestroy();

            expect(socketStateServiceSpy.clearSocket).toHaveBeenCalled();
            expect(destroyNextSpy).toHaveBeenCalled();
            expect(destroyCompleteSpy).toHaveBeenCalled();
        });
    });
});
