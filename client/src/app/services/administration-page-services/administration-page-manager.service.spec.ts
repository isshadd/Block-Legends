import { TestBed } from '@angular/core/testing';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';
import { of } from 'rxjs';
import { AdministrationPageManagerService } from './administration-page-manager.service';

describe('AdministrationPageManagerService', () => {
    let service: AdministrationPageManagerService;
    let gameServerCommunicationServiceSpy: jasmine.SpyObj<GameServerCommunicationService>;

    let games: GameShared[];

    beforeEach(() => {
        const spy = jasmine.createSpyObj('GameServerCommunicationService', ['getGames', 'deleteGame', 'updateGame']);

        games = [
            { _id: '1', name: 'Game 1', description: '', size: MapSize.LARGE, mode: GameMode.CTF, imageUrl: '', isVisible: true, tiles: [] },
            { _id: '2', name: 'Game 2', description: '', size: MapSize.SMALL, mode: GameMode.Classique, imageUrl: '', isVisible: false, tiles: [] },
        ];

        spy.getGames.and.returnValue(of(games));

        TestBed.configureTestingModule({
            providers: [AdministrationPageManagerService, { provide: GameServerCommunicationService, useValue: spy }],
        });

        service = TestBed.inject(AdministrationPageManagerService);
        gameServerCommunicationServiceSpy = TestBed.inject(GameServerCommunicationService) as jasmine.SpyObj<GameServerCommunicationService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set games from the server', () => {
        service.setGames();

        expect(gameServerCommunicationServiceSpy.getGames).toHaveBeenCalled();
        expect(service.games).toEqual(games);
    });

    it('should call deleteGame on the server and remove the game from the list', () => {
        service.games = [...games];
        gameServerCommunicationServiceSpy.deleteGame.and.returnValue(of(undefined));

        service.deleteGame('1');

        expect(gameServerCommunicationServiceSpy.deleteGame).toHaveBeenCalledWith('1');
        expect(service.games.length).toBe(1);
        expect(service.games[0]._id).toBe('2');
    });

    it('should toggle the visibility of the game and call updateGame on the server', () => {
        gameServerCommunicationServiceSpy.updateGame.and.returnValue(of(undefined));

        service.toggleVisibility(games[0]);

        expect(gameServerCommunicationServiceSpy.updateGame).toHaveBeenCalledWith('1', { isVisible: false });
    });

    it('should log an error if game._id is not defined', () => {
        spyOn(console, 'error');
        const mockGame: GameShared = {
            _id: undefined,
            name: 'Game without ID',
            description: '',
            size: MapSize.LARGE,
            mode: GameMode.Classique,
            imageUrl: '',
            isVisible: true,
            tiles: [],
        };

        service.toggleVisibility(mockGame);

        expect(gameServerCommunicationServiceSpy.updateGame).not.toHaveBeenCalled();
    });
});
