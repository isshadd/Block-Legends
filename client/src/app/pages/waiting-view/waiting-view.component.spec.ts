import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BASE_STATS } from '../create-character/create-character.component';
import { WaitingViewComponent } from './waiting-view.component';

class MockRouter {
    navigate = jasmine.createSpy('navigate');
}

describe('WaitingViewComponent', () => {
    let component: WaitingViewComponent;
    let fixture: ComponentFixture<WaitingViewComponent>;
    let mockRouter: MockRouter;

    beforeEach(() => {
        mockRouter = new MockRouter();

        TestBed.configureTestingModule({
            providers: [{ provide: Router, useValue: mockRouter }],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should generate and display the access code on initialization', () => {
        component.ngOnInit();
        expect(component.accessCode).toBeDefined();
    });

    it('should add organizer to the players list if user is organizer', () => {
        expect(component.players.length).toBe(1);
        expect(component.players[0].name).toBe('Organizer');
    });

    it('sould create a valid virtual player', () => {
        component.addVirtualPlayers();
        expect(component.players[1].name).toBe('Virtual_Player 1');
        // LES LIGNES SUIVANTES SERONT A CHANGER PLUS TARD
        expect(component.players[1].avatar).toBe('');
        expect(component.players[1].life).toBe(BASE_STATS);
        expect(component.players[1].speed).toBe(BASE_STATS);
        expect(component.players[1].attack).toBeGreaterThan(BASE_STATS);
        expect(component.players[1].defense).toBeGreaterThan(BASE_STATS);
    });

    it('should add a virtual player when addVirtualPlayers is called', () => {
        component.addVirtualPlayers();
        expect(component.players.length).toBe(2);
        expect(component.players[1].name).toBe('Virtual_Player 1');

        component.addVirtualPlayers();
        expect(component.players.length).toBe(3);
        expect(component.players[2].name).toBe('Virtual_Player 2');
    });

    it('should navigate to the home page when playerLeave is called', () => {
        component.playerLeave();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });
});
