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
    it('should not allow letters in the access code', () => {
        const event: Partial<KeyboardEvent> = {
            key: 'a',
            preventDefault: jasmine.createSpy('preventDefault'),
        };

        component.allowOnlyNumbers(event as KeyboardEvent);

        expect(event.preventDefault).toHaveBeenCalled();
    });
    */
});
