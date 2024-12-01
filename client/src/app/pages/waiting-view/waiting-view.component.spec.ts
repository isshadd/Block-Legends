import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '@app/services/chat-services/chat-service.service';
import { GameService, VP_NUMBER } from '@app/services/game-services/game.service';
import { EventJournalService } from '@app/services/journal-services/event-journal.service';
import { SocketStateService } from '@app/services/SocketService/socket-state.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { ProfileEnum } from '@common/enums/profile';
import { BehaviorSubject, of, Subject } from 'rxjs';
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
    let socketStateServiceSpy: jasmine.SpyObj<SocketStateService>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let eventJournalServiceSpy: jasmine.SpyObj<EventJournalService>;
    let mockActivatedRoute: Partial<ActivatedRoute>;

    const mockCharacter = {
        isOrganizer: true,
        name: 'Player1',
    } as PlayerCharacter;

    const mockSocket = {
        on: jasmine.createSpy('on'),
    };

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['generateVirtualCharacter', 'setAccessCode', 'setCharacter'], {
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
                avatarTakenError$: new Subject<string>(),
            },
        );

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        routerSpy.navigate.and.returnValue(Promise.resolve(true));

        socketStateServiceSpy = jasmine.createSpyObj('SocketStateService', ['setActiveSocket', 'clearSocket']);

        chatServiceSpy = jasmine.createSpyObj('ChatService', ['setCharacter', 'setAccessCode']);

        eventJournalServiceSpy = jasmine.createSpyObj('EventJournalService', ['setCharacter', 'setAccessCode', 'broadcastEvent']);

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
                { provide: SocketStateService, useValue: socketStateServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: EventJournalService, useValue: eventJournalServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingViewComponent);
        component = fixture.componentInstance;
    });

    it('devrait créer le composant', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it("devrait initialiser pour l'organisateur", fakeAsync(() => {
            component.ngOnInit();
            tick();

            expect(socketStateServiceSpy.setActiveSocket).toHaveBeenCalledWith(webSocketServiceSpy);
            expect(component.gameId).toBe('1234');
            expect(component.isOrganizer).toBeTrue();
            expect(chatServiceSpy.setCharacter).toHaveBeenCalledWith(mockCharacter);
            expect(eventJournalServiceSpy.setCharacter).toHaveBeenCalledWith(mockCharacter);
            expect(webSocketServiceSpy.init).toHaveBeenCalled();
            expect(webSocketServiceSpy.createGame).toHaveBeenCalledWith('1234', mockCharacter);
            expect(component.accessCode).toBe(ACCESS_CODE);
            expect(component.playersCounter).toBe(0);
        }));

        it('devrait initialiser pour un non-organisateur', fakeAsync(() => {
            const nonOrgCharacter = { ...mockCharacter, isOrganizer: false };
            (gameServiceSpy.character$ as BehaviorSubject<PlayerCharacter>).next(nonOrgCharacter as PlayerCharacter);

            component.ngOnInit();
            tick();

            expect(component.isOrganizer).toBeFalse();
            expect(webSocketServiceSpy.init).not.toHaveBeenCalled();
            expect(component.accessCode).toBe(ACCESS_CODE);
            expect(component.playersCounter).toBe(0);
        }));

        it('devrait retourner tôt si le character est null', fakeAsync(() => {
            (gameServiceSpy.character$ as BehaviorSubject<PlayerCharacter | null>).next(null);
            component.ngOnInit();
            tick();
            expect(component.isOrganizer).toBe(false);
            expect(webSocketServiceSpy.init).not.toHaveBeenCalled();
            expect(webSocketServiceSpy.createGame).not.toHaveBeenCalled();
        }));

        it("devrait gérer l'abonnement players$", fakeAsync(() => {
            component.ngOnInit();
            tick();
            (webSocketServiceSpy.players$ as BehaviorSubject<PlayerCharacter[]>).next([{} as PlayerCharacter, {} as PlayerCharacter]);
            tick();

            expect(component.playersCounter).toBe(2); // Taille de players
        }));

        it("devrait gérer l'abonnement maxPlayers$", fakeAsync(() => {
            component.ngOnInit();
            tick();
            (webSocketServiceSpy.maxPlayers$ as BehaviorSubject<number>).next(PLAYER6);
            tick();

            expect(component.maxPlayers).toBe(PLAYER6);
        }));

        it("devrait gérer l'événement organizerLeft quand non-organisateur", fakeAsync(() => {
            component.isOrganizer = false;
            component.ngOnInit();

            const socketCallback = mockSocket.on.calls.argsFor(0)[1]; // Récupérer le callback pour ORGANIZER_LEFT
            socketCallback();
            tick();

            expect(webSocketServiceSpy.leaveGame).not.toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalled();
        }));

        it("ne devrait pas gérer l'événement organizerLeft quand organisateur", fakeAsync(() => {
            component.isOrganizer = true;
            component.ngOnInit();

            const socketCallback = mockSocket.on.calls.argsFor(0)[1]; // Récupérer le callback pour ORGANIZER_LEFT
            socketCallback();
            tick();

            expect(webSocketServiceSpy.leaveGame).not.toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalled();
        }));

        it("devrait gérer avatarTakenError$ et réessayer d'ajouter un joueur virtuel", fakeAsync(() => {
            component.lastVirtualPlayerProfile = ProfileEnum.Agressive;
            component.virtualPlayerRetryCount = 0;
            component.maxVirtualPlayerRetries = 2;

            component.ngOnInit();
            tick();

            (webSocketServiceSpy.avatarTakenError$ as Subject<string>).next('Avatar pris');
            tick();

            expect(component.virtualPlayerRetryCount).toBe(1);
            expect(gameServiceSpy.generateVirtualCharacter).not.toHaveBeenCalledWith(component.playersCounter, ProfileEnum.Agressive);
            expect(webSocketServiceSpy.addPlayerToRoom).not.toHaveBeenCalled();
        }));

        it('devrait réinitialiser lastVirtualPlayerProfile quand les tentatives max sont atteintes', fakeAsync(() => {
            component.lastVirtualPlayerProfile = ProfileEnum.Agressive;
            component.virtualPlayerRetryCount = 2;
            component.maxVirtualPlayerRetries = 2;

            component.ngOnInit();
            tick();

            (webSocketServiceSpy.avatarTakenError$ as Subject<string>).next('Avatar pris');
            tick();

            expect(component.lastVirtualPlayerProfile).toBeNull();
            expect(component.virtualPlayerRetryCount).toBe(0);
        }));

        it('devrait réinitialiser virtualPlayerRetryCount quand le joueur virtuel est trouvé dans players$', fakeAsync(() => {
            component.lastVirtualPlayerProfile = ProfileEnum.Agressive;
            component.virtualPlayerRetryCount = 1;
            component.lastVirtualPlayerSocketId = 'socket123';

            component.ngOnInit();
            tick();

            (webSocketServiceSpy.players$ as BehaviorSubject<PlayerCharacter[]>).next([{ socketId: 'socket123' } as PlayerCharacter]);
            tick();

            expect(component.lastVirtualPlayerProfile).toBeNull();
            expect(component.virtualPlayerRetryCount).toBe(0);
        }));

        it("ne devrait pas réinitialiser virtualPlayerRetryCount quand le joueur virtuel n'est pas trouvé dans players$", fakeAsync(() => {
            component.lastVirtualPlayerProfile = ProfileEnum.Agressive;
            component.virtualPlayerRetryCount = 1;
            component.lastVirtualPlayerSocketId = 'socket123';

            component.ngOnInit();
            tick();

            (webSocketServiceSpy.players$ as BehaviorSubject<PlayerCharacter[]>).next([{ socketId: 'socket456' } as PlayerCharacter]);
            tick();

            expect(component.lastVirtualPlayerProfile).toBe(ProfileEnum.Agressive);
            expect(component.virtualPlayerRetryCount).toBe(1);
        }));
    });

    describe('addVirtualPlayer', () => {
        beforeEach(() => {
            component.maxPlayers = VP_NUMBER;
        });

        it('devrait ajouter un joueur virtuel quand en dessous du maximum', () => {
            const virtualPlayer = { socketId: 'socket123' } as PlayerCharacter;
            gameServiceSpy.generateVirtualCharacter.and.returnValue(virtualPlayer);
            component.playersCounter = VP_NUMBER - 1;

            component.addVirtualPlayer(ProfileEnum.Agressive);

            expect(component.isMaxPlayer).toBeTrue();
            expect(gameServiceSpy.generateVirtualCharacter).not.toHaveBeenCalledWith(component.playersCounter, ProfileEnum.Agressive);
            expect(webSocketServiceSpy.addPlayerToRoom).not.toHaveBeenCalledWith(ACCESS_CODE, virtualPlayer);
            expect(component.lastVirtualPlayerProfile).toBe(null);
            expect(component.lastVirtualPlayerSocketId).toBe(null);
            expect(component.virtualPlayerRetryCount).toBe(0);
        });

        it('ne devrait pas ajouter de joueur quand au maximum', () => {
            component.playersCounter = VP_NUMBER;
            component.addVirtualPlayer(ProfileEnum.Agressive);

            expect(component.isMaxPlayer).toBeTrue();
            expect(gameServiceSpy.generateVirtualCharacter).not.toHaveBeenCalled();
            expect(webSocketServiceSpy.addPlayerToRoom).not.toHaveBeenCalled();
        });
    });

    it('devrait gérer playerLeave', fakeAsync(() => {
        component.playerLeave();
        tick();

        expect(webSocketServiceSpy.leaveGame).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    }));

    it('devrait gérer playerNonOrgLeave', fakeAsync(() => {
        component.playerNonOrgLeave();
        tick();

        expect(webSocketServiceSpy.leaveGame).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    }));

    it('devrait gérer lockRoom', () => {
        component.lockRoom();
        expect(webSocketServiceSpy.lockRoom).toHaveBeenCalled();
    });

    it('devrait gérer unlockRoom', () => {
        component.unlockRoom();
        expect(webSocketServiceSpy.unlockRoom).toHaveBeenCalled();
    });

    it('devrait gérer kickPlayer quand organisateur', () => {
        const playerToKick = {} as PlayerCharacter;
        component.isOrganizer = true;

        component.kickPlayer(playerToKick);

        expect(webSocketServiceSpy.kickPlayer).toHaveBeenCalledWith(playerToKick);
    });

    it('ne devrait pas kickPlayer quand non-organisateur', () => {
        const playerToKick = {} as PlayerCharacter;
        component.isOrganizer = false;

        component.kickPlayer(playerToKick);

        expect(webSocketServiceSpy.kickPlayer).not.toHaveBeenCalled();
    });

    it('devrait gérer playGame', () => {
        component.playGame();
        expect(webSocketServiceSpy.startGame).toHaveBeenCalled();
    });

    it('devrait gérer changeRoomId avec newRoomId', () => {
        const newRoomId = 4321;
        component.changeRoomId(newRoomId);

        expect(routerSpy.navigate).toHaveBeenCalledWith([], {
            relativeTo: jasmine.any(Object),
            queryParams: { roomId: newRoomId },
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    });

    it('ne devrait pas naviguer quand changeRoomId est appelé avec null', () => {
        component.changeRoomId(null);

        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('devrait gérer ngOnDestroy', () => {
        const destroyNextSpy = spyOn(component['destroy$'], 'next');
        const destroyCompleteSpy = spyOn(component['destroy$'], 'complete');

        component.ngOnDestroy();

        expect(socketStateServiceSpy.clearSocket).toHaveBeenCalled();
        expect(destroyNextSpy).toHaveBeenCalled();
        expect(destroyCompleteSpy).toHaveBeenCalled();
    });

    describe('toggleView', () => {
        it('devrait basculer showClavardage de true à false', () => {
            component.showClavardage = true;
            component.toggleView();

            expect(component.showClavardage).toBeFalse();
        });

        it('devrait basculer showClavardage de false à true', () => {
            component.showClavardage = false;
            component.toggleView();

            expect(component.showClavardage).toBeTrue();
        });
    });
});
