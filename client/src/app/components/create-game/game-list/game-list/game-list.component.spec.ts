// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { Router } from '@angular/router';
// import { Tile } from '@app/classes/Tiles/tile';
// import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.service';
// import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
// import { ModeService } from '@app/services/game-mode-services/gameMode.service';
// import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
// import { GameMode } from '@common/enums/game-mode';
// import { MapSize } from '@common/enums/map-size';
// import { GameShared } from '@common/interfaces/game-shared';
// import { TileShared } from '@common/interfaces/tile-shared';
// import { BehaviorSubject, of, throwError } from 'rxjs';
// import { GameListComponent } from './game-list.component';

// describe('GameListComponent', () => {
//     let component: GameListComponent;
//     let fixture: ComponentFixture<GameListComponent>;
//     // let modeServiceSpy: jasmine.SpyObj<ModeService>;
//     let routerSpy: jasmine.SpyObj<Router>;
//     let tileFactoryServiceSpy: jasmine.SpyObj<TileFactoryService>;
//     let administrationServiceSpy: jasmine.SpyObj<AdministrationPageManagerService>;
//     let gameServerCommunicationServiceSpy: jasmine.SpyObj<GameServerCommunicationService>;

//     beforeEach(async () => {
//         const modeService = jasmine.createSpyObj('ModeService', [], {
//             selectedMode$: new BehaviorSubject<GameMode>(GameMode.Classique),
//         });

//         const router = jasmine.createSpyObj('Router', ['navigate']);

//         const tileFactoryService = jasmine.createSpyObj('TileFactoryService', ['loadGridFromJSON']);

//         const administrationService = jasmine.createSpyObj('AdministrationPageManagerService', ['setGames'], {
//             signalGamesSetted$: new BehaviorSubject<GameShared[]>([]),
//         });

//         const gameServerCommunicationService = jasmine.createSpyObj('GameServerCommunicationService', ['getGame']);

//         await TestBed.configureTestingModule({
//             declarations: [GameListComponent],
//             providers: [
//                 { provide: ModeService, useValue: modeService },
//                 { provide: Router, useValue: router },
//                 { provide: TileFactoryService, useValue: tileFactoryService },
//                 { provide: AdministrationPageManagerService, useValue: administrationService },
//                 { provide: GameServerCommunicationService, useValue: gameServerCommunicationService },
//             ],
//         }).compileComponents();

//         fixture = TestBed.createComponent(GameListComponent);
//         component = fixture.componentInstance;

//         // modeServiceSpy = TestBed.inject(ModeService) as jasmine.SpyObj<ModeService>;
//         routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
//         tileFactoryServiceSpy = TestBed.inject(TileFactoryService) as jasmine.SpyObj<TileFactoryService>;
//         administrationServiceSpy = TestBed.inject(AdministrationPageManagerService) as jasmine.SpyObj<AdministrationPageManagerService>;
//         gameServerCommunicationServiceSpy = TestBed.inject(GameServerCommunicationService) as jasmine.SpyObj<GameServerCommunicationService>;
//     });

//     it('should create the component', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should subscribe to selectedMode$ and update selectedMode', () => {
//         const newMode = GameMode.CTF;
//         //  modeServiceSpy.selectedMode$.next(newMode);
//         expect(component.selectedMode).toBe(newMode);
//     });

//     it('should subscribe to signalGamesSetted$ and call getGames', () => {
//         spyOn(component, 'getGames');
//         const games = [
//             {
//                 _id: '1',
//                 name: 'Game 1',
//                 isVisible: true,
//                 mode: GameMode.Classique,
//                 description: 'Description 1',
//                 size: MapSize.SMALL,
//                 imageUrl: '',
//                 tiles: [],
//             },
//         ];
//         // administrationServiceSpy.signalGamesSetted$.next(games);
//         expect(component.getGames).toHaveBeenCalledWith(games);
//     });

//     it('should call administrationService.setGames in constructor', () => {
//         expect(administrationServiceSpy.setGames).toHaveBeenCalled();
//     });

//     it('should set databaseGames and loadedTiles in getGames()', () => {
//         const games = [
//             {
//                 _id: '1',
//                 name: 'Game 1',
//                 isVisible: true,
//                 mode: GameMode.Classique,
//                 description: 'Description 1',
//                 size: MapSize.SMALL,
//                 imageUrl: '',
//                 tiles: [],
//             },
//             {
//                 _id: '2',
//                 name: 'Game 2',
//                 isVisible: false,
//                 mode: GameMode.Classique,
//                 description: 'Description 2',
//                 size: MapSize.LARGE,
//                 imageUrl: '',
//                 tiles: [],
//             },
//         ];

//         const loadedTiles1 = [[new Tile()]];
//         const loadedTiles2 = [[new Tile()]];
//         tileFactoryServiceSpy.loadGridFromJSON.and.callFake((tiles: TileShared[][]) => {
//             if (tiles === loadedTiles1) return loadedTiles1;
//             if (tiles === loadedTiles2) return loadedTiles2;
//             return [];
//         });

//         component.getGames(games);

//         expect(component.databaseGames).toEqual(games);
//         expect(tileFactoryServiceSpy.loadGridFromJSON).toHaveBeenCalledWith(loadedTiles1);
//         expect(tileFactoryServiceSpy.loadGridFromJSON).toHaveBeenCalledWith(loadedTiles2);
//         expect(component.loadedTiles).toEqual([loadedTiles1, loadedTiles2]);
//     });

//     it('homeButton() should navigate to /home', () => {
//         component.homeButton();
//         expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
//     });

//     it('selectGame() should set gameStatus and selectedGame to null if game is not available', fakeAsync(() => {
//         const game = { _id: '1', name: 'Game 1', isVisible: true } as GameShared;
//         const updatedGame: GameShared | null = null;
//         gameServerCommunicationServiceSpy.getGame.and.returnValue(of(updatedGame as unknown as GameShared));

//         component.selectGame(game);
//         tick();

//         expect(gameServerCommunicationServiceSpy.getGame).toHaveBeenCalledWith('1');
//         expect(component.gameStatus).toBe('Le jeu choisi  n`est plus disponible');
//         expect(component.selectedGame).toBeNull();
//     }));

//     it('selectGame() should set gameStatus and selectedGame to null if game is not visible', fakeAsync(() => {
//         const game = { _id: '1', name: 'Game 1', isVisible: true } as GameShared;
//         const updatedGame = { _id: '1', name: 'Game 1', isVisible: false } as GameShared;
//         gameServerCommunicationServiceSpy.getGame.and.returnValue(of(updatedGame));

//         component.selectGame(game);
//         tick();

//         expect(gameServerCommunicationServiceSpy.getGame).toHaveBeenCalledWith('1');
//         expect(component.gameStatus).toBe('Le jeu choisi Game 1 n`est plus disponible');
//         expect(component.selectedGame).toBeNull();
//     }));

//     it('selectGame() should set selectedGame and navigate when game is available and visible', fakeAsync(() => {
//         const game = { _id: '1', name: 'Game 1', isVisible: true } as GameShared;
//         const updatedGame = { _id: '1', name: 'Game 1', isVisible: true } as GameShared;
//         gameServerCommunicationServiceSpy.getGame.and.returnValue(of(updatedGame));

//         component.selectGame(game);
//         tick();

//         expect(gameServerCommunicationServiceSpy.getGame).toHaveBeenCalledWith('1');
//         expect(component.selectedGame).toEqual(updatedGame);
//         expect(component.gameStatus).toBeNull();
//         expect(routerSpy.navigate).toHaveBeenCalledWith(['/create-character'], { queryParams: { id: '1' } });
//     }));

//     it('getFilteredGames() should return games that are visible, match selectedMode, and not null', () => {
//         component.databaseGames = [
//             { _id: '1', name: 'Game 1', isVisible: true, mode: GameMode.Classique } as GameShared,
//             { _id: '2', name: 'Game 2', isVisible: false, mode: GameMode.Classique } as GameShared,
//             { _id: '3', name: 'Game 3', isVisible: true, mode: GameMode.CTF } as GameShared,
//             { _id: '4', name: 'Game 4', isVisible: true, mode: GameMode.Classique } as GameShared,
//         ];

//         component.selectedMode = GameMode.Classique;

//         const filteredGames = component.getFilteredGames();

//         expect(filteredGames.length).toBe(2);
//         expect(filteredGames).toEqual([
//             { _id: '1', name: 'Game 1', isVisible: true, mode: GameMode.Classique } as GameShared,
//             { _id: '4', name: 'Game 4', isVisible: true, mode: GameMode.Classique } as GameShared,
//         ]);
//     });

//     it('findDatabaseGameIndex() should return the index of the game in databaseGames', () => {
//         component.databaseGames = [{ _id: '1', name: 'Game 1' } as GameShared, { _id: '2', name: 'Game 2' } as GameShared];
//         const index = component.findDatabaseGameIndex({ _id: '2' } as GameShared);
//         expect(index).toBe(1);
//     });

//     it('findDatabaseGameIndex() should return -1 if game is not found', () => {
//         component.databaseGames = [{ _id: '1', name: 'Game 1' } as GameShared, { _id: '2', name: 'Game 2' } as GameShared];
//         const index = component.findDatabaseGameIndex({ _id: '3' } as GameShared);
//         expect(index).toBe(-1);
//     });

//     it('openModal() should set isModalOpen to true', () => {
//         component.isModalOpen = false;
//         component.openModal();
//         expect(component.isModalOpen).toBeTrue();
//     });

//     it('closeModal() should set isModalOpen to false and reset gameStatus', () => {
//         component.isModalOpen = true;
//         component.gameStatus = 'Error message';
//         component.closeModal();
//         expect(component.isModalOpen).toBeFalse();
//         expect(component.gameStatus).toBeNull();
//     });

//     it('confirmBack() should call closeModal and reload the window', () => {
//         spyOn(component, 'closeModal');
//         spyOn(window.location, 'reload');
//         component.confirmBack();
//         expect(component.closeModal).toHaveBeenCalled();
//         expect(window.location.reload).toHaveBeenCalled();
//     });

//     it('selectGame() should handle error when getGame throws an error', fakeAsync(() => {
//         const game = { _id: '1', name: 'Game 1', isVisible: true } as GameShared;
//         gameServerCommunicationServiceSpy.getGame.and.returnValue(throwError(() => new Error('Error fetching game')));

//         component.selectGame(game);
//         tick();

//         expect(gameServerCommunicationServiceSpy.getGame).toHaveBeenCalledWith('1');
//         expect(component.gameStatus).toBe('Le jeu choisi Game 1 n`est plus disponible');
//         expect(component.selectedGame).toBeNull();
//     }));
// });
