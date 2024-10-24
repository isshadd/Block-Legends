import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '@app/services/game-services/game.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { of } from 'rxjs';
import { PlayerAttributes } from 'src/app/classes/Characters/player-attributes';
import { PlayerCharacter } from 'src/app/classes/Characters/player-character';
import { WaitingViewComponent } from './waiting-view.component';

describe('WaitingViewComponent', () => {
    let component: WaitingViewComponent;
    let fixture: ComponentFixture<WaitingViewComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

    beforeEach(() => {
        mockGameService = jasmine.createSpyObj('GameService', ['generateVirtualCharacter']);
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['createGame', 'addPlayerToRoom', 'leaveGame']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', ['queryParams'], {
            queryParams: of({ roomId: 'room1' }),
        });

        TestBed.configureTestingModule({
            imports: [WaitingViewComponent],
            providers: [
                { provide: GameService, useValue: mockGameService },
                { provide: WebSocketService, useValue: mockWebSocketService },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingViewComponent);
        component = fixture.componentInstance;
    });

    it('should initialize with correct roomId from queryParams', () => {
        component.ngOnInit();
        expect(component.gameId).toBe('room1');
        expect(mockGameService.character$.subscribe).toHaveBeenCalled();
    });

    it('should call createGame when character is organizer', () => {
        const character = new PlayerCharacter('Player1', '', new PlayerAttributes());
        character.isOrganizer = true;
        mockGameService.character$ = of(character);

        component.ngOnInit();

        if (component.gameId !== null) {
            expect(mockWebSocketService.createGame).toHaveBeenCalledWith(component.gameId, character);
        }
    });

    it('should call addPlayerToRoom when character is not organizer', () => {
        const character = new PlayerCharacter('Player2', '', new PlayerAttributes());
        character.isOrganizer = false;
        mockGameService.character$ = of(character);

        component.ngOnInit();

        if (component.gameId !== null) {
            expect(mockWebSocketService.addPlayerToRoom).toHaveBeenCalledWith(component.gameId, character);
        }
    });

    it('should add a virtual player', () => {
        const virtualCharacter = new PlayerCharacter('Joueur virtuel 1', '', new PlayerAttributes());
        mockGameService.generateVirtualCharacter.and.returnValue(virtualCharacter);

        component.addVirtualPlayers();

        if (component.gameId !== null) {
            expect(mockWebSocketService.addPlayerToRoom).toHaveBeenCalledWith(component.gameId, virtualCharacter);
        }
        expect(component.playersCounter).toBe(1);
        expect(component.isMaxPlayer).toBeFalse();
    });

    it('should not add a virtual player if max players reached', () => {
        component.playersCounter = 5;
        component.addVirtualPlayers();

        expect(mockWebSocketService.addPlayerToRoom).not.toHaveBeenCalled();
        expect(component.isMaxPlayer).toBeTrue();
    });

    it('should leave the game and navigate to home', () => {
        component.playerLeave();

        expect(mockWebSocketService.leaveGame).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should complete destroy$ subject', () => {
        spyOn(component['destroy$'], 'next');
        spyOn(component['destroy$'], 'complete');

        component.ngOnDestroy();

        expect(component['destroy$'].next).toHaveBeenCalled();
        expect(component['destroy$'].complete).toHaveBeenCalled();
    });
});
