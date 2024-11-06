import { CommonModule } from '@angular/common';
// eslint-disable-next-line
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Ajout de HttpClientTestingModule
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
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
        // Créer un spy pour MatDialog
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

        await TestBed.configureTestingModule({
            /* eslint-disable */
            imports: [
                AdministrationGameComponent,
                CommonModule,
                RouterTestingModule,
                HttpClientTestingModule, // Ajout du module de test HTTP
                ListGameComponent,
            ],
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
        // Appeler la méthode
        component.openCreateGameModal();

        // Vérifier que dialog.open a été appelé avec le bon composant
        expect(dialogSpy.open).toHaveBeenCalledWith(CreateGameModalComponent);
        expect(dialogSpy.open).toHaveBeenCalledTimes(1);
    });

    it('should have MatDialog injected', () => {
        expect(component.dialog).toBeTruthy();
        expect(component.dialog).toBe(dialogSpy);
    });
});
