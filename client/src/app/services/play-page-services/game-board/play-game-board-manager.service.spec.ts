// /* eslint-disable  @typescript-eslint/no-explicit-any */

// import { TestBed } from '@angular/core/testing';
// import { PlayerCharacter } from '@app/classes/Characters/player-character';
// import { PlayerMapEntity } from '@app/classes/Characters/player-map-entity';
// import { GrassTile } from '@app/classes/Tiles/grass-tile';
// import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
// import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
// import { GameRoom, WebSocketService } from '@app/services/SocketService/websocket.service';
// import { AvatarEnum } from '@common/enums/avatar-enum';
// import { GameMode } from '@common/enums/game-mode';
// import { MapSize } from '@common/enums/map-size';
// import { GameShared } from '@common/interfaces/game-shared';
// import { Subject } from 'rxjs';
// import { PlayGameBoardManagerService } from './play-game-board-manager.service';
// import { PlayGameBoardSocketService } from './play-game-board-socket.service';

// const ACCESS_CODE = 1234;

// describe('PlayGameBoardManagerService', () => {
//     let service: PlayGameBoardManagerService;
//     let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;
//     let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
//     let playGameBoardSocketServiceSpy: jasmine.SpyObj<PlayGameBoardSocketService>;

//     // Création des Subjects pour les signaux
//     const signalInitGameBoard$ = new Subject<GameShared>();
//     const signalInitCharacters$ = new Subject<[number, string][]>();

//     const mockGameData: GameShared = {
//         name: 'tset',
//         description: 'desc',
//         size: MapSize.SMALL,
//         mode: GameMode.Classique,
//         imageUrl: 'blabla',
//         isVisible: false,
//         tiles: [],
//     };

//     const mockRoomInfo: GameRoom = {
//         roomId: 'room1',
//         players: [new PlayerCharacter('Player1'), new PlayerCharacter('Player2')],
//         accessCode: ACCESS_CODE,
//         isLocked: false,
//         maxPlayers: 10, // Ajouté
//         currentPlayerTurn: 'Player1', // Ajouté
//     };
//     mockRoomInfo.players[0].avatar = AvatarEnum.Alex;
//     mockRoomInfo.players[1].avatar = AvatarEnum.Sirene;

//     const mockGrid = [
//         [new GrassTile(), new GrassTile()],
//         [new GrassTile(), new GrassTile()],
//     ];

//     beforeEach(() => {
//         // Création des SpyObj avec les méthodes et propriétés nécessaires
//         gameMapDataManagerServiceSpy = jasmine.createSpyObj('GameMapDataManagerService', ['init', 'getCurrentGrid', 'getTilesWithSpawn']);
//         webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['getRoomInfo']);
//         playGameBoardSocketServiceSpy = jasmine.createSpyObj('PlayGameBoardSocketService', ['initGameBoard']);
//         Object.defineProperty(playGameBoardSocketServiceSpy, 'signalInitGameBoard$', { value: signalInitGameBoard$ });
//         Object.defineProperty(playGameBoardSocketServiceSpy, 'signalInitCharacters$', { value: signalInitCharacters$ });

//         // Configuration des retours des méthodes simulées
//         webSocketServiceSpy.getRoomInfo.and.returnValue(mockRoomInfo);
//         gameMapDataManagerServiceSpy.getCurrentGrid.and.returnValue(mockGrid);
//         gameMapDataManagerServiceSpy.getTilesWithSpawn.and.returnValue([]);

//         // Configuration du TestBed
//         TestBed.configureTestingModule({
//             providers: [
//                 PlayGameBoardManagerService,
//                 { provide: GameMapDataManagerService, useValue: gameMapDataManagerServiceSpy },
//                 { provide: WebSocketService, useValue: webSocketServiceSpy },
//                 { provide: PlayGameBoardSocketService, useValue: playGameBoardSocketServiceSpy },
//             ],
//         });

//         // Injection du service
//         service = TestBed.inject(PlayGameBoardManagerService);
//     });

//     afterEach(() => {
//         // Compléter les Subjects pour éviter les fuites de mémoire
//         signalInitGameBoard$.complete();
//         signalInitCharacters$.complete();
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     it('should call initGameBoard on PlayGameBoardSocketService with current room access code upon initialization', () => {
//         expect(webSocketServiceSpy.getRoomInfo).toHaveBeenCalled();
//         expect(playGameBoardSocketServiceSpy.initGameBoard).toHaveBeenCalledWith(ACCESS_CODE);
//     });

//     it('should subscribe to signalInitGameBoard$ and signalInitCharacters$ on initialization', () => {
//         spyOn(service, 'initGameBoard').and.callThrough();
//         spyOn(service, 'initCharacters').and.callThrough();

//         // Émission de l'événement signalInitGameBoard$
//         (playGameBoardSocketServiceSpy as any).signalInitGameBoard$.next(mockGameData);
//         expect(service.initGameBoard).toHaveBeenCalledWith(mockGameData);

//         // Émission de l'événement signalInitCharacters$
//         const spawnPlaces: [number, string][] = [
//             [0, 'Player1'],
//             [1, 'Player2'],
//         ];
//         (playGameBoardSocketServiceSpy as any).signalInitCharacters$.next(spawnPlaces);
//         expect(service.initCharacters).toHaveBeenCalledWith(spawnPlaces);
//     });

//     it('should call init on GameMapDataManagerService with game data on initGameBoard', () => {
//         service.initGameBoard(mockGameData);
//         expect(gameMapDataManagerServiceSpy.init).toHaveBeenCalledWith(mockGameData);
//     });

//     it('should initialize characters correctly when initCharacters is called', () => {
//         const spawnPlaces: [number, string][] = [
//             [0, 'Player1'],
//             [1, 'Player2'],
//         ];
//         const tilesWithSpawn: TerrainTile[] = [new GrassTile(), new GrassTile(), new GrassTile()];

//         // Configuration des retours pour getTilesWithSpawn
//         gameMapDataManagerServiceSpy.getTilesWithSpawn.and.returnValue(tilesWithSpawn);

//         // Appel de la méthode
//         service.initCharacters(spawnPlaces);

//         // Vérification des entités de carte associées aux joueurs
//         expect(mockRoomInfo.players[0].mapEntity).toBeTruthy();
//         expect(mockRoomInfo.players[0].mapEntity).toEqual(jasmine.any(PlayerMapEntity));
//         expect(mockRoomInfo.players[1].mapEntity).toBeTruthy();
//         expect(mockRoomInfo.players[1].mapEntity).toEqual(jasmine.any(PlayerMapEntity));

//         // Vérification des tuiles assignées aux joueurs
//         expect(tilesWithSpawn[0].player).toBe(mockRoomInfo.players[0].mapEntity);
//         expect(tilesWithSpawn[1].player).toBe(mockRoomInfo.players[1].mapEntity);
//         expect(tilesWithSpawn[2].item).toBeNull();
//     });

//     it('should retrieve the current grid from GameMapDataManagerService when getCurrentGrid is called', () => {
//         const grid = service.getCurrentGrid();
//         expect(gameMapDataManagerServiceSpy.getCurrentGrid).toHaveBeenCalled();
//         expect(grid).toEqual(mockGrid);
//     });
// });
