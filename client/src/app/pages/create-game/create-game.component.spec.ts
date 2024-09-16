import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CreateGameComponent } from './create-game.component';

describe('CreateGameComponent', () => {
    let component: CreateGameComponent;
    let fixture: ComponentFixture<CreateGameComponent>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            imports: [CreateGameComponent],
            providers: [{ provide: Router, useValue: mockRouter }],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should select a game', () => {
        const game = { id: 1, name: 'Jeu 1', description: "C'est le jeu 1", visible: true };
        component.selectGame(game);
        expect(component.selectedGame).toEqual(game);
    });

    it('should navigate to the home page', () => {
        component.homeButton();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should navigate to the create-character page', () => {
        const game = { id: 1, name: 'Jeu 1', description: "C'est le jeu 1", visible: true };
        component.selectGame(game);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/create-character']);
    });

    it('should hide the game if it is not visible', () => {
        const game = { id: 1, name: 'Jeu 1', description: "C'est le jeu 1", visible: false };
        component.selectGame(game);
        expect(component.selectedGame).toBeNull();
        expect(component.gameStatus).toEqual(`Le jeu choisi ${game.name} n'est plus visible ou supprimé`);
    });

    it('should select a mode', () => {
        const mode = 'Combat classique';
        component.selectMode(mode);
        expect(component.selectedMode).toEqual(mode);
    });
});
