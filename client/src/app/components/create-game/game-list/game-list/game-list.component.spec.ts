/* eslint-disable import/no-deprecated */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavBarComponent } from '@app/components/create-game/nav-bar/nav-bar.component';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.services';
import { ModeService } from '@app/services/game-mode-services/gameMode.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { Game } from '@common/game.interface';
import { of } from 'rxjs';
import { GameListComponent } from './game-list.component';

const GAME_SIZE = 30;

describe('GameListComponent', () => {
    let component: GameListComponent;
    let fixture: ComponentFixture<GameListComponent>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockModeService: jasmine.SpyObj<ModeService>;
    let game: Game;
    let mockGameServerCommunicationService: jasmine.SpyObj<GameServerCommunicationService>;
    let mockAdministrationService: jasmine.SpyObj<AdministrationPageManagerService>;

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockModeService = jasmine.createSpyObj('ModeService', ['selectedMode$']);
        mockModeService.selectedMode$ = of('Combat classique');
        game = {
            name: 'JeuTest',
            size: GAME_SIZE,
            mode: 'Combat classique',
            imageUrl: '',
            lastModificationDate: new Date('2024-10-23'),
            isVisible: true,
        };

        mockAdministrationService = jasmine.createSpyObj('AdministrationPageManagerService', [], {
            games: [
                {
                    name: 'JeuTest',
                    size: GAME_SIZE,
                    mode: 'Combat classique',
                    imageUrl: '',
                    lastModificationDate: new Date('2024-10-23'),
                    isVisible: true,
                },
            ],
        });

        mockGameServerCommunicationService = jasmine.createSpyObj('GameServerCommunicationService', ['getGames']);

        mockGameServerCommunicationService.getGames.and.returnValue(
            of([
                {
                    name: 'JeuTest',
                    size: GAME_SIZE,
                    mode: 'Combat classique',
                    imageUrl: '',
                    lastModificationDate: new Date('2024-10-23'),
                    isVisible: true,
                },
            ]),
        );

        await TestBed.configureTestingModule({
            imports: [GameListComponent, HttpClientTestingModule],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: GameServerCommunicationService, useValue: mockGameServerCommunicationService },
                { provide: ModeService, useValue: mockModeService },
                { provide: AdministrationPageManagerService, useValue: mockAdministrationService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should populate games from GameServerCommunicationService', () => {
        expect(mockGameServerCommunicationService.getGames).toHaveBeenCalled();
        expect(component.games.length).toBe(1);
        expect(component.games).toEqual([game]);
    });

    it('should return games from AdministrationPageManagerService', () => {
        const games = component.getGames();
        expect(games.length).toBe(1);
        expect(games[0]).toEqual(game);
    });

    it('should select a game', () => {
        component.selectGame(game);
        expect(component.selectedGame).toEqual(game);
    });

    it('should navigate to the home page', () => {
        component.homeButton();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should navigate to the create-character page', () => {
        component.selectGame(game);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/create-character']);
    });

    it('should hide the game if it is not visible', () => {
        game.isVisible = false;
        component.selectGame(game);
        expect(component.selectedGame).toBeNull();
        expect(component.gameStatus).toEqual(`Le jeu choisi ${game.name} n'est plus visible ou supprimé`);
    });

    it('should select a mode', () => {
        const mode = 'Combat classique';
        const navbar = new NavBarComponent(new ModeService());
        expect(navbar.selectedMode).toEqual(mode);
    });

    it('should filter games by mode', () => {
        const games: Game[] = [game];
        component.games = games;
        component.selectedMode = null;
        expect(component.getFilteredGames()).toEqual([games[0]]);
    });
});
