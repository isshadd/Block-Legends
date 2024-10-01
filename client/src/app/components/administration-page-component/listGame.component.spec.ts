import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.services';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';
import { ListGameComponent } from './listGame.component';

describe('ListGameComponent', () => {
    let component: ListGameComponent;
    let fixture: ComponentFixture<ListGameComponent>;
    let administrationService: jasmine.SpyObj<AdministrationPageManagerService>;
    let gameMapDataManagerService: jasmine.SpyObj<GameMapDataManagerService>;
    let router: jasmine.SpyObj<Router>;

    let mockGames: GameShared[];

    beforeEach(async () => {
        const administrationSpy = jasmine.createSpyObj('AdministrationPageManagerService', ['setGames', 'deleteGame', 'toggleVisibility']);
        const gameMapDataSpy = jasmine.createSpyObj('GameMapDataManagerService', ['setLocalStorageVariables']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [ListGameComponent],
            providers: [
                { provide: AdministrationPageManagerService, useValue: administrationSpy },
                { provide: GameMapDataManagerService, useValue: gameMapDataSpy },
                { provide: Router, useValue: routerSpy },
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

        fixture = TestBed.createComponent(ListGameComponent);
        component = fixture.componentInstance;
        administrationService = TestBed.inject(AdministrationPageManagerService) as jasmine.SpyObj<AdministrationPageManagerService>;
        gameMapDataManagerService = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

        administrationService.games = mockGames;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should call setGames on initialization', () => {
        fixture.detectChanges();
        expect(administrationService.setGames).toHaveBeenCalled();
    });

    it('should get the games from the service', () => {
        expect(component.getGames()).toEqual(administrationService.games);
    });

    it('should call deleteGame on the service when DeleteGame is called', () => {
        component.deleteGame(mockGames[0]._id);
        expect(administrationService.deleteGame).toHaveBeenCalled();
    });

    it('should return the list of games from the administration service', () => {
        const games = component.getGames();
        expect(games).toEqual(mockGames);
    });

    it('should delete a game if id is provided', () => {
        component.deleteGame('1');
        expect(administrationService.deleteGame).toHaveBeenCalledWith('1');
    });

    it('should not delete a game if id is null or undefined', () => {
        component.deleteGame(null);
        component.deleteGame(undefined);
        expect(administrationService.deleteGame).not.toHaveBeenCalled();
    });

    it('should toggle visibility of a game', () => {
        const game = mockGames[0];
        component.toggleVisibility(game);
        expect(administrationService.toggleVisibility).toHaveBeenCalledWith(game);
    });

    it('should set local storage variables and navigate to map-editor when editing a game', () => {
        const game = mockGames[0];
        component.editGame(game);
        expect(gameMapDataManagerService.setLocalStorageVariables).toHaveBeenCalledWith(false, game);
        expect(router.navigate).toHaveBeenCalledWith(['/map-editor']);
    });
});
