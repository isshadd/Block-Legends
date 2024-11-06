import { TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { PlayerMapEntity } from '@app/classes/Characters/player-map-entity';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameRoom, WebSocketService } from '@app/services/SocketService/websocket.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';
import { PlayGameBoardManagerService } from './play-game-board-manager.service';
import { PlayGameBoardSocketService } from './play-game-board-socket.service';

describe('PlayGameBoardManagerService', () => {
    let service: PlayGameBoardManagerService;
    //let gameBoardParameters: GameBoardParameters;

    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    //let playGameBoardSocketServiceSpy: jasmine.SpyObj<PlayGameBoardSocketService>;
    //const ACCESS_CODE = 1234;

    beforeEach(() => {
        const gameMapDataManagerSpy = jasmine.createSpyObj('GameMapDataManagerService', [
            'init',
            'getCurrentGrid',
            'getTilesWithSpawn',
            'getTileAt',
            'getPossibleMovementTiles',
            'getNeighbours',
        ]);
        const webSocketSpy = jasmine.createSpyObj('WebSocketService', ['getRoomInfo']);
        const playGameBoardSocketSpy = jasmine.createSpyObj('PlayGameBoardSocketService', ['initGameBoard']);

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
        //playGameBoardSocketServiceSpy = TestBed.inject(PlayGameBoardSocketService) as jasmine.SpyObj<PlayGameBoardSocketService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // it('should call initGameBoard on PlayGameBoardSocketService with current room access code upon initialization', () => {
    //     webSocketServiceSpy.getRoomInfo.and.returnValue({ accessCode: ACCESS_CODE });

    //     service.init(gameBoardParameters);

    //     expect(webSocketServiceSpy.getRoomInfo).toHaveBeenCalled();
    //     expect(playGameBoardSocketServiceSpy.initGameBoard).toHaveBeenCalledWith(ACCESS_CODE);
    // });

    it('should call init on GameMapDataManagerService with game data on initGameBoard', () => {
        const mockGameData: GameShared = {
            name: 'testGame',
            description: 'A test game',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            imageUrl: 'someImageUrl',
            isVisible: false,
            tiles: [],
        };

        service.initGameBoard(mockGameData);

        expect(gameMapDataManagerServiceSpy.init).toHaveBeenCalledWith(mockGameData);
    });

    it('should initialize characters correctly when initCharacters is called', () => {
        const spawnPlaces: [number, string][] = [
            [0, 'Player1'],
            [1, 'Player2'],
        ];
        const tilesWithSpawn = [new GrassTile(), new GrassTile(), new GrassTile()];

        gameMapDataManagerServiceSpy.getTilesWithSpawn.and.returnValue(tilesWithSpawn);
        webSocketServiceSpy.getRoomInfo.and.returnValue({
            players: [{ mapEntity: new PlayerMapEntity('Player1Head') }, { mapEntity: new PlayerMapEntity('Player2Head') }],
        } as GameRoom);

        service.initCharacters(spawnPlaces);

        const roomInfo = webSocketServiceSpy.getRoomInfo();

        expect(roomInfo.players[0].mapEntity).toBeTruthy();
        expect(roomInfo.players[0].mapEntity).toEqual(jasmine.any(PlayerMapEntity));
        expect(roomInfo.players[1].mapEntity).toBeTruthy();
        expect(roomInfo.players[1].mapEntity).toEqual(jasmine.any(PlayerMapEntity));

        expect(tilesWithSpawn[0].player).toBe(roomInfo.players[0].mapEntity);
        expect(tilesWithSpawn[1].player).toBe(roomInfo.players[1].mapEntity);
    });

    it('should retrieve the current grid from GameMapDataManagerService when getCurrentGrid is called', () => {
        const mockGrid = [
            [new GrassTile(), new GrassTile()],
            [new GrassTile(), new GrassTile()],
        ];

        gameMapDataManagerServiceSpy.getCurrentGrid.and.returnValue(mockGrid);

        const grid = service.getCurrentGrid();

        expect(gameMapDataManagerServiceSpy.getCurrentGrid).toHaveBeenCalled();
        expect(grid).toEqual(mockGrid);
    });

    it('should set possible moves correctly when setPossibleMoves is called', () => {
        const playerCharacter = new PlayerCharacter('Player1');
        playerCharacter.mapEntity = new PlayerMapEntity('headImage');
        playerCharacter.mapEntity.coordinates = { x: 0, y: 0 };

        const possibleMoves = new Map();
        possibleMoves.set(new GrassTile(), [new GrassTile()]);

        gameMapDataManagerServiceSpy.getPossibleMovementTiles.and.returnValue(possibleMoves);

        service.setPossibleMoves(playerCharacter);

        expect(service.userCurrentPossibleMoves).toEqual(possibleMoves);
    });

    it('should show possible moves correctly when showPossibleMoves is called', () => {
        const tile = new GrassTile();
        const path = [new GrassTile()];

        service.userCurrentPossibleMoves.set(tile, path);
        service.showPossibleMoves();

        expect(tile.visibleState).toBe(VisibleState.Valid);
    });

    it('should hide possible moves correctly when hidePossibleMoves is called', () => {
        const tile = new GrassTile();
        const path = [new GrassTile()];

        service.userCurrentPossibleMoves.set(tile, path);
        service.hidePossibleMoves();

        expect(tile.visibleState).toBe(VisibleState.NotSelected);
        expect(service.userCurrentPossibleMoves.size).toBe(0);
    });

    it('should move user player correctly when moveUserPlayer is called', async () => {
        const playerCharacter = new PlayerCharacter('Player1');
        playerCharacter.mapEntity = new PlayerMapEntity('headImage');
        playerCharacter.mapEntity.coordinates = { x: 0, y: 0 };

        service.userCurrentPossibleMoves.set(new GrassTile(), [new GrassTile()]);

        spyOn(service, 'hidePossibleMoves').and.callThrough();
        spyOn(service, 'waitInterval').and.returnValue(Promise.resolve());
        spyOn(service.signalUserStartedMoving, 'next');

        const tile = new GrassTile();
        await service.moveUserPlayer(tile);

        expect(service.hidePossibleMoves).toHaveBeenCalled();
        expect(service.signalUserStartedMoving.next).toHaveBeenCalled();
    });
});
