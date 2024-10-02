// eslint-disable-next-line
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { CreateGameSharedDto } from '@common/interfaces/dto/game/create-game-shared.dto';
import { UpdateGameSharedDto } from '@common/interfaces/dto/game/update-game-shared.dto';
import { GameShared } from '@common/interfaces/game-shared';
import { GameServerCommunicationService } from './game-server-communication.service';

describe('GameServerCommunicationService', () => {
    let service: GameServerCommunicationService;
    let httpTestingController: HttpTestingController;

    let games: GameShared[];
    let createGameDto: CreateGameSharedDto;
    let updateGameDto: UpdateGameSharedDto;

    beforeEach(() => {
        TestBed.configureTestingModule({
            // eslint-disable-next-line
            imports: [HttpClientTestingModule],
            providers: [GameServerCommunicationService],
        });

        service = TestBed.inject(GameServerCommunicationService);
        httpTestingController = TestBed.inject(HttpTestingController);

        games = [
            {
                _id: '1',
                name: 'Test Game',
                description: 'A test game',
                size: MapSize.SMALL,
                mode: GameMode.Classique,
                isVisible: true,
                imageUrl: 'test.jpg',
                tiles: [],
            },
        ];

        createGameDto = {
            name: 'New Game',
            description: 'new game test',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            isVisible: true,
            imageUrl: 'test.jpg',
            tiles: [],
        };

        updateGameDto = { description: 'Updated description' };
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch all games using GET', () => {
        service.getGames().subscribe((response) => {
            expect(response).toEqual(games);
        });

        const req = httpTestingController.expectOne(`${service['baseUrl']}/`);
        expect(req.request.method).toEqual('GET');
        req.flush(games);
    });

    it('should fetch a single game by id using GET', () => {
        service.getGame('1').subscribe((game) => {
            expect(game).toEqual(games[0]);
        });

        const req = httpTestingController.expectOne(`${service['baseUrl']}/1`);
        expect(req.request.method).toEqual('GET');
        req.flush(games[0]);
    });

    it('should add a new game using POST', () => {
        const mockGame: GameShared = { ...createGameDto, _id: 'newGameId' };

        service.addGame(createGameDto).subscribe((game) => {
            expect(game).toEqual(mockGame);
        });

        const req = httpTestingController.expectOne(`${service['baseUrl']}/`);
        expect(req.request.method).toEqual('POST');
        req.flush(mockGame);
    });

    it('should update a game by id using PATCH', () => {
        service.updateGame('1', updateGameDto).subscribe((response) => {
            expect(response).toBeNull();
        });

        const req = httpTestingController.expectOne(`${service['baseUrl']}/1`);
        expect(req.request.method).toEqual('PATCH');
        req.flush(null);
    });

    it('should delete a game by id using DELETE', () => {
        service.deleteGame('1').subscribe((response) => {
            expect(response).toBeNull();
        });

        const req = httpTestingController.expectOne(`${service['baseUrl']}/1`);
        expect(req.request.method).toEqual('DELETE');
        req.flush(null);
    });

    it('should empty the database using DELETE', () => {
        service.emptyDatabase().subscribe((response) => {
            expect(response).toBeNull();
        });

        const req = httpTestingController.expectOne(`${service['baseUrl']}/`);
        expect(req.request.method).toEqual('DELETE');
        req.flush(null);
    });

    it('should return an observable with the given result when called with a value', () => {
        const expectedResult = { key: 'value' };
        const result$ = service['handleError'](expectedResult)();

        result$.subscribe((result) => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should return an observable with undefined when called without a value', () => {
        const result$ = service['handleError']()();

        result$.subscribe((result) => {
            expect(result).toBeUndefined();
        });
    });

    it('should throw error messages for "addGame" operation with error.errors', () => {
        const operation: 'addGame' = 'addGame';
        const error = { error: { errors: ['Error1', 'Error2'] } };

        const handleErrorsFn = (service as any)['handleErrors'](operation);

        let thrownError: any;
        handleErrorsFn(error).subscribe({
            next: () => {},
            error: (err: any) => {
                thrownError = err;
            },
        });

        expect(thrownError).toEqual(['Error1', 'Error2']);
    });

    it('should throw error messages for "updateGame" operation with error array', () => {
        const operation: 'updateGame' = 'updateGame';
        const error = { error: ['Update Error1', 'Update Error2'] };

        const handleErrorsFn = (service as any)['handleErrors'](operation);

        let thrownError: any;
        handleErrorsFn(error).subscribe({
            next: () => {},
            error: (err: any) => {
                thrownError = err;
            },
        });

        expect(thrownError).toEqual(['Update Error1', 'Update Error2']);
    });

    it('should default error message when error structure is unexpected for "addGame"', () => {
        const operation: 'addGame' = 'addGame';
        const error = { error: {} };

        const handleErrorsFn = (service as any)['handleErrors'](operation);

        let thrownError: any;
        handleErrorsFn(error).subscribe({
            next: () => {},
            error: (err: any) => {
                thrownError = err;
            },
        });

        expect(thrownError).toEqual(['Une erreur est survenue']);
    });

    it('should throw default error message when operation is undefined', () => {
        const operation = 'deleteGame' as any;
        const error = { error: 'Some error message' };

        const handleErrorsFn = (service as any)['handleErrors'](operation);

        let thrownError: any;
        handleErrorsFn(error).subscribe({
            next: () => {},
            error: (err: any) => {
                thrownError = err;
            },
        });

        expect(thrownError).toEqual(['Une erreur est survenue']);
    });
});
