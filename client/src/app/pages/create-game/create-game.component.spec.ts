/* eslint-disable import/no-deprecated */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameListComponent } from '@app/components/create-game/game-list/game-list/game-list.component';
import { NavBarComponent } from '@app/components/create-game/nav-bar/nav-bar.component';
import { Game } from '@common/game.interface';
import { CreateGameComponent } from './create-game.component';

const GAME_SIZE = 30;

describe('CreateGameComponent', () => {
    let component: CreateGameComponent;
    let fixture: ComponentFixture<CreateGameComponent>;
    let mockNavBarComponent: jasmine.SpyObj<NavBarComponent>;
    let mockGameListComponent: jasmine.SpyObj<GameListComponent>;

    beforeEach(async () => {
        mockNavBarComponent = jasmine.createSpyObj('NavBarComponent', ['selectMode']);
        mockGameListComponent = jasmine.createSpyObj('GameListComponent', ['selectGame']);
        await TestBed.configureTestingModule({
            imports: [CreateGameComponent, HttpClientTestingModule],
            providers: [
                { provide: NavBarComponent, useValue: mockNavBarComponent },
                { provide: GameListComponent, useValue: mockGameListComponent },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call selectMode on NavBarComponent', () => {
        const mode = 'Combat classique';
        mockNavBarComponent.selectMode(mode);
        expect(mockNavBarComponent.selectMode).toHaveBeenCalledWith(mode);
    });

    it('should contain a game list', () => {
        const game: Game = {
            name: 'JeuTest',
            size: GAME_SIZE,
            mode: 'Combat classique',
            imageUrl: '',
            lastModificationDate: new Date('2024-10-23'),
            isVisible: true,
        };
        mockGameListComponent.selectGame(game);
        expect(mockGameListComponent.selectGame).toHaveBeenCalledWith(game);
    });
});
