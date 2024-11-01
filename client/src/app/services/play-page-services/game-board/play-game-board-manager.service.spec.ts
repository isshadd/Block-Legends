import { TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { PlayerMapEntity } from '@app/classes/Characters/player-map-entity';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameRoom, WebSocketService } from '@app/services/SocketService/websocket.service';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';
import { Subject } from 'rxjs';
import { PlayGameBoardManagerService } from './play-game-board-manager.service';
import { PlayGameBoardSocketService } from './play-game-board-socket.service';

describe('PlayGameBoardManagerService', () => {
    let service: PlayGameBoardManagerService;
    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let playGameBoardSocketServiceSpy: jasmine.SpyObj<PlayGameBoardSocketService>;

    let signalInitGameBoard$ = new Subject<GameShared>();
    let signalInitCharacters$ = new Subject<[number, string][]>();

    const mockGameData: GameShared = {
        name: 'tset',
        description: 'desc',
        size: MapSize.SMALL,
        mode: GameMode.Classique,
        imageUrl: 'blabla',
        isVisible: false,
        tiles: [],
    };

    const mockRoomInfo: GameRoom = {
        roomId: 'room1',
        players: [new PlayerCharacter('Player1'), new PlayerCharacter('Player2')],
        accessCode: 1234,
        isLocked: false,
    };
    mockRoomInfo.players[0].avatar = AvatarEnum.Alex;
    mockRoomInfo.players[1].avatar = AvatarEnum.Sirene;

    const mockGrid = [
        [new GrassTile(), new GrassTile()],
        [new GrassTile(), new GrassTile()],
    ];

    beforeEach(() => {
        const gameMapDataManagerSpy = jasmine.createSpyObj('GameMapDataManagerService', ['init', 'getCurrentGrid', 'getTilesWithSpawn']);
        const webSocketSpy = jasmine.createSpyObj('WebSocketService', ['getRoomInfo']);
        const playGameBoardSocketSpy = jasmine.createSpyObj('PlayGameBoardSocketService', ['initGameBoard']);

        playGameBoardSocketSpy.signalInitGameBoard$ = new Subject();
        playGameBoardSocketSpy.signalInitCharacters$ = new Subject();

        webSocketSpy.getRoomInfo.and.returnValue(mockRoomInfo);
        gameMapDataManagerSpy.getCurrentGrid.and.returnValue(mockGrid);
        gameMapDataManagerSpy.getTilesWithSpawn.and.returnValue([]);

        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: gameMapDataManagerSpy },
                { provide: WebSocketService, useValue: webSocketSpy },
                { provide: PlayGameBoardSocketService, useValue: playGameBoardSocketSpy },
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
        gameMapDataManagerServiceSpy = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;
        webSocketServiceSpy = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;
        playGameBoardSocketServiceSpy = TestBed.inject(PlayGameBoardSocketService) as jasmine.SpyObj<PlayGameBoardSocketService>;
    });

    afterEach(() => {
        signalInitGameBoard$.complete();
        signalInitCharacters$.complete();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call initGameBoard on PlayGameBoardSocketService with current room access code upon initialization', () => {
        expect(webSocketServiceSpy.getRoomInfo).toHaveBeenCalled();
        expect(playGameBoardSocketServiceSpy.initGameBoard).toHaveBeenCalledWith(1234);
    });

    it('should subscribe to signalInitGameBoard$ and signalInitCharacters$ on initialization', () => {
        spyOn(service, 'initGameBoard').and.callThrough();
        spyOn(service, 'initCharacters').and.callThrough();

        (playGameBoardSocketServiceSpy.signalInitGameBoard$ as Subject<GameShared>).next(mockGameData);
        expect(service.initGameBoard).toHaveBeenCalledWith(mockGameData);

        const spawnPlaces: [number, string][] = [
            [0, 'Player1'],
            [1, 'Player2'],
        ];
        (playGameBoardSocketServiceSpy.signalInitCharacters$ as Subject<[number, string][]>).next(spawnPlaces);
        expect(service.initCharacters).toHaveBeenCalledWith(spawnPlaces);
    });

    it('should call init on GameMapDataManagerService with game data on initGameBoard', () => {
        service.initGameBoard(mockGameData);
        expect(gameMapDataManagerServiceSpy.init).toHaveBeenCalledWith(mockGameData);
    });

    it('should initialize characters correctly when initCharacters is called', () => {
        const spawnPlaces: [number, string][] = [
            [0, 'Player1'],
            [1, 'Player2'],
        ];
        const tilesWithSpawn: TerrainTile[] = [new GrassTile(), new GrassTile(), new GrassTile()];

        const roomInfo = webSocketServiceSpy.getRoomInfo();
        gameMapDataManagerServiceSpy.getTilesWithSpawn.and.returnValue(tilesWithSpawn);

        service.initCharacters(spawnPlaces);

        expect(roomInfo.players[0].mapEntity).toBeTruthy();
        expect(roomInfo.players[0].mapEntity).toEqual(jasmine.any(PlayerMapEntity));
        expect(roomInfo.players[1].mapEntity).toBeTruthy();
        expect(roomInfo.players[1].mapEntity).toEqual(jasmine.any(PlayerMapEntity));

        expect(tilesWithSpawn[0].player).toBe(roomInfo.players[0].mapEntity);
        expect(tilesWithSpawn[1].player).toBe(roomInfo.players[1].mapEntity);
        expect(tilesWithSpawn[2].item).toBeNull();
    });

    it('should retrieve the current grid from GameMapDataManagerService when getCurrentGrid is called', () => {
        const grid = service.getCurrentGrid();
        expect(gameMapDataManagerServiceSpy.getCurrentGrid).toHaveBeenCalled();
        expect(grid).toEqual(mockGrid);
    });

    it('should properly unsubscribe from observables upon destruction', () => {
        spyOn((service as any).destroy$, 'next').and.callThrough();
        spyOn((service as any).destroy$, 'complete').and.callThrough();

        service.ngOnDestroy();

        expect((service as any).destroy$.next).toHaveBeenCalled();
        expect((service as any).destroy$.complete).toHaveBeenCalled();
    });
});
