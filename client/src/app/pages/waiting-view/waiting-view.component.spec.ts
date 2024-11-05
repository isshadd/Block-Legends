// src/app/pages/waiting-view/waiting-view.component.spec.ts
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService, VP_NUMBER } from '@app/services/game-services/game.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { WindowRefService } from '@app/services/window-ref-services/window-ref-services';
import { of, Subject } from 'rxjs';
import { PlayerCharacter } from 'src/app/classes/Characters/player-character';
import { WaitingViewComponent } from './waiting-view.component';

describe('WaitingViewComponent', () => {
    let component: WaitingViewComponent;
    let fixture: ComponentFixture<WaitingViewComponent>;
    let mockGameService: any;
    let mockWebSocketService: any;
    let mockRouter: any;
    let mockActivatedRoute: any;
    let mockWindowRef: any; // Déclarer le mock du service
    let destroy$: Subject<void>;

    beforeEach(async () => {
        destroy$ = new Subject<void>();

        mockGameService = {
            accessCode$: of(1234),
            character$: of({ isOrganizer: true }),
            generateVirtualCharacter: jasmine.createSpy('generateVirtualCharacter').and.returnValue({ name: 'VirtualPlayer' }),
        };

        mockWebSocketService = {
            players$: of([]),
            isLocked$: of(false),
            maxPlayers$: of(10),
            init: jasmine.createSpy('init'),
            createGame: jasmine.createSpy('createGame'),
            addPlayerToRoom: jasmine.createSpy('addPlayerToRoom'),
            leaveGame: jasmine.createSpy('leaveGame'),
            lockRoom: jasmine.createSpy('lockRoom'),
            unlockRoom: jasmine.createSpy('unlockRoom'),
            kickPlayer: jasmine.createSpy('kickPlayer'),
            startGame: jasmine.createSpy('startGame'),
            socket: {
                on: jasmine.createSpy('on'),
            },
        };

        mockRouter = {
            navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
        };

        mockActivatedRoute = {
            queryParams: of({ roomId: 'game123' }),
        };

        mockWindowRef = {
            nativeWindow: {
                location: {
                    reload: jasmine.createSpy('reload'),
                },
            },
        };

        await TestBed.configureTestingModule({
            imports: [WaitingViewComponent, CommonModule],
            providers: [
                { provide: GameService, useValue: mockGameService },
                { provide: WebSocketService, useValue: mockWebSocketService },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: WindowRefService, useValue: mockWindowRef }, // Fournir le mock
            ],
        }).compileComponents();

        // Mock de window.alert()
        spyOn(window, 'alert').and.stub();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        destroy$.next();
        destroy$.complete();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize gameId from query params', () => {
        expect(component.gameId).toBe('game123');
    });

    it('should set isOrganizer based on character$', () => {
        expect(component.isOrganizer).toBeTrue();
        expect(mockWebSocketService.init).toHaveBeenCalled();
        expect(mockWebSocketService.createGame).toHaveBeenCalledWith('game123', { isOrganizer: true });
    });

    it('should subscribe to accessCode$ and change room ID', () => {
        spyOn(component, 'changeRoomId');
        component.ngOnInit();
        expect(component.accessCode).toBe(1234);
        expect(component.changeRoomId).toHaveBeenCalledWith(1234);
    });

    it('should update playersCounter when players$ emits', () => {
        const mockPlayers = [{}, {}, {}];
        mockWebSocketService.players$ = of(mockPlayers);
        component.ngOnInit();
        expect(component.playersCounter).toBe(3);
    });

    it('should update maxPlayers when maxPlayers$ emits', () => {
        mockWebSocketService.maxPlayers$ = of(10);
        component.ngOnInit();
        expect(component.maxPlayers).toBe(10);
    });

    it('should handle "organizerLeft" event', () => {
        component.isOrganizer = false;
        component.playerLeave = jasmine.createSpy('playerLeave');
        component.ngOnInit();
        expect(mockWebSocketService.socket.on).toHaveBeenCalledWith('organizerLeft', jasmine.any(Function));

        const eventHandler = mockWebSocketService.socket.on.calls.argsFor(0)[1];
        eventHandler({ message: 'Organizer left' });

        expect(component.playerLeave).toHaveBeenCalled();
    });

    it('should add virtual players up to VP_NUMBER', () => {
        component.playersCounter = VP_NUMBER - 1;
        component.addVirtualPlayers();
        expect(mockGameService.generateVirtualCharacter).toHaveBeenCalledWith(VP_NUMBER - 1);
        expect(mockWebSocketService.addPlayerToRoom).toHaveBeenCalledWith(1234, { name: 'VirtualPlayer' });
        expect(component.playersCounter).toBe(VP_NUMBER);
        expect(component.isMaxPlayer).toBeFalse();
    });

    it('should set isMaxPlayer to true if VP_NUMBER is reached', () => {
        component.playersCounter = VP_NUMBER;
        component.addVirtualPlayers();
        expect(component.isMaxPlayer).toBeTrue();
        expect(mockGameService.generateVirtualCharacter).not.toHaveBeenCalled();
        expect(mockWebSocketService.addPlayerToRoom).not.toHaveBeenCalled();
    });

    it('should handle playerLeave correctly', async () => {
        await component.playerLeave();
        expect(mockWebSocketService.leaveGame).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
        expect(mockWindowRef.nativeWindow.location.reload).toHaveBeenCalled();
    });

    it('should handle playerNonOrgLeave correctly', async () => {
        await component.playerNonOrgLeave();
        expect(mockWebSocketService.leaveGame).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
        expect(window.alert).toHaveBeenCalledWith('Vous avez quitté la partie');
        expect(mockWindowRef.nativeWindow.location.reload).toHaveBeenCalled();
    });

    it('should lock the room', () => {
        component.lockRoom();
        expect(mockWebSocketService.lockRoom).toHaveBeenCalled();
    });

    it('should unlock the room', () => {
        component.unlockRoom();
        expect(mockWebSocketService.unlockRoom).toHaveBeenCalled();
    });

    it('should kick a player if isOrganizer is true', () => {
        const player: PlayerCharacter = { name: 'Player1' } as PlayerCharacter;
        component.isOrganizer = true;
        component.kickPlayer(player);
        expect(mockWebSocketService.kickPlayer).toHaveBeenCalledWith(player);
    });

    it('should not kick a player if isOrganizer is false', () => {
        const player: PlayerCharacter = { name: 'Player1' } as PlayerCharacter;
        component.isOrganizer = false;
        component.kickPlayer(player);
        expect(mockWebSocketService.kickPlayer).not.toHaveBeenCalled();
    });

    it('should start the game', () => {
        component.playGame();
        expect(mockWebSocketService.startGame).toHaveBeenCalled();
    });

    it('should change the room ID in the URL', () => {
        spyOn(mockRouter, 'navigate');
        component.changeRoomId(5678);
        expect(mockRouter.navigate).toHaveBeenCalledWith([], {
            relativeTo: mockActivatedRoute,
            queryParams: { roomId: 5678 },
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    });

    it('should not change the room ID if newRoomId is null', () => {
        spyOn(mockRouter, 'navigate');
        component.changeRoomId(null);
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should clean up subscriptions on destroy', () => {
        spyOn(destroy$, 'next');
        spyOn(destroy$, 'complete');
        component.ngOnDestroy();
        expect(destroy$.next).toHaveBeenCalled();
        expect(destroy$.complete).toHaveBeenCalled();
    });
});
