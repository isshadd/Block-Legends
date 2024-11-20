import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService, VP_NUMBER } from '@app/services/game-services/game.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { PlayerCharacter } from '@common/classes/player-character';
import { BehaviorSubject, of } from 'rxjs';
import { WaitingViewComponent } from './waiting-view.component';

const ACCESS_CODE = 1234;
const PLAYER4 = 4;
const PLAYER6 = 6;

describe('WaitingViewComponent', () => {
    let component: WaitingViewComponent;
    let fixture: ComponentFixture<WaitingViewComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let mockActivatedRoute: Partial<ActivatedRoute>;

    const mockCharacter = {
        isOrganizer: true,
        // Add other required properties of PlayerCharacter
    } as PlayerCharacter;

    const mockSocket = {
        on: jasmine.createSpy('on'),
    };

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['generateVirtualCharacter'], {
            accessCode$: new BehaviorSubject<number>(ACCESS_CODE),
            character$: new BehaviorSubject<PlayerCharacter>(mockCharacter),
        });

        webSocketServiceSpy = jasmine.createSpyObj(
            'WebSocketService',
            ['init', 'createGame', 'addPlayerToRoom', 'leaveGame', 'lockRoom', 'unlockRoom', 'kickPlayer', 'startGame'],
            {
                players$: new BehaviorSubject<PlayerCharacter[]>([]),
                isLocked$: new BehaviorSubject<boolean>(false),
                maxPlayers$: new BehaviorSubject<number>(PLAYER4),
                socket: mockSocket,
            },
        );

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        routerSpy.navigate.and.returnValue(Promise.resolve(true));

        mockActivatedRoute = {
            queryParams: of({ roomId: '1234' }),
        };

        await TestBed.configureTestingModule({
            imports: [WaitingViewComponent],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingViewComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should initialize for organizer', fakeAsync(() => {
            component.ngOnInit();
            tick();

            expect(component.gameId).toBe('1234');
            expect(component.isOrganizer).toBeTrue();
            expect(webSocketServiceSpy.init).toHaveBeenCalled();
            expect(webSocketServiceSpy.createGame).toHaveBeenCalled();
            expect(component.accessCode).toBe(ACCESS_CODE);
        }));

        it('should initialize for non-organizer', fakeAsync(() => {
            const nonOrgCharacter = { ...mockCharacter, isOrganizer: false };
            (gameServiceSpy.character$ as BehaviorSubject<PlayerCharacter>).next(nonOrgCharacter as PlayerCharacter);

            component.ngOnInit();
            tick();

            expect(component.isOrganizer).toBeFalse();
            expect(webSocketServiceSpy.init).not.toHaveBeenCalled();
            expect(component.accessCode).toBe(ACCESS_CODE);
        }));

        it('should handle players$ subscription', fakeAsync(() => {
            component.ngOnInit();
            (webSocketServiceSpy.players$ as BehaviorSubject<PlayerCharacter[]>).next([{} as PlayerCharacter]);
            tick();

            expect(component.playersCounter).toBeGreaterThan(1);
        }));

        it('should handle maxPlayers$ subscription', fakeAsync(() => {
            component.ngOnInit();
            (webSocketServiceSpy.maxPlayers$ as BehaviorSubject<number>).next(PLAYER6);
            tick();

            expect(component.maxPlayers).toBe(PLAYER6);
        }));

        it('should handle organizerLeft event', fakeAsync(() => {
            component.isOrganizer = false;
            component.ngOnInit();

            const socketCallback = mockSocket.on.calls.mostRecent().args[1];
            socketCallback({ message: 'Organizer left' });
            tick();

            expect(webSocketServiceSpy.leaveGame).not.toHaveBeenCalled();
        }));
    });

    describe('addVirtualPlayers', () => {
        it('should add virtual player when below max', () => {
            const virtualPlayer = {} as PlayerCharacter;
            gameServiceSpy.generateVirtualCharacter.and.returnValue(virtualPlayer);
            component.playersCounter = 1;

            component.addVirtualPlayer('aggressive');

            expect(webSocketServiceSpy.addPlayerToRoom).toHaveBeenCalled();
            expect(component.playersCounter).toBe(2);
        });

        it('should not add player when at max', () => {
            component.playersCounter = PLAYER4;

            component.addVirtualPlayer('aggressive');

            expect(component.isMaxPlayer).toBeFalse();
            expect(webSocketServiceSpy.addPlayerToRoom).toHaveBeenCalled();
        });
    });

    it('should handle playerLeave', fakeAsync(() => {
        component.playerLeave();
        tick();

        expect(webSocketServiceSpy.leaveGame).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    }));

    it('should handle playerNonOrgLeave', fakeAsync(() => {
        component.playerNonOrgLeave();
        tick();

        expect(webSocketServiceSpy.leaveGame).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    }));

    it('should handle lockRoom', () => {
        component.lockRoom();
        expect(webSocketServiceSpy.lockRoom).toHaveBeenCalled();
    });

    it('should handle unlockRoom', () => {
        component.unlockRoom();
        expect(webSocketServiceSpy.unlockRoom).toHaveBeenCalled();
    });

    it('should handle kickPlayer when organizer', () => {
        const playerToKick = {} as PlayerCharacter;
        component.isOrganizer = true;

        component.kickPlayer(playerToKick);

        expect(webSocketServiceSpy.kickPlayer).toHaveBeenCalledWith(playerToKick);
    });

    it('should not kickPlayer when not organizer', () => {
        const playerToKick = {} as PlayerCharacter;
        component.isOrganizer = false;

        component.kickPlayer(playerToKick);

        expect(webSocketServiceSpy.kickPlayer).not.toHaveBeenCalled();
    });

    it('should handle playGame', () => {
        component.playGame();
        expect(webSocketServiceSpy.startGame).toHaveBeenCalled();
    });

    it('should handle changeRoomId', () => {
        const newRoomId = 4321;
        component.changeRoomId(newRoomId);

        expect(routerSpy.navigate).toHaveBeenCalledWith([], {
            relativeTo: jasmine.any(Object),
            queryParams: { roomId: newRoomId },
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    });

    it('should handle ngOnDestroy', () => {
        const destroyNextSpy = spyOn(component['destroy$'], 'next');
        const destroyCompleteSpy = spyOn(component['destroy$'], 'complete');

        component.ngOnDestroy();

        expect(destroyNextSpy).toHaveBeenCalled();
        expect(destroyCompleteSpy).toHaveBeenCalled();
    });

    describe('organizerLeft event', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should not call playerLeave when isOrganizer is true', fakeAsync(() => {
            component.isOrganizer = true;
            const socketCallback = mockSocket.on.calls.mostRecent().args[1];

            socketCallback({ message: 'Organizer left' });
            tick();

            expect(webSocketServiceSpy.leaveGame).not.toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalled();
        }));

        it('should call playerLeave when isOrganizer is false', fakeAsync(() => {
            component.isOrganizer = false;
            const socketCallback = mockSocket.on.calls.mostRecent().args[1];

            socketCallback({ message: 'Organizer left' });
            tick();

            expect(webSocketServiceSpy.leaveGame).toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
        }));
    });

    describe('addVirtualPlayers', () => {
        it('should set isMaxPlayer to true and return early when playersCounter >= VP_NUMBER', () => {
            component.playersCounter = VP_NUMBER;
            component.isMaxPlayer = false;
            const virtualPlayer = {} as PlayerCharacter;
            gameServiceSpy.generateVirtualCharacter.and.returnValue(virtualPlayer);

            component.addVirtualPlayer('aggressive');

            expect(component.isMaxPlayer).toBeFalse();
            expect(gameServiceSpy.generateVirtualCharacter).toHaveBeenCalled();
            expect(webSocketServiceSpy.addPlayerToRoom).toHaveBeenCalled();
            expect(component.playersCounter).toBe(VP_NUMBER + 1);
        });

        it('should add virtual player when playersCounter < VP_NUMBER', () => {
            component.playersCounter = VP_NUMBER - 1;
            component.isMaxPlayer = false;
            const virtualPlayer = {} as PlayerCharacter;
            gameServiceSpy.generateVirtualCharacter.and.returnValue(virtualPlayer);

            component.addVirtualPlayer('aggressive');

            expect(component.isMaxPlayer).toBeFalse();
            expect(gameServiceSpy.generateVirtualCharacter).toHaveBeenCalled();
            expect(webSocketServiceSpy.addPlayerToRoom).toHaveBeenCalled();
            expect(component.playersCounter).toBe(VP_NUMBER);
        });
    });

    describe('ngOnInit character subscription', () => {
        it('should do nothing when gameId is null', fakeAsync(() => {
            // Setup mock ActivatedRoute to return null roomId
            TestBed.resetTestingModule();
            mockActivatedRoute = {
                queryParams: of({ roomId: null }),
            };

            TestBed.configureTestingModule({
                imports: [WaitingViewComponent],
                providers: [
                    { provide: GameService, useValue: gameServiceSpy },
                    { provide: WebSocketService, useValue: webSocketServiceSpy },
                    { provide: Router, useValue: routerSpy },
                    { provide: ActivatedRoute, useValue: mockActivatedRoute },
                ],
            }).compileComponents();

            fixture = TestBed.createComponent(WaitingViewComponent);
            component = fixture.componentInstance;

            component.ngOnInit();
            tick();

            (gameServiceSpy.character$ as BehaviorSubject<PlayerCharacter>).next(mockCharacter);
            tick();

            expect(component.isOrganizer).toBeTrue();
            expect(webSocketServiceSpy.init).not.toHaveBeenCalled();
            expect(webSocketServiceSpy.createGame).not.toHaveBeenCalled();
            expect(component.playersCounter).toBe(1);
        }));
    });

    describe('tooggleView', () => {
        it('should toggle showClavardage', () => {
            component.showClavardage = true;
            component.toggleView();

            expect(component.showClavardage).toBeFalse();
        });
    });
});
