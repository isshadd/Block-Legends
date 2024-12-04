import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { CreateGameModalComponent } from '@app/components/administration-page-component/create-game-modal/create-game-modal.component';
import { ListGameComponent } from '@app/components/administration-page-component/list-game/list-game.component';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager/game-map-data-manager.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication/game-server-communication.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { CreateGameSharedDto } from '@common/interfaces/dto/game/create-game-shared.dto';
import { of, throwError } from 'rxjs';
import { AdministrationGameComponent } from './administration-game.component';

describe('AdministrationGameComponent', () => {
    let component: AdministrationGameComponent;
    let fixture: ComponentFixture<AdministrationGameComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let gameServerCommunicationSpy: jasmine.SpyObj<GameServerCommunicationService>;
    let gameMapDataManagerSpy: jasmine.SpyObj<GameMapDataManagerService>;

    const mockGameData: CreateGameSharedDto = {
        name: 'Test Game',
        description: 'Test Description',
        size: MapSize.MEDIUM,
        mode: GameMode.Classique,
        imageUrl: 'http://example.com/image.png',
        isVisible: true,
        tiles: []
    };

    beforeEach(async () => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        gameServerCommunicationSpy = jasmine.createSpyObj('GameServerCommunicationService', ['addGame', 'getGames']);
        gameServerCommunicationSpy.getGames.and.returnValue(of([mockGameData]));
        gameMapDataManagerSpy = jasmine.createSpyObj('GameMapDataManagerService', ['convertJsonToGameShared', 'openErrorModal']);

        await TestBed.configureTestingModule({
            imports: [
                AdministrationGameComponent,
                CommonModule,
                RouterModule,
                RouterLink,
                ListGameComponent,
                NoopAnimationsModule
            ],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: GameServerCommunicationService, useValue: gameServerCommunicationSpy },
                { provide: GameMapDataManagerService, useValue: gameMapDataManagerSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({}),
                        queryParams: of({}),
                        snapshot: {
                            params: {},
                            queryParams: {}
                        }
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AdministrationGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('openCreateGameModal', () => {
        it('should open create game modal', () => {
            component.openCreateGameModal();
            expect(dialogSpy.open).toHaveBeenCalledWith(CreateGameModalComponent);
        });
    });

    describe('triggerFileInput', () => {
        it('should trigger file input click', () => {
            const mockFileInput = document.createElement('input');
            spyOn(document, 'getElementById').and.returnValue(mockFileInput);
            spyOn(mockFileInput, 'click');

            component.triggerFileInput();

            expect(document.getElementById).toHaveBeenCalledWith('fileInput');
            expect(mockFileInput.click).toHaveBeenCalled();
        });

        it('should handle null file input', () => {
            spyOn(document, 'getElementById').and.returnValue(null);
            component.triggerFileInput();
            expect(document.getElementById).toHaveBeenCalledWith('fileInput');
        });
    });

    describe('onFileChange', () => {
        let mockFile: File;
        let mockEvent: Partial<Event>;

        beforeEach(() => {
            mockFile = new File(['content'], 'test.json', { type: 'application/json' });
            mockEvent = {
                target: {
                    files: [mockFile]
                } as unknown as HTMLInputElement
            };
        });

        it('should handle string error from server', fakeAsync(() => {
            const errorMessage = 'Server Error';
            gameMapDataManagerSpy.convertJsonToGameShared.and.returnValue(Promise.resolve(mockGameData));
            gameServerCommunicationSpy.addGame.and.returnValue(throwError(() => errorMessage));

            component.onFileChange(mockEvent as Event);
            tick();

            expect(gameMapDataManagerSpy.openErrorModal).toHaveBeenCalledWith(errorMessage);
        }));

        it('should handle error array from server', fakeAsync(() => {
            const errorArray = ['Error 1', 'Error 2'];
            gameMapDataManagerSpy.convertJsonToGameShared.and.returnValue(Promise.resolve(mockGameData));
            gameServerCommunicationSpy.addGame.and.returnValue(throwError(() => errorArray));

            component.onFileChange(mockEvent as Event);
            tick();

            expect(gameMapDataManagerSpy.openErrorModal).toHaveBeenCalledWith(errorArray);
        }));

        it('should handle error object from server', fakeAsync(() => {
            const errorObj = { message: 'Error message' };
            gameMapDataManagerSpy.convertJsonToGameShared.and.returnValue(Promise.resolve(mockGameData));
            gameServerCommunicationSpy.addGame.and.returnValue(throwError(() => errorObj));

            component.onFileChange(mockEvent as Event);
            tick();

            expect(gameMapDataManagerSpy.openErrorModal).toHaveBeenCalledWith(errorObj.message);
        }));

        it('should handle file conversion error', fakeAsync(() => {
            gameMapDataManagerSpy.convertJsonToGameShared.and.rejectWith(new Error('Conversion Error'));

            component.onFileChange(mockEvent as Event);
            tick();

            expect(gameMapDataManagerSpy.openErrorModal)
                .toHaveBeenCalledWith("Impossible d'importer le fichier <br> Veuillez vérifier le format du fichier.");
        }));

        it('should handle empty file input', fakeAsync(() => {
            const emptyEvent = {
                target: {
                    files: []
                } as unknown as HTMLInputElement
            };

            component.onFileChange(emptyEvent as unknown as Event);
            tick();

            expect(gameMapDataManagerSpy.convertJsonToGameShared).not.toHaveBeenCalled();
        }));
    });

    it('should trigger file input click when triggerFileInput is called', () => {
        const clickSpy = jasmine.createSpy('click'); // Create a spy for the click method
        const fileInputMock = { click: clickSpy } as unknown as HTMLInputElement;

        // Mock the getElementById method to return the mocked file input element
        spyOn(document, 'getElementById').and.returnValue(fileInputMock);

        component.triggerFileInput();

        // Assert that getElementById was called with 'fileInput'
        expect(document.getElementById).toHaveBeenCalledWith('fileInput');
        // Assert that the click method was called on the mock file input
        expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle file input errors and open error modal', async () => {
        const mockFile = new File(['invalid data'], 'invalid-game.json', { type: 'application/json' });
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;

        // Mock services
        spyOn(component['gameMapDataManagerService'], 'convertJsonToGameShared').and.returnValue(Promise.reject(new Error('Invalid file format')));
        const openErrorModalSpy = spyOn(component['gameMapDataManagerService'], 'openErrorModal');

        await component.onFileChange(mockEvent);

        expect(component.selectedFile).toBe(mockFile);
        expect(openErrorModalSpy).toHaveBeenCalledWith("Impossible d'importer le fichier <br> Veuillez vérifier le format du fichier.");
    });

    it('should handle no file selected gracefully', async () => {
        const mockEvent = { target: { files: null } } as unknown as Event;

        await component.onFileChange(mockEvent);

        expect(component.selectedFile).toBeNull();
    });
});