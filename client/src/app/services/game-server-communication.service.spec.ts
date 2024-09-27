import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GameServerCommunicationService } from './game-server-communication.service';

describe('GameServerCommunicationService', () => {
    let service: GameServerCommunicationService;
    let httpMock: HttpTestingController;
    // let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        service = TestBed.inject(GameServerCommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        // baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
