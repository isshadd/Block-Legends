/* eslint-disable import/no-deprecated */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.services';
import { ModeService } from '@app/services/game-mode-services/gameMode.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';
import { of } from 'rxjs';
import { GameListComponent } from './game-list.component';

describe('GameListComponent', () => {
    let component: GameListComponent;
    let fixture: ComponentFixture<GameListComponent>;
    let modeService: jasmine.SpyObj<ModeService>;
    let router: jasmine.SpyObj<Router>;
    let mockGameServerCommunicationService: jasmine.SpyObj<GameServerCommunicationService>;
    let mockAdministrationService: jasmine.SpyObj<AdministrationPageManagerService>;

    let mockGames: GameShared[];

    beforeEach(async () => {
        const modeServiceSpy = jasmine.createSpyObj('ModeService', ['selectedMode$']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        mockAdministrationService = jasmine.createSpyObj('AdministrationPageManagerService', [], {
            games: [
                {
                    _id: '1',
                    name: 'Game 1',
                    isVisible: true,
                    mode: GameMode.Classique,
                    description: 'Description 1',
                    size: MapSize.SMALL,
                    imageUrl: '',
                    tiles: [],
                },
            ],
        });

        mockGameServerCommunicationService = jasmine.createSpyObj('GameServerCommunicationService', ['getGames']);

        mockGameServerCommunicationService = jasmine.createSpyObj('GameServerCommunicationService', {
            getGames: of(mockGames),
        });

        Object.defineProperty(modeServiceSpy, 'selectedMode$', { get: () => of(GameMode.Classique) });

        await TestBed.configureTestingModule({
            imports: [GameListComponent, HttpClientTestingModule],
            providers: [
                { provide: ModeService, useValue: modeServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: GameServerCommunicationService, useValue: mockGameServerCommunicationService },
                { provide: AdministrationPageManagerService, useValue: mockAdministrationService },
            ],
        }).compileComponents();

        mockGames = [
            {
                _id: '1',
                name: 'Game 1',
                isVisible: true,
                mode: GameMode.Classique,
                description: 'Description 1',
                size: MapSize.SMALL,
                imageUrl: '',
                tiles: [],
            },
            {
                _id: '2',
                name: 'Game 2',
                isVisible: false,
                mode: GameMode.Classique,
                description: 'Description 2',
                size: MapSize.LARGE,
                imageUrl: '',
                tiles: [],
            },
        ];

        fixture = TestBed.createComponent(GameListComponent);
        component = fixture.componentInstance;
        modeService = TestBed.inject(ModeService) as jasmine.SpyObj<ModeService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

        Object.defineProperty(modeService, 'selectedMode$', { get: () => of(GameMode.Classique) });
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with the default selected mode', () => {
        fixture.detectChanges();
        expect(component.selectedMode).toBe(GameMode.Classique);
    });

    it('should populate games from GameServerCommunicationService', () => {
        component.ngOnInit();
        expect(mockGameServerCommunicationService.getGames).toHaveBeenCalled();
        expect(component.games.length).toBe(2);
        expect(component.games).toEqual(mockGames);
    });

    it('should return games from AdministrationPageManagerService', () => {
        const games = component.getGames();
        expect(games.length).toBe(1);
        expect(games[0]).toEqual(mockGames[0]);
    });

    it('should select a game', () => {
        component.selectGame(mockGames[0]);
        expect(component.selectedGame).toEqual(mockGames[0]);
    });

    it('should navigate to /home when homeButton is called', () => {
        component.homeButton();
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should set selectedGame and navigate to /create-character when a visible game is selected', () => {
        const visibleGame = mockGames[0];
        component.selectGame(visibleGame);

        expect(component.selectedGame).toBe(visibleGame);
        expect(component.gameStatus).toBeNull();
        expect(router.navigate).toHaveBeenCalledWith(['/create-character']);
    });

    it('should not select a game and set gameStatus when an invisible game is selected', () => {
        const invisibleGame = mockGames[1];
        component.selectGame(invisibleGame);

        expect(component.selectedGame).toBeNull();
        expect(component.gameStatus).toBe(`Le jeu choisi ${invisibleGame.name} n'est plus visible ou supprimé`);
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should filter games based on the selected mode and visibility', () => {
        component.games = mockGames;
        fixture.detectChanges();

        const filteredGames = component.getFilteredGames();
        expect(filteredGames.length).toBe(1);
        expect(filteredGames[0].name).toBe('Game 1');
    });
});
