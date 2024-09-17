import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoinGameComponent } from './join-game.component';

class MockRouter {
    navigate = jasmine.createSpy('navigate');
}

describe('JoinGameComponent', () => {
    let component: JoinGameComponent;
    let fixture: ComponentFixture<JoinGameComponent>;
    let mockRouter: MockRouter;

    beforeEach(async () => {
        mockRouter = new MockRouter();
        await TestBed.configureTestingModule({
            imports: [JoinGameComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should join game', () => {
        component.accessCode = 1111;
        component.joinGame();
    });

    it('should navigate to waiting view', () => {
        component.accessCode = 1111;
        component.joinGame();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/waiting-view']);
    });
});
