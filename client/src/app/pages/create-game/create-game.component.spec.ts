// this import is necessary for this file to work
/* eslint-disable-next-line */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameListComponent } from '@app/components/create-game/game-list/game-list/game-list.component';
import { NavBarComponent } from '@app/components/create-game/nav-bar/nav-bar.component';
import { CreateGameComponent } from '@app/pages/create-game/create-game.component';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';

describe('CreateGameComponent', () => {
    let component: CreateGameComponent;
    let fixture: ComponentFixture<CreateGameComponent>;
    let mockNavBarComponent: jasmine.SpyObj<NavBarComponent>;
    let mockGameListComponent: jasmine.SpyObj<GameListComponent>;

    beforeEach(async () => {
        mockNavBarComponent = jasmine.createSpyObj('NavBarComponent', ['selectMode']);
        mockGameListComponent = jasmine.createSpyObj('GameListComponent', ['selectGame']);
        await TestBed.configureTestingModule({
            // this is necessary to be able to test the component
            /* eslint-disable-next-line */
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
        const mode = GameMode.Classique;
        mockNavBarComponent.selectMode(mode);
        expect(mockNavBarComponent.selectMode).toHaveBeenCalledWith(mode);
    });

    it('should contain a game list', () => {
        const game: GameShared = {
            name: 'JeuTest',
            description: 'Description du jeu',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            imageUrl: 'test.jpg',
            isVisible: true,
            tiles: [],
        };
        mockGameListComponent.selectGame(game);
        expect(mockGameListComponent.selectGame).toHaveBeenCalledWith(game);
    });

    it('should select game mode', () => {
        const mode: GameMode = GameMode.Classique;
        spyOn(component.modeService, 'setSelectedMode').and.callThrough();
        component.selectMode(mode);
        expect(component.modeService.setSelectedMode).toHaveBeenCalledWith(mode);
    });
});
