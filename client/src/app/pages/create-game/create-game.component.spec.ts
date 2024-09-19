import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Game } from 'src/app/classes/Games-create-game/game-interface';
import { CreateGameComponent } from './create-game.component';

const GAME_SIZE = 30;

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
        const game = new Game('jeu1', GAME_SIZE, 'Combat classique', 'img', true);
        component.selectGame(game);
        expect(component.selectedGame).toEqual(game);
    });

    it('should navigate to the home page', () => {
        component.homeButton();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should navigate to the create-character page', () => {
        const game = new Game('jeu1', GAME_SIZE, 'Combat classique', 'img', true);
        component.selectGame(game);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/create-character']);
    });

    it('should hide the game if it is not visible', () => {
        const game = new Game('jeu1', GAME_SIZE, 'Combat classique', 'img', false);
        component.selectGame(game);
        expect(component.selectedGame).toBeNull();
        expect(component.gameStatus).toEqual(`Le jeu choisi ${game.name} n'est plus visible ou supprimé`);
    });

    it('should select a mode', () => {
        const mode = 'Combat classique';
        component.selectMode(mode);
        expect(component.selectedMode).toEqual(mode);
    });

    it('should filter games by mode', () => {
        const games = [
            {
                name: 'League Of Legends',
                size: GAME_SIZE,
                mode: 'Combat classique',
                imgSrc: 'string',
                visible: true,
            },
        ];
        component.games = games;
        component.selectedMode = null;
        expect(component.getFilteredGames()).toEqual([games[0]]);
    });
});
