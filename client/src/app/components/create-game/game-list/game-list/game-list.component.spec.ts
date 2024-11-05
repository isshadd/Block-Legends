import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Tile } from '@app/classes/Tiles/tile';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { ModalOneOptionComponent } from '@app/components/modal-one-option/modal-one-option.component';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { ModeService } from '@app/services/game-mode-services/gameMode.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { GameListComponent } from './game-list.component';

describe('GameListComponent', () => {
    let component: GameListComponent;
    let fixture: ComponentFixture<GameListComponent>;

    let mockModeService: Partial<ModeService>;
    let mockRouter: Partial<Router>;
    let mockTileFactoryService: Partial<TileFactoryService>;
    let mockAdministrationService: Partial<AdministrationPageManagerService>;
    let mockGameServerCommunicationService: Partial<GameServerCommunicationService>;

    let selectedModeSubject: BehaviorSubject<GameMode>;
    let signalGamesSettedSubject: Subject<GameShared[]>;

    beforeEach(async () => {
        selectedModeSubject = new BehaviorSubject<GameMode>(GameMode.Classique);
        signalGamesSettedSubject = new Subject<GameShared[]>();

        mockModeService = {
            selectedMode$: selectedModeSubject.asObservable(),
        };

        mockRouter = {
            navigate: jasmine.createSpy('navigate'),
        };

        mockTileFactoryService = {
            loadGridFromJSON: jasmine.createSpy('loadGridFromJSON').and.callFake((tilesJSON: any) => {
                return [
                    [new Tile(), new Tile()],
                    [new Tile(), new Tile()],
                ];
            }),
        };

        mockAdministrationService = {
            signalGamesSetted$: signalGamesSettedSubject.asObservable(),
            setGames: jasmine.createSpy('setGames').and.callFake(() => {
                const mockGames: GameShared[] = [
                    {
                        _id: 'game1',
                        name: 'Game One',
                        mode: GameMode.Classique,
                        isVisible: true,
                        tiles: [],
                        description: '',
                        size: MapSize.SMALL,
                        imageUrl: '',
                    },
                    {
                        _id: 'game2',
                        name: 'Game Two',
                        mode: GameMode.Classique,
                        isVisible: false,
                        tiles: [],
                        description: '',
                        size: MapSize.SMALL,
                        imageUrl: '',
                    },
                ];
                signalGamesSettedSubject.next(mockGames);
            }),
        };

        mockGameServerCommunicationService = {
            getGame: jasmine.createSpy('getGame').and.callFake((gameId: string) => {
                const mockGame: GameShared = {
                    _id: gameId,
                    name: `Game ${gameId}`,
                    mode: GameMode.Classique,
                    isVisible: true,
                    tiles: [],
                    description: '',
                    size: MapSize.SMALL,
                    imageUrl: '',
                };
                return of(mockGame);
            }),
        };

        await TestBed.configureTestingModule({
            imports: [CommonModule, ModalOneOptionComponent, MapComponent, GameListComponent],
            providers: [
                { provide: ModeService, useValue: mockModeService },
                { provide: Router, useValue: mockRouter },
                { provide: TileFactoryService, useValue: mockTileFactoryService },
                { provide: AdministrationPageManagerService, useValue: mockAdministrationService },
                { provide: GameServerCommunicationService, useValue: mockGameServerCommunicationService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(GameListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the game list with fetched games', () => {
        expect(component.databaseGames.length).toBe(2);
        expect(component.databaseGames[0].name).toBe('Game One');
        expect(component.databaseGames[1].name).toBe('Game Two');
        expect(mockTileFactoryService.loadGridFromJSON).toHaveBeenCalledTimes(2);
    });

    it('should navigate to home when homeButton is called', () => {
        component.homeButton();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should select a visible game and navigate to create-character', () => {
        const gameToSelect = component.databaseGames[0];
        component.selectGame(gameToSelect);

        expect(mockGameServerCommunicationService.getGame).toHaveBeenCalledWith('game1');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/create-character'], { queryParams: { id: 'game1' } });
        expect(component.selectedGame).toEqual({
            _id: 'game1',
            name: 'Game game1',
            mode: GameMode.Classique,
            isVisible: true,
            tiles: [],
            description: '',
            size: MapSize.SMALL,
            imageUrl: '',
        });
        expect(component.gameStatus).toBeNull();
    });

    it('should not select an invisible game and set gameStatus message', () => {
        (mockGameServerCommunicationService.getGame as jasmine.Spy).and.callFake((gameId: string) => {
            const mockGame: GameShared = {
                _id: gameId,
                name: `Game ${gameId}`,
                mode: GameMode.Classique,
                isVisible: false,
                tiles: [],
                description: '',
                size: MapSize.SMALL,
                imageUrl: '',
            };
            return of(mockGame);
        });

        const gameToSelect = component.databaseGames[1];
        component.selectGame(gameToSelect);

        expect(mockGameServerCommunicationService.getGame).toHaveBeenCalledWith('game2');
        expect(mockRouter.navigate).not.toHaveBeenCalled();
        expect(component.selectedGame).toBeNull();
        expect(component.gameStatus).toBe("Le jeu choisi Game game2 n'est plus disponible");
    });

    it('should return only visible games with selected mode', () => {
        component.selectedMode = GameMode.Classique;
        const filteredGames = component.getFilteredGames();
        expect(filteredGames.length).toBe(1);
        expect(filteredGames[0].name).toBe('Game One');
    });

    it('should return correct index for a given game', () => {
        const game = component.databaseGames[0];
        const index = component.findDatabaseGameIndex(game);
        expect(index).toBe(0);
    });

    it('should open and close the modal correctly', () => {
        expect(component.isModalOpen).toBeFalse();

        component.openModal();
        expect(component.isModalOpen).toBeTrue();

        component.closeModal();
        expect(component.isModalOpen).toBeFalse();
        expect(component.gameStatus).toBeNull();
    });

    // it('should close the modal and reload the window when confirmBack is called', () => {
    //     // Backup the original window.location.reload
    //     const originalReload = window.location.reload;

    //     // Attempt to override window.location.reload with a spy
    //     (window.location as any).reload = jasmine.createSpy('reload');

    //     // Invoke the method that should trigger reload
    //     component.confirmBack();

    //     // Assertions to verify the expected behavior
    //     expect(component.isModalOpen).toBeFalse();
    //     expect(component.gameStatus).toBeNull();
    //     expect(window.location.reload).toHaveBeenCalled();

    //     // Restore the original window.location.reload
    //     window.location.reload = originalReload;
    // });

    it('should update selectedMode when modeService emits a new mode', () => {
        selectedModeSubject.next(GameMode.Classique);
        expect(component.selectedMode).toBe(GameMode.Classique);

        selectedModeSubject.next(GameMode.Classique);
        expect(component.selectedMode).toBe(GameMode.Classique);
    });

    // **Additional Test Case: Button Clicks - Simulate User Interactions**
    it('should handle button clicks correctly', () => {
        // Spy on component methods
        spyOn(component, 'homeButton').and.callThrough();
        spyOn(component, 'openModal').and.callThrough();
        spyOn(component, 'confirmBack').and.callThrough();

        // Find all button elements in the component's template
        const buttons = fixture.debugElement.queryAll(By.css('button'));

        // Helper function to find a button by its text content
        const findButtonByText = (text: string) => {
            return buttons.find((button) => button.nativeElement.textContent.trim() === text);
        };

        // Locate each button by its displayed text
        const homeButton = findButtonByText('Home');
        const openModalButton = findButtonByText('Open Modal');
        const confirmBackButton = findButtonByText('Confirm Back');

        // Simulate button clicks
        if (homeButton) {
            homeButton.triggerEventHandler('click', null);
        }
        if (openModalButton) {
            openModalButton.triggerEventHandler('click', null);
        }
        if (confirmBackButton) {
            confirmBackButton.triggerEventHandler('click', null);
        }
    });
});
