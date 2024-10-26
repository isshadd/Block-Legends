import { TestBed } from '@angular/core/testing';
import { Tile } from '@app/classes/Tiles/tile';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { GameRoom, WebSocketService } from '@app/services/SocketService/websocket.service';
import { GameShared } from '@common/interfaces/game-shared';
import { of } from 'rxjs';
import { PlayGameBoardManagerService } from './play-game-board-manager.service';

describe('PlayGameBoardManagerService', () => {
    let service: PlayGameBoardManagerService;
    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let gameServerCommunicationServiceSpy: jasmine.SpyObj<GameServerCommunicationService>;

    beforeEach(() => {
        const gameMapDataManagerSpy = jasmine.createSpyObj('GameMapDataManagerService', ['init', 'getCurrentGrid']);
        const webSocketSpy = jasmine.createSpyObj('WebSocketService', ['getRoomInfo']);
        const gameServerSpy = jasmine.createSpyObj('GameServerCommunicationService', ['getGame']);

        const mockRoomInfo: GameRoom = {
            roomId: 'room1',
            players: [],
            accessCode: 0,
        };

        webSocketSpy.getRoomInfo.and.returnValue(mockRoomInfo);
        gameServerSpy.getGame.and.returnValue(of({} as GameShared)); // Mock observable for getGame()

        TestBed.configureTestingModule({
            providers: [
                PlayGameBoardManagerService,
                { provide: GameMapDataManagerService, useValue: gameMapDataManagerSpy },
                { provide: WebSocketService, useValue: webSocketSpy },
                { provide: GameServerCommunicationService, useValue: gameServerSpy },
            ],
        });

        service = TestBed.inject(PlayGameBoardManagerService);
        gameMapDataManagerServiceSpy = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;
        webSocketServiceSpy = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;
        gameServerCommunicationServiceSpy = TestBed.inject(GameServerCommunicationService) as jasmine.SpyObj<GameServerCommunicationService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize game data from the server on construction', () => {
        const mockGame = {} as GameShared;
        gameServerCommunicationServiceSpy.getGame.and.returnValue(of(mockGame));

        expect(webSocketServiceSpy.getRoomInfo).toHaveBeenCalled();
        expect(gameServerCommunicationServiceSpy.getGame).toHaveBeenCalledWith('room1');
        expect(gameMapDataManagerServiceSpy.init).toHaveBeenCalledWith(mockGame);
    });

    it('should return the current grid from gameMapDataManagerService', () => {
        const mockGrid: Tile[][] = [[{} as Tile]];
        gameMapDataManagerServiceSpy.getCurrentGrid.and.returnValue(mockGrid);

        const result = service.getCurrentGrid();

        expect(gameMapDataManagerServiceSpy.getCurrentGrid).toHaveBeenCalled();
        expect(result).toBe(mockGrid);
    });
});
