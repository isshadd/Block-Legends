import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { JoinGameComponent } from './join-game.component';

describe('JoinGameComponent', () => {
    let component: JoinGameComponent;
    let fixture: ComponentFixture<JoinGameComponent>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            imports: [JoinGameComponent],
            providers: [{ provide: Router, useValue: mockRouter }],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not join a game if code is incorrect', () => {
        component.accessCode = 1111;
        component.joinGame();
        expect(component.errorMessage).toBe("Le code d'accès est invalide !");
    });

    /*
    // ne fonctionne pas encore car la méthode joinGame n'est pas encore correctement implémentée
    it('should navigate to waiting view', () => {
        component.accessCode = 1111;
        component.joinGame();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/waiting-view']);
    });
    */
});
