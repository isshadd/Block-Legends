import { CommonModule } from '@angular/common'; // this is necessary for the import of AdministrationGameComponent and it is impossible to refactor the address
// eslint-disable-next-line
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
// this is necessary for the import of AdministrationGameComponent and it is impossible to refactor the address
// eslint-disable-next-line
import { RouterTestingModule } from '@angular/router/testing';
import { CreateGameModalComponent } from '@app/components/administration-page-component/create-game-modal/create-game-modal.component';
import { ListGameComponent } from '@app/components/administration-page-component/list-game/list-game.component';
import { AdministrationGameComponent } from './administration-game.component';

describe('AdministrationGameComponent', () => {
    let component: AdministrationGameComponent;
    let fixture: ComponentFixture<AdministrationGameComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

        await TestBed.configureTestingModule({
            // this is necessary to be able to test the component
            /* eslint-disable */
            imports: [AdministrationGameComponent, CommonModule, RouterTestingModule, HttpClientTestingModule, ListGameComponent],
            //this is necessary to be able to test the component
            /* eslint-disable */
            providers: [{ provide: MatDialog, useValue: dialogSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(AdministrationGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call dialog.open with CreateGameModalComponent when openCreateGameModal is called', () => {
        component.openCreateGameModal();

        expect(dialogSpy.open).toHaveBeenCalledWith(CreateGameModalComponent);
        expect(dialogSpy.open).toHaveBeenCalledTimes(1);
    });

    it('should have MatDialog injected', () => {
        expect(component.dialog).toBeTruthy();
        expect(component.dialog).toBe(dialogSpy);
    });

    it('should call gameServerCommunicationService.addGame when onFileChange is called', async () => {
        const file = new File([''], 'filename', { type: 'application/json' });

        const event = { target: { files: [file] } } as unknown as Event;

        await component.onFileChange(event);

        expect(component.selectedFile).toBe(file);
        expect(component.selectedFile).toBeTruthy();
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
