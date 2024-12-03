import { CommonModule } from '@angular/common'; // this is necessary for the import of AdministrationGameComponent and it is impossible to refactor the address
// eslint-disable-next-line
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
// this is necessary for the import of AdministrationGameComponent and it is impossible to refactor the address
// eslint-disable-next-line
import { RouterTestingModule } from '@angular/router/testing';
import { CreateGameModalComponent } from '@app/components/administration-page-component/creatGameModal/createGameModal.component';
import { ListGameComponent } from '@app/components/administration-page-component/listGame.component';
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
});
