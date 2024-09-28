import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GameServerCommunicationService } from './game-server-communication.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('GameServerCommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: GameServerCommunicationService;
    // let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
        });
        service = TestBed.inject(GameServerCommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        // baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
