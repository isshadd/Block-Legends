import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { GameService, VP_NUMBER } from '@app/services/game-services/game.service';
import { BASE_STATS, PlayerAttributes } from 'src/app/classes/Characters/player-attributes';
import { WaitingViewComponent } from './waiting-view.component';

class MockRouter {
    navigate = jasmine.createSpy('navigate');
}

const ACCESS_CODE = 1234;

describe('WaitingViewComponent', () => {
    let component: WaitingViewComponent;
    let fixture: ComponentFixture<WaitingViewComponent>;
    let mockRouter: MockRouter;
    let mockGameService: GameService;

    beforeEach(() => {
        mockRouter = new MockRouter();
        mockGameService = new GameService();

        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: GameService, useValue: mockGameService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should generate, store and display the access code on initialization', () => {
        component.storedCode = ACCESS_CODE;
        component.ngOnInit();
        expect(component.accessCode).toBeDefined();
        expect(component.storedCode).toBe(component.accessCode);
    });

    it('should add organizer to the players list if user is organizer', () => {
        component.players[0] = new PlayerCharacter('', '', new PlayerAttributes());
        expect(component.players.length).toBe(1);
        mockGameService.setCharacter(new PlayerCharacter('', '', new PlayerAttributes()));
        expect(component.players[0].name).toBe(mockGameService.getCharacter().name);
    });

    it('sould create a valid virtual player', () => {
        component.addVirtualPlayers();
        expect(component.players[1].name).toBe('Joueur virtuel 1');
        // LES LIGNES SUIVANTES SERONT A CHANGER PLUS TARD
        expect(component.players[1].avatar).toBe('');
        expect(component.players[1].attributes.life).toBe(BASE_STATS);
        expect(component.players[1].attributes.speed).toBe(BASE_STATS);
        expect(component.players[1].attributes.attack).toBeGreaterThanOrEqual(BASE_STATS);
        expect(component.players[1].attributes.defense).toBeGreaterThanOrEqual(BASE_STATS);
    });

    it('should add a virtual player when addVirtualPlayers is called', () => {
        const expectedPlayer1 = 2;
        component.addVirtualPlayers();
        expect(component.players.length).toBe(expectedPlayer1);
        expect(component.players[1].name).toBe('Joueur virtuel 1');

        const expectedPlayer2 = 3;
        component.addVirtualPlayers();
        expect(component.players.length).toBe(expectedPlayer2);
        expect(component.players[2].name).toBe('Joueur virtuel 2');
    });

    it('should navigate to the home page when playerLeave is called', () => {
        component.playerLeave();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should not allow another player to join if the game is full', () => {
        for (let i = 0; i < VP_NUMBER + 1; i++) {
            component.addVirtualPlayers();
        }
        expect(component.players.length).toBe(VP_NUMBER + 1);
        expect(component.maxPlayerMessage).toBe('Le nombre maximum de joueurs est atteint !');
    });
});
